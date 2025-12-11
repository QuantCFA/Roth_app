from sqlalchemy.orm import sessionmaker
from create_retire_database import engine, RetireYrData, User, Input, CalculationRun, SSProvisionalIncomeBrackets, StandardDeductions, TaxBrackets, RothConversions, RothConversionsParts, UserRatings
from datetime import datetime, date, timezone
from decimal import Decimal
from sqlalchemy import func
import numpy_financial as npf
import decimal
import math
import sys
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(message)s',
    handlers=[
        logging.FileHandler('roth_app.log')
    ]
)
logger = logging.getLogger(__name__)

def get_ratings_summary(user_id):
      Session = sessionmaker(bind=engine)
      session = Session()
      try:
          result = session.query(
              func.avg(UserRatings.star_rating).label('avg_rating'),
              func.count(UserRatings.star_rating).label('total_count')
          ).first()

          user_rating = session.query(UserRatings.star_rating)\
              .filter_by(user_id=user_id)\
              .order_by(UserRatings.rating_timestamp.desc())\
              .first()

          return {
              "averageRating": round(float(result.avg_rating or 0), 1),
              "totalRatings": result.total_count,
              "userCurrentRating": user_rating.star_rating if user_rating else None
          }
      finally:
          session.close()

def annuity_factor(interest_rate, years):
    """Returns annuity factor for converting savings to constant annual distribution"""
    if interest_rate == 0:
        return 1 / years

    factor = (1 + interest_rate) ** (-years)
    annuity_factor = interest_rate / (1 - factor)
    return annuity_factor

def calc_constant_distribution(savings_amount, annuity_factor):
    """Returns Constant Annual distribution that drives savings to zero after # of years"""
    distribution = savings_amount * annuity_factor
    return distribution

def calc_taxable_ss(ss_benefit, PI, ss_bracket):
    if ss_bracket:
        ss_pct_taxed = Decimal(str(ss_bracket.ss_pct_taxed)) #0, 0.5, 0.85
        PITM = Decimal('1.0') + ss_pct_taxed
        if ss_pct_taxed == 0:
            taxable_ss = Decimal('0')
        elif ss_pct_taxed == Decimal('0.5'):
            taxable_ss = (PI - ss_bracket.prov_income_min) * ss_pct_taxed
        else:
            base_amt = Decimal('6000') if ss_bracket.filing_status == 'M' else Decimal('4500')
            taxable_ss = base_amt + (PI - ss_bracket.prov_income_min) * ss_pct_taxed
        taxable_ss_cap = ss_benefit * Decimal('0.85')
        if taxable_ss >= taxable_ss_cap:
            taxable_ss = taxable_ss_cap
            PITM = Decimal('1.0')
    else:
        taxable_ss = Decimal('0')
        PITM = Decimal('1.0')
    return taxable_ss, PITM

def get_standard_deduction_for_year(session, year, filing_status, inflation_assum):
    """Returns inflation adjusted Standard deduction and age 65 addition tuple"""
    latest_deduction = session.query(StandardDeductions).filter(
        StandardDeductions.filing_status == filing_status,
        StandardDeductions.year <= year
    ).order_by(StandardDeductions.year.desc()).first()
    if not latest_deduction:
        raise ValueError(f"No standard deduction found for filing_status={filing_status}")
    
    latest_year = latest_deduction.year
    if latest_year == year:
        return latest_deduction.std_ded, latest_deduction.std_ded_65_add
    
    year_diff = year - latest_year
    std_ded = latest_deduction.std_ded * (Decimal('1') + inflation_assum) ** year_diff
    std_ded_65_add = latest_deduction.std_ded_65_add * (Decimal('1') + inflation_assum) ** year_diff
    return std_ded, std_ded_65_add

def get_tax_brackets_for_year(session, year, filing_status, inflation_assum):
    """Returns inflation adjusted brackets if using latest data."""
    latest_brackets = session.query(TaxBrackets).filter(
        TaxBrackets.filing_status == filing_status,
        TaxBrackets.year <= year
    ).order_by(TaxBrackets.year.desc(), TaxBrackets.tax_rate.asc()).all()
    if not latest_brackets:
        return []
    
    latest_year = latest_brackets[0].year
    latest_yr_brackets = [b for b in latest_brackets if b.year == latest_year]
    if latest_year == year:
        return latest_yr_brackets
    
    year_diff = year - latest_year
    adjusted_brackets = []
    for bracket in latest_yr_brackets:
        adjusted_bracket = TaxBrackets(
            year=year,
            filing_status=bracket.filing_status,
            tax_rate=bracket.tax_rate,
            income_max=bracket.income_max * (Decimal('1') + inflation_assum) ** year_diff if bracket.income_max else None
        )
        adjusted_brackets.append(adjusted_bracket)
    return adjusted_brackets

def calculate_federal_taxes(tax_brackets, taxable_income, taxable_income_opt):
    """Calculate federal tax for both regular and optimized taxable income"""
    fed_tax = Decimal('0')
    fed_tax_opt = Decimal('0')
    prev_max = Decimal('0')
    
    for bracket in tax_brackets:
        if taxable_income <= (bracket.income_max or taxable_income):
            fed_tax += (taxable_income - prev_max) * bracket.tax_rate
            income_done = True
        else:
            fed_tax += (bracket.income_max - prev_max) * bracket.tax_rate
            income_done = False
        if taxable_income_opt <= (bracket.income_max or taxable_income_opt):
            fed_tax_opt += (taxable_income_opt - prev_max) * bracket.tax_rate
            income_opt_done = True
        else:
            fed_tax_opt += (bracket.income_max - prev_max) * bracket.tax_rate
            income_opt_done = False
            
        prev_max = bracket.income_max
        if income_done and income_opt_done:
            break
    return fed_tax, fed_tax_opt

def get_mtr(tax_brackets, taxable_income):
    """Get marginal tax rate for next dollar of income"""
    if taxable_income <= 0:
        return Decimal('0')
    for bracket in tax_brackets:
        if (taxable_income + 1) <= (bracket.income_max or taxable_income + 1):
            return bracket.tax_rate
    return Decimal('0')

def calculate_conversion_tax(conv_amt, tax_brackets, std_deduction):
    """Calculate tax on conversion amount"""
    taxable_amt = conv_amt - std_deduction
    if taxable_amt <= 0:
        return Decimal('0')
    
    conv_tax = Decimal('0')
    prev_max = Decimal('0')
    for tax_bracket in tax_brackets:
        if taxable_amt <= (tax_bracket.income_max or taxable_amt):
            taxable_in_bracket = taxable_amt - prev_max
            conv_tax += taxable_in_bracket * tax_bracket.tax_rate
            break
        else:
            taxable_in_bracket = tax_bracket.income_max - prev_max
            conv_tax += taxable_in_bracket * tax_bracket.tax_rate
            prev_max = tax_bracket.income_max
    return conv_tax

def calc_base_duration(interest_rate, years):
    """Present value of annuity formula.  Returns:  Duration of annuity"""
    if interest_rate <= 0:
        return Decimal(str(years / 2))
    factor = (1 + interest_rate) ** (-years)
    annuity_factor = (1 - factor) / interest_rate
    multiple = years / annuity_factor
    base_duration = Decimal('0.00000000') if multiple <= 0 else Decimal(str(min(round(math.log(float(multiple)) / math.log(float(interest_rate) + 1), 8), 99.99999999)))
    return base_duration

def calc_retire_and_conversions(user_id):
    Session = sessionmaker(bind=engine)
    session = Session()
    
    try:
        input_record = session.query(Input).filter_by(user_id=user_id).order_by(Input.input_timestamp.desc()).first()
        if not input_record:
            raise ValueError(f"No input record found for user_id={user_id}")
        
        user = session.query(User).filter_by(user_id=user_id).first()
        if not user:
            raise ValueError(f"No user found for user_id={user_id}")
        
        # Create new calculation run for this analysis
        calc_run = CalculationRun(
            user_id=user_id,
            run_timestamp=datetime.now(timezone.utc)
        )
        session.add(calc_run)
        session.commit()
        session.refresh(calc_run)

        # Update user's calculation count based on actual runs
        user.calc_count = session.query(func.count(CalculationRun.run_id)).filter_by(user_id=user_id).scalar()
        session.commit()

        run_date = calc_run.run_timestamp
        run_year = run_date.year
        retirement_age = 62
        
        current_age = run_year - user.birth_date.year - (1 if (run_date.month, run_date.day) < (user.birth_date.month, user.birth_date.day) else 0)
        start_year = run_year + (retirement_age - current_age)
        if start_year <= run_year:
            start_year = run_year + 1
        
        initial_ss_benefit = input_record.soc_sec_benefit or Decimal('24000.00')
        dist_return_assum = input_record.dist_return_assum or Decimal('0.05')
        ss_growth_rate = input_record.soc_sec_grw_assum or Decimal('0.015')
        distribution_status = input_record.distribution_status or 'S'
        inflation_assum = input_record.inflation_assum or Decimal('0.015')
        life_years = input_record.life_years or 30
        
        # Get tax data
        std_deduction = session.query(StandardDeductions).filter_by(
            filing_status=distribution_status
        ).filter(
            StandardDeductions.year <= run_year
        ).order_by(StandardDeductions.year.desc()).first()
        
        if not std_deduction:
            raise ValueError(f"No standard deduction found for filing_status={distribution_status}")

        tax_brackets = session.query(TaxBrackets).filter_by(
            year=run_year, filing_status=distribution_status
        ).order_by(TaxBrackets.tax_rate.asc()).all()
        if not tax_brackets:
            raise ValueError(f"No tax brackets found for year={run_year} and filing_status={distribution_status}")
        
        # Calculate base duration for conversion metrics
        base_duration = calc_base_duration(dist_return_assum, life_years)
        logger.info(f"base_duration={base_duration}, trad_savings={user.trad_savings}, soc_sec_benefit={initial_ss_benefit}, dist_return={dist_return_assum}, years={life_years}")
        
        # Delete existing records
        delete_retire = session.query(RetireYrData).filter_by(user_id=user_id).delete()
        delete_conv = session.query(RothConversions).filter_by(user_id=user_id).delete()
        delete_parts = session.query(RothConversionsParts).filter_by(user_id=user_id).delete()
        session.commit()
        logger.info(f"Deleted {delete_retire} retire_yr_data, {delete_conv} roth_conversions, {delete_parts} roth_conversions_parts records")
        
        logger.info(f"Initial trad_savings=${user.trad_savings:,.2f}, roth_savings=${user.roth_savings:,.2f}")
        
        # Adjust savings to end of run year if needed
        years_to_run_year_end = run_year - user.birth_date.year - current_age
        if years_to_run_year_end > 0:
            initial_trad_savings = user.trad_savings * (Decimal('1') + dist_return_assum) ** years_to_run_year_end
            initial_roth_savings = user.roth_savings * (Decimal('1') + dist_return_assum) ** years_to_run_year_end
        else:
            initial_trad_savings = user.trad_savings
            initial_roth_savings = user.roth_savings
        
        # Storage for all records and conversion data
        all_retire_records = []
        all_conversions = []
        all_parts_conversions = []
        
        # Storage for conversion calculations
        mtr_map = {}
        dist_map = {}
        fed_tax_map = {}
        trad_dist_opt_map = {}
        tax_map = {0: Decimal('0')}
        amt_map = {0: Decimal('0')}
        
        # Define conversion groups
        conversion_groups = []
        
        # Group 0: Baseline
        conversion_groups.append({
            'conv_group_num': 0,
            'trad_savings': initial_trad_savings,
            'roth_savings': initial_roth_savings,
            'description': 'Baseline'
        })
        
        # Group 1: Standard deduction
        conversion_groups.append({
            'conv_group_num': 1,
            'trad_savings': initial_trad_savings - std_deduction.std_ded,
            'roth_savings': initial_roth_savings + std_deduction.std_ded,
            'description': 'Standard deduction'
        })
        
        # Groups 2+: Tax bracket conversions
        trad_savings = user.trad_savings
        roth_savings = user.roth_savings
        conv_group = 2
        breaking_bracket = None
        
        for bracket in tax_brackets[:-1]:
            if bracket.income_max is not None and trad_savings > (std_deduction.std_ded + bracket.income_max):
                conversion_groups.append({
                    'conv_group_num': conv_group,
                    'trad_savings': initial_trad_savings - (std_deduction.std_ded + bracket.income_max),
                    'roth_savings': initial_roth_savings + (std_deduction.std_ded + bracket.income_max),
                    'description': f'Fill {bracket.tax_rate:.1%} bracket'
                })
                conv_group += 1
            else:
                breaking_bracket = bracket
                break
        
        # Final group: Full conversion
        conversion_groups.append({
            'conv_group_num': conv_group,
            'trad_savings': Decimal('0'),
            'roth_savings': initial_roth_savings + initial_trad_savings,
            'description': 'Full conversion'
        })
        
        # Process each conversion group
        for group_info in conversion_groups:
            conv_group_num = group_info['conv_group_num']
            group_trad_savings = group_info['trad_savings']
            group_roth_savings = group_info['roth_savings']
            
            # Calculate distributions
            af = annuity_factor(dist_return_assum, life_years)
            trad_dist = calc_constant_distribution(group_trad_savings, af)
            roth_dist_opt = calc_constant_distribution(group_roth_savings, af)
            trad_dist_opt = calc_constant_distribution(group_trad_savings, af)
            
            # Create retirement year records for this group
            group_records = []
            group_dists = []
            
            current_year = date(start_year, 12, 31)
            current_age = retirement_age
            current_ss_benefit = initial_ss_benefit
            current_trad_savings = group_trad_savings * (Decimal('1') + dist_return_assum) - trad_dist
            roth_savings_opt = group_roth_savings * (Decimal('1') + dist_return_assum) - roth_dist_opt
            trad_savings_opt = group_trad_savings * (Decimal('1') + dist_return_assum) - trad_dist_opt
            
            for year_offset in range(life_years):
                if year_offset > 0:
                    current_year = date(start_year + year_offset, 12, 31)
                    current_age = retirement_age + year_offset
                    current_ss_benefit = initial_ss_benefit * (Decimal('1') + ss_growth_rate) ** year_offset
                    current_trad_savings = group_trad_savings * (Decimal('1') + dist_return_assum) ** (year_offset + 1) - trad_dist * sum([(Decimal('1') + dist_return_assum) ** i for i in range(year_offset + 1)])
                    roth_savings_opt = group_roth_savings * (Decimal('1') + dist_return_assum) ** (year_offset + 1) - roth_dist_opt * sum([(Decimal('1') + dist_return_assum) ** i for i in range(year_offset + 1)])
                    trad_savings_opt = group_trad_savings * (Decimal('1') + dist_return_assum) ** (year_offset + 1) - trad_dist_opt * sum([(Decimal('1') + dist_return_assum) ** i for i in range(year_offset + 1)])
                
                PI = (current_ss_benefit / Decimal('2')) + trad_dist
                PI_opt = (current_ss_benefit / Decimal('2')) + trad_dist_opt
                SSPI = SSProvisionalIncomeBrackets
                
                ss_bracket = session.query(SSPI).filter(
                    SSPI.filing_status == distribution_status,
                    SSPI.year <= start_year + year_offset,
                    SSPI.prov_income_min <= PI,
                    (SSPI.prov_income_max >= PI) | (SSPI.prov_income_max.is_(None))
                ).order_by(SSPI.year.desc()).first()
                
                ss_bracket_opt = session.query(SSPI).filter(
                    SSPI.filing_status == distribution_status,
                    SSPI.year <= start_year + year_offset,
                    SSPI.prov_income_min <= PI_opt,
                    (SSPI.prov_income_max >= PI_opt) | (SSPI.prov_income_max.is_(None))
                ).order_by(SSPI.year.desc()).first()
                
                taxable_ss_trad, PITM = calc_taxable_ss(current_ss_benefit, PI, ss_bracket)
                taxable_ss_opt, PITM_opt = calc_taxable_ss(current_ss_benefit, PI_opt, ss_bracket_opt)
                pct_ss_taxed_trad = taxable_ss_trad / current_ss_benefit if current_ss_benefit != 0 else Decimal('0')
                pct_ss_taxed_opt = taxable_ss_opt / current_ss_benefit if current_ss_benefit != 0 else Decimal('0')
                
                std_ded, std_ded_65_add = get_standard_deduction_for_year(session, start_year + year_offset, distribution_status, inflation_assum)
                
                taxable_income = trad_dist + taxable_ss_trad - std_ded
                taxable_income_opt = trad_dist_opt + taxable_ss_opt - std_ded
                if current_age >= 65:
                    taxable_income -= std_ded_65_add
                    taxable_income_opt -= std_ded_65_add
                taxable_income = max(taxable_income, Decimal('0'))
                taxable_income_opt = max(taxable_income_opt, Decimal('0'))
                
                year_tax_brackets = get_tax_brackets_for_year(session, start_year + year_offset, distribution_status, inflation_assum)
                fed_tax, fed_tax_opt = calculate_federal_taxes(year_tax_brackets, taxable_income, taxable_income_opt)
                
                after_tax_dist_opt = roth_dist_opt + trad_dist_opt - fed_tax_opt
                atcf_opt = after_tax_dist_opt + current_ss_benefit
                
                trad_mtr = get_mtr(year_tax_brackets, taxable_income)
                trad_mtr_opt = get_mtr(year_tax_brackets, taxable_income_opt)
                
                trad_mtr_adj = trad_mtr * PITM
                trad_mtr_adj_opt = trad_mtr_opt * PITM_opt
                trad_atcf = trad_dist + current_ss_benefit - fed_tax
                trad_cum_comp = (fed_tax / (trad_dist * life_years)) if trad_dist != 0 and life_years != 0 else Decimal('0')
                trad_dist_opt_tax_rate = fed_tax_opt / trad_dist_opt if trad_dist_opt != 0 else Decimal('0')
                
                record = RetireYrData(
                    run_id=calc_run.run_id,
                    user_id=user.user_id,
                    conv_group_num=conv_group_num,
                    year=current_year,
                    age=current_age,
                    trad_dist=trad_dist,
                    roth_dist_opt=roth_dist_opt,
                    trad_dist_opt=trad_dist_opt,
                    trad_savings=current_trad_savings,
                    roth_savings_opt=roth_savings_opt,
                    trad_savings_opt=trad_savings_opt,
                    ss_benefit=current_ss_benefit,
                    taxable_ss_trad=taxable_ss_trad,
                    pct_ss_taxed_trad=pct_ss_taxed_trad,
                    taxable_ss_opt=taxable_ss_opt,
                    pct_ss_taxed_opt=pct_ss_taxed_opt,
                    taxable_income=taxable_income,
                    taxable_income_opt=taxable_income_opt,
                    fed_tax=fed_tax,
                    fed_tax_opt=fed_tax_opt,
                    after_tax_dist_opt=after_tax_dist_opt,
                    atcf_opt=atcf_opt,
                    trad_atcf=trad_atcf,
                    trad_mtr=trad_mtr,
                    trad_mtr_opt=trad_mtr_opt,
                    trad_mtr_adj=trad_mtr_adj,
                    trad_mtr_adj_opt=trad_mtr_adj_opt,
                    trad_dist_opt_tax_rate=trad_dist_opt_tax_rate,
                    trad_cum_comp=trad_cum_comp
                )
                
                group_records.append(record)
                group_dists.append(after_tax_dist_opt)
            
            all_retire_records.extend(group_records)
            
            # Store group statistics for all groups (including group 0)
            avg_mtr = sum(r.trad_mtr_adj_opt for r in group_records) / len(group_records)
            total_dist = sum(r.after_tax_dist_opt for r in group_records)
            total_fed_tax = sum(r.fed_tax_opt for r in group_records)
            total_trad_dist_opt = sum(r.trad_dist_opt for r in group_records)
            
            mtr_map[conv_group_num] = avg_mtr
            dist_map[conv_group_num] = total_dist
            fed_tax_map[conv_group_num] = total_fed_tax
            trad_dist_opt_map[conv_group_num] = total_trad_dist_opt
            
            # Calculate conversion metrics for this group (skip group 0)
            if conv_group_num > 0:
                # Calculate group statistics (already done above)
                # avg_mtr and total_dist already calculated
                
                # Calculate conversion amounts and taxes
                if conv_group_num == 1:
                    # Standard deduction conversion
                    conv_amt = std_deduction.std_ded
                    conv_tax = Decimal('0')
                    tax_rate_bucket = Decimal('0.000')
                    
                    # Use group 0 as baseline for group 1
                    pre_mtr = mtr_map[0]
                    pre_conv_dist = dist_map[0]
                    
                    group_1_pre_conv_dist = pre_conv_dist
                    group_1_pre_mtr = pre_mtr
                    
                else:
                    # Tax bracket conversions
                    if conv_group_num == len(conversion_groups) - 1:
                        # Full conversion
                        conv_amt = user.trad_savings
                        tax_rate_bucket = breaking_bracket.tax_rate if breaking_bracket else tax_brackets[-1].tax_rate
                    else:
                        # Partial bracket fill
                        bracket_idx = conv_group_num - 2
                        bracket = tax_brackets[bracket_idx]
                        conv_amt = std_deduction.std_ded + bracket.income_max
                        tax_rate_bucket = bracket.tax_rate
                    
                    conv_tax = calculate_conversion_tax(conv_amt, tax_brackets, std_deduction.std_ded)
                    pre_mtr = group_1_pre_mtr
                    pre_conv_dist = group_1_pre_conv_dist
                
                conv_tax_rate = conv_tax / conv_amt if conv_amt != 0 else Decimal('0')
                tax_map[conv_group_num] = conv_tax
                amt_map[conv_group_num] = conv_amt
                
                total_after_tax = total_dist - pre_conv_dist
                
                # Calculate IRR and duration
                if conv_group_num == 1:
                    conv_return_multiple = Decimal('99.99999999')
                    conv_irr = Decimal('0.99999999')
                    conv_duration = Decimal('0.00000000')
                else:
                    conv_return_multiple = total_after_tax / conv_tax if conv_tax != 0 else Decimal('0')
                    
                    # IRR calculation
                    group_0_dists = [r.after_tax_dist_opt for r in all_retire_records if r.conv_group_num == 0]
                    current_dists = group_dists
                    
                    if len(current_dists) == len(group_0_dists) == life_years:
                        diffs = [c - g0 for c, g0 in zip(current_dists, group_0_dists)]
                        cash_flows = [float(conv_tax * -1)] + [float(d) for d in diffs]
                        irr_value = npf.irr(cash_flows)
                        if irr_value is not None and not math.isnan(irr_value) and not math.isinf(irr_value):
                            conv_irr = Decimal(str(min(round(irr_value, 8), 0.99999999)))
                        else:
                            conv_irr = Decimal('0')
                    else:
                        conv_irr = Decimal('0')
                    
                    # Duration calculation
                    try:
                        if conv_irr <= -1 or conv_return_multiple <= 0:
                            conv_duration = Decimal('0.00000000')
                        else:
                            log_base = float(conv_irr) + 1
                            log_multiple = float(conv_return_multiple)
                            if log_base > 0 and log_multiple > 0:
                                duration_calc = math.log(log_multiple) / math.log(log_base)
                                conv_duration = Decimal(str(min(round(duration_calc, 8), 99.99999999)))
                            else:
                                conv_duration = Decimal('0.00000000')
                    except (ValueError, OverflowError, decimal.InvalidOperation):
                        conv_duration = Decimal('0.00000000')
                
                synthetic_roth_cont = conv_tax * Decimal(str((1 + float(dist_return_assum)) ** float(base_duration)))
                tax_rate_arb_amt = total_after_tax - synthetic_roth_cont
                if abs(tax_rate_arb_amt) < Decimal('0.0001'):
                    tax_rate_arb_amt = Decimal('0')
                
                # Calculate conv_dist_tax: fed_tax of group 0 minus fed_tax of current group
                conv_dist_tax = fed_tax_map.get(0, Decimal('0')) - fed_tax_map.get(conv_group_num, Decimal('0'))
                conv_trad_dist_opt = trad_dist_opt_map.get(0, Decimal('0')) - trad_dist_opt_map.get(conv_group_num, Decimal('0'))
                
                # Calculate conv_dist_tax_rate
                conv_dist_tax_rate = conv_dist_tax / conv_trad_dist_opt if conv_trad_dist_opt != 0 else Decimal('0')
                
                conv_data = {
                    'run_id': calc_run.run_id,
                    'user_id': user.user_id,
                    'conv_group_num': conv_group_num,
                    'tax_rate_bucket': tax_rate_bucket,
                    'conv_amt': conv_amt,
                    'conv_tax': conv_tax,
                    'conv_tax_rate': conv_tax_rate,
                    'dist_mtr_pre_conv': pre_mtr,
                    'dist_mtr_post_conv': avg_mtr,
                    'distributions_total_pre_conv': pre_conv_dist,
                    'distributions_total_post_conv': total_dist,
                    'total_after_tax_dist_chg_amt': total_after_tax,
                    'conv_return_multiple': Decimal(str(min(round(conv_return_multiple, 8), 99.99999999))),
                    'conv_irr': conv_irr,
                    'conv_duration': conv_duration,
                    'synthetic_roth_cont': synthetic_roth_cont,
                    'tax_rate_arb_amt': tax_rate_arb_amt,
                    'conv_dist_tax': conv_dist_tax,
                    'conv_dist_tax_rate': conv_dist_tax_rate
                }
                all_conversions.append(conv_data)
                
                # Parts conversions
                if conv_group_num == 1:
                    # For group 1, use group 0 as baseline
                    parts_pre_dist = dist_map[0]
                    parts_pre_mtr = mtr_map[0]
                else:
                    # For groups 2+, use previous group as baseline
                    parts_pre_dist = dist_map.get(conv_group_num - 1, Decimal('0'))
                    parts_pre_mtr = mtr_map.get(conv_group_num - 1, Decimal('0'))
                
                tot_aft_tax_dist_chg = total_dist - parts_pre_dist
                if tot_aft_tax_dist_chg < .00000001:
                    tot_aft_tax_dist_chg = Decimal('0')

                conv_tax_parts = conv_tax - tax_map.get(conv_group_num - 1, Decimal('0'))
                parts_conv_amt = conv_amt - amt_map.get(conv_group_num - 1, Decimal('0'))
                parts_conv_tax_rate = conv_tax_parts / parts_conv_amt if parts_conv_amt != 0 else Decimal('0')
                
                # Parts IRR calculation
                if conv_group_num == 1:
                    parts_conv_irr = Decimal('0.99999999')
                    parts_return_multiple = Decimal('99.99999999')
                    parts_duration = Decimal('0.00000000')
                else:
                    # Use the exact same logic as original populate program
                    current_dists = group_dists
                    prior_dists = [r.after_tax_dist_opt for r in all_retire_records if r.conv_group_num == conv_group_num - 1]
                    
                    if len(current_dists) == len(prior_dists) == life_years:
                        parts_diffs = [c - p for c, p in zip(current_dists, prior_dists)]
                        sum_parts_diffs = sum(parts_diffs) < .00000001
                        parts_cash_flows = [float(conv_tax_parts * -1)] + [float(d) for d in parts_diffs]
                        #logger.info(f"parts_cash_flows = {[f'{cf:,.2f}' for cf in parts_cash_flows]}")
                        parts_irr_value = npf.irr(parts_cash_flows)
                        if parts_irr_value is not None and not math.isnan(parts_irr_value) and not math.isinf(parts_irr_value) and not sum_parts_diffs:
                            parts_conv_irr = Decimal(str(min(round(parts_irr_value, 8), 0.99999999)))
                        else:
                            parts_conv_irr = Decimal('-1')  # Conversion tax paid results in zero AFTC increase or total loss
                    else:
                        parts_conv_irr = Decimal('0')
                    logger.info(f"parts_pre_dist={parts_pre_dist}, total_dist={total_dist}")
                    
                    parts_return_multiple = Decimal(str(min(round((tot_aft_tax_dist_chg) / conv_tax_parts, 8), 99.99999999))) if conv_tax_parts != 0 else Decimal('0')
                    #parts_return_multiple = Decimal(str(min(round((total_dist - parts_pre_dist) / conv_tax_parts, 8), 99.99999999))) if conv_tax_parts != 0 else Decimal('0')
                    
                    try:
                        if parts_conv_irr <= -1 or parts_return_multiple <= 0:
                            parts_duration = Decimal('0.00000000')
                        else:
                            log_base = float(parts_conv_irr) + 1
                            log_multiple = float(parts_return_multiple)
                            if log_base > 0 and log_multiple > 0:
                                duration_calc = math.log(log_multiple) / math.log(log_base)
                                parts_duration = Decimal(str(min(round(duration_calc, 8), 99.99999999)))
                            else:
                                parts_duration = Decimal('0.00000000')
                    except (ValueError, OverflowError, decimal.InvalidOperation):
                        parts_duration = Decimal('0.00000000')
                
                parts_synthetic_roth_cont = conv_tax_parts * Decimal(str((1 + float(dist_return_assum)) ** float(base_duration)))
                parts_tax_rate_arb_amt = (total_dist - parts_pre_dist) - parts_synthetic_roth_cont
                if abs(parts_tax_rate_arb_amt) < Decimal('0.0001'):
                    parts_tax_rate_arb_amt = Decimal('0')

                # Calculate conv_dist_tax_parts: fed_tax of (r-1) minus fed_tax of (r)
                if conv_group_num == 1:
                    # For group 1, compare to group 0
                    conv_dist_tax_parts = fed_tax_map.get(0, Decimal('0')) - fed_tax_map.get(1, Decimal('0'))
                    conv_trad_dist_opt_parts = trad_dist_opt_map.get(0, Decimal('0')) - trad_dist_opt_map.get(1, Decimal('0'))
                else:
                    # For groups 2+, compare to previous group
                    conv_dist_tax_parts = fed_tax_map.get(conv_group_num - 1, Decimal('0')) - fed_tax_map.get(conv_group_num, Decimal('0'))
                    conv_trad_dist_opt_parts = trad_dist_opt_map.get(conv_group_num - 1, Decimal('0')) - trad_dist_opt_map.get(conv_group_num, Decimal('0'))

                # Calculate conv_dist_tax_rate_parts
                conv_dist_tax_rate_parts = conv_dist_tax_parts / conv_trad_dist_opt_parts if conv_trad_dist_opt_parts != 0 else Decimal('0')

                parts_data = {
                    'run_id': calc_run.run_id,
                    'user_id': user.user_id,
                    'conv_group_num': conv_group_num,
                    'tax_rate_bucket': tax_rate_bucket,
                    'distributions_total_pre_conv': parts_pre_dist,
                    'distributions_total_post_conv': total_dist,
                    #'total_after_tax_dist_chg_amt': total_dist - parts_pre_dist,
                    'total_after_tax_dist_chg_amt': tot_aft_tax_dist_chg,
                    'conv_tax': conv_tax_parts,
                    'dist_mtr_pre_conv': parts_pre_mtr,
                    'dist_mtr_post_conv': avg_mtr,
                    'conv_return_multiple': parts_return_multiple,
                    'conv_irr': parts_conv_irr,
                    'conv_amt': parts_conv_amt,
                    'conv_tax_rate': parts_conv_tax_rate,
                    'conv_duration': parts_duration,
                    'synthetic_roth_cont': parts_synthetic_roth_cont,
                    'tax_rate_arb_amt': parts_tax_rate_arb_amt,
                    'conv_dist_tax': conv_dist_tax_parts,
                    'conv_dist_tax_rate': conv_dist_tax_rate_parts
                }
                all_parts_conversions.append(parts_data)
        
        # Bulk insert all records
        session.bulk_insert_mappings(RetireYrData, [r.__dict__ for r in all_retire_records])
        session.bulk_insert_mappings(RothConversions, all_conversions)
        session.bulk_insert_mappings(RothConversionsParts, all_parts_conversions)
        session.commit()
        
        logger.info(f"Successfully created {len(all_retire_records)} retire_yr_data records, {len(all_conversions)} roth_conversions records, {len(all_parts_conversions)} roth_conversions_parts records")
        
        # Log retire_yr_data records for all groups (all records)
        logger.info(
            f"{'#':>3} "
            f"{'Run':>5} "
            f"{'User':>5} "
            f"{'Grp':>4} "
            f"{'Year':>12} "
            f"{'Age':>4} "
            f"{'Roth_Dist':>12} "
            f"{'Trad_Dist':>12} "
            f"{'Roth_Savg':>10} "
            f"{'Trad_Savg':>10} "
            f"{'SS_Bene':>10} "
            f"{'Tax_SS':>10} "
            f"{'%SS_Tax':>9} "
            f"{'Tax_Income':>12} "
            f"{'Fed_Tax':>12}"
            f"{'Aft_Tax_Dist':>12} "
            f"{'MTR':>10} "
            f"{'MTR_Adj':>10}"
        )
        
        # Log all retirement year data records
        for idx, rec in enumerate(all_retire_records, 1):
            logger.info(
                f"{idx:3d} "
                f"{rec.run_id:5d} "
                f"{rec.user_id:5d} "
                f"{rec.conv_group_num:4d} "
                f"{str(rec.year):>12} "
                f"{rec.age:4d} "
                f"{rec.roth_dist_opt:12,.2f} "
                f"{rec.trad_dist_opt:12,.2f} "
                f"{rec.roth_savings_opt:10,.0f} "
                f"{rec.trad_savings_opt:10,.0f} "
                f"{rec.ss_benefit:10,.0f} "
                f"{rec.taxable_ss_opt:10,.0f} "
                f"{rec.pct_ss_taxed_opt:9.3%} "
                f"{rec.taxable_income_opt:12,.2f} "
                f"{rec.fed_tax_opt:12,.2f}"
                f"{rec.after_tax_dist_opt:12,.0f} "
                f"{rec.trad_mtr_opt:10.3%} "
                f"{rec.trad_mtr_adj_opt:10.3%}"
            )
        
        # Log conversion data
        logger.info(f"Inserted {len(all_conversions)} records into roth_conversions and {len(all_parts_conversions)} into roth_conversions_parts for run_id={calc_run.run_id}")
        logger.info(
            f"{'Grp':>3} "
            f"{'Rate':>7} "
            f"{'Conv_Amt':>10} "
            f"{'Conv_Tax':>10} "
            f"{'Tax_Grow':>10} "
            f"{'Rate_Swap':>10} "
            f"{'Tot_Payout':>10} "
            f"{'Ret_Mult':>9} "
            f"{'Conv_IRR':>10} "
            f"{'Conv_Dur':>10} "
            f"{'Conv_Rate':>10} "
            f"{'MTR_Pre':>10} "
            f"{'MTR_Post':>10}"
            f"{'Dist_Pre':>12} "
            f"{'Dist_Post':>12}"
        )
        logger.info("-" * 140)
        
        for rec in all_conversions:
            logger.info(
                f"{rec['conv_group_num']:3d} "
                f"{rec['tax_rate_bucket']:7.3f} "
                f"{rec['conv_amt']:10,.0f} "
                f"{rec['conv_tax']:10,.0f} "
                f"{rec['synthetic_roth_cont']:10,.0f} "
                f"{rec['tax_rate_arb_amt']:10,.0f} "
                f"{rec['total_after_tax_dist_chg_amt']:10,.0f} "
                f"{rec['conv_return_multiple']:9.2f} "
                f"{rec['conv_irr']:10.2%} "
                f"{rec['conv_duration']:10.2f} "
                f"{rec['conv_tax_rate']:10.2%} "
                f"{rec['dist_mtr_pre_conv']:10.3%} "
                f"{rec['dist_mtr_post_conv']:10.3%}"
                f"{rec['distributions_total_pre_conv']:12,.0f}"
                f"{rec['distributions_total_post_conv']:12,.0f}"
            )
        
        logger.info("-" * 140)
        
        for rec in all_parts_conversions:
            logger.info(
                f"{rec['conv_group_num']:3d} "
                f"{rec['tax_rate_bucket']:7.3f} "
                f"{rec['conv_amt']:10,.0f} "
                f"{rec['conv_tax']:10,.0f} "
                f"{rec['synthetic_roth_cont']:10,.0f} "
                f"{rec['tax_rate_arb_amt']:10,.0f} "
                f"{rec['total_after_tax_dist_chg_amt']:10,.0f} "
                f"{rec['conv_return_multiple']:9.2f} "
                f"{rec['conv_irr']:10.2%} "
                f"{rec['conv_duration']:10.2f} "
                f"{rec['conv_tax_rate']:10.2%} "
                f"{rec['dist_mtr_pre_conv']:10.3%} "
                f"{rec['dist_mtr_post_conv']:10.3%}"
                f"{rec['distributions_total_pre_conv']:12,.0f}"
                f"{rec['distributions_total_post_conv']:12,.0f}"
            )
        
        logger.info("-" * 140)

        # Calculate distribution schedule values
        af = annuity_factor(dist_return_assum, life_years)
        distribution = calc_constant_distribution(initial_trad_savings, af)
        annuity_factor_multiple = af * life_years

        # Update calculation run with distribution schedule values
        calc_run.distribution = distribution
        calc_run.annuity_factor_multiple = annuity_factor_multiple
        calc_run.base_duration = base_duration

        # Update user's inputs to reference this completed calculation
        input_record.run_id = calc_run.run_id
        session.commit()

        return {
            "run_id": calc_run.run_id,
            "records_created": len(all_retire_records),
            "distribution": float(distribution),
            "annuity_factor_multiple": float(annuity_factor_multiple),
            "base_duration": float(base_duration),
        }
    
    except Exception as e:
        session.rollback()
        logger.error(f"Error in calc_retire_and_conversions: {e}")
        import traceback
        traceback.print_exc()
        return {"run_id": None, "records_created": 0}
    
    finally:
        session.close()

if __name__ == "__main__":
    if len(sys.argv) != 2:
        logger.error("Usage: python calc_retire_and_conversions.py <user_id>")
        sys.exit(1)
    
    user_id = int(sys.argv[1])
    logger.info(f"=== calc_retire_and_conversions.py started at {datetime.now()} for user_id={user_id} ===")
    
    result = calc_retire_and_conversions(user_id)
    
    if result["records_created"] > 0:
        logger.info(f"Successfully completed processing for user_id={user_id}")
    else:
        logger.error(f"Failed to process user_id={user_id}")
        sys.exit(1)