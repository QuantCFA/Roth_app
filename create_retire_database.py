from sqlalchemy import create_engine, Column, Integer, String, ForeignKey, DateTime, Date, Numeric, Float, Text, Boolean, PrimaryKeyConstraint, ForeignKeyConstraint
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.pool import QueuePool  # NEW: Added this import
import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Use DATABASE_URL environment variable (Render sets this), fall back to local for development
DB_URL = os.getenv("DATABASE_URL", "postgresql://postgres:Roth@localhost:5432/retire_db")
engine = create_engine(
    DB_URL,
    poolclass=QueuePool,      # NEW: Add connection pooling
    pool_size=5,              # NEW: Keep 5 connections ready
    max_overflow=5,           # NEW: Allow 5 more if needed (total 10)
    pool_pre_ping=True       # NEW: Test connections before use
)
Base = declarative_base()

# ALL MODEL CLASSES REMAIN EXACTLY THE SAME
class User(Base):
    __tablename__ = "users"
    user_id = Column(Integer, primary_key=True, comment="Unique user identifier")
    username = Column(String(50), unique=True, nullable=False, comment="User's unique username")
    password_hash = Column(String(128), nullable=False, comment="Hashed user password")
    email = Column(String(120), unique=True, nullable=False, comment="email address")
    birth_date = Column(Date, comment="birth date")
    marital_status = Column(String(30), comment="Marital status (S=Single, M=Married Filing Jointly, H=Head of Household)")
    birth_date_spouse = Column(Date, comment="Spouse's birth date")
    trad_savings = Column(Numeric(12,2), default=0.00, comment="Traditional retirement savings balance")
    roth_savings = Column(Numeric(12,2), default=0.00, comment="Roth retirement savings balance")
    stripe_subscription_id = Column(String(100), comment="Stripe subscription ID for recurring payments")
    subscription_status = Column(String(20), default='unpaid', comment="Status: unpaid, paid, expired, cancelled")
    subscription_type = Column(String(20), comment="Type: professional, individual")
    amount_paid = Column(Numeric(10, 2), comment="Amount paid for this subscription period")
    payment_timestamp = Column(DateTime, comment="When payment was processed")
    sub_end_date = Column(Date, comment="Subscription end date")
    calc_count = Column(Integer, default=0, comment="Number of calculations run by user")

class CalculationRun(Base):
    __tablename__ = "calculation_runs"
    run_id = Column(Integer, primary_key=True, comment="Unique calculation run identifier")
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False, comment="Reference to user")
    run_timestamp = Column(DateTime, default=lambda: datetime.datetime.now(datetime.UTC), comment="Timestamp of calculation run")
    description = Column(String(200), comment="Description of calculation run")
    distribution = Column(Numeric(17,8), comment="Annual constant distribution amount")
    annuity_factor_multiple = Column(Numeric(17,8), comment="Annuity factor multiple (M = annuity_factor * years)")
    base_duration = Column(Numeric(17,8), comment="Base duration for conversion calculations")

class Input(Base):
    __tablename__ = "inputs"
    input_id = Column(Integer, primary_key=True, autoincrement=True, comment="Unique input record identifier")
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False, comment="Reference to user")
    run_id = Column(Integer, ForeignKey("calculation_runs.run_id"), nullable=True, comment="Reference to calculation run")
    input_timestamp = Column(DateTime, comment="Timestamp of input submission")
    soc_sec_benefit = Column(Numeric(12,2), default=0.00, comment="Annual Social Security benefit")
    salary = Column(Numeric(12,2), default=0.00, comment="Annual salary income")
    cont_return_assum = Column(Numeric(10,8), default=0.08, comment="Assumed contribution return rate (e.g., 8%)")
    dist_return_assum = Column(Numeric(10,8), default=0.05, comment="Assumed distribution return rate (e.g., 5%)")
    trad_cont_annual = Column(Numeric(12,2), default=0.00, comment="Annual traditional retirement contribution")
    inflation_assum = Column(Numeric(10,8), default=0.015, comment="Assumed inflation rate (e.g., 1.5%)")
    soc_sec_grw_assum = Column(Numeric(10,8), default=0.015, comment="Assumed Social Security growth rate (e.g., 1.5%)")
    retire_tax_hl = Column(Integer, default=1, comment="Retirement tax Low = 1, high = 2")
    contribution_status = Column(String(30), default='S', comment="Filing status while contributing (S=Single, M=Married Filing Jointly, H=Head of Household)")
    distribution_status = Column(String(30), default='S', comment="Filing status while distributing (S=Single, M=Married Filing Jointly, H=Head of Household)")
    life_years = Column(Integer, default=30, comment="Expected years lived in retirement")

class ReferenceTable(Base):
    __tablename__ = "reference_tables"
    table_id = Column(Integer, primary_key=True, comment="Unique reference table record identifier")
    table_name = Column(String(100), nullable=False, comment="Name of reference table")
    row_key = Column(String(100), comment="Row identifier for table")
    column_key = Column(String(100), comment="Column identifier for table")
    value = Column(Text, comment="Value stored in table cell")

class TaxBrackets(Base):
    __tablename__ = "tax_brackets"
    year = Column(Integer, nullable=False, comment="Tax year")
    filing_status = Column(String(30), nullable=False, comment="Filing status (S=Single, M=Married Filing Jointly, H=Head of Household)")
    tax_rate = Column(Numeric(6,3), nullable=False, comment="Tax rate (decimal, e.g., 0.10 for 10%)")
    income_min = Column(Numeric(12,2), nullable=False, comment="Minimum taxable income for bracket")
    income_max = Column(Numeric(12,2), comment="Maximum taxable income for bracket")
    __table_args__ = (
        PrimaryKeyConstraint('year', 'filing_status', 'tax_rate'),
    )

class StandardDeductions(Base):
    __tablename__ = "standard_deductions"
    year = Column(Integer, nullable=False, comment="Tax year")
    filing_status = Column(String(30), nullable=False, comment="Filing status (S=Single, M=Married Filing Jointly, H=Head of Household)")
    std_ded = Column(Numeric(12,2), nullable=False, comment="Standard deduction amount")
    std_ded_65_add = Column(Numeric(12,2), nullable=False, comment="Additional deduction for age 65+")
    __table_args__ = (
        PrimaryKeyConstraint('year', 'filing_status'),
    )

class SSProvisionalIncomeBrackets(Base):
    __tablename__ = "ss_prov_inc_brackets"
    year = Column(Integer, nullable=False, comment="Tax year")
    filing_status = Column(String(30), nullable=False, comment="Filing status (S=Single, M=Married Filing Jointly, H=Head of Household)")
    ss_pct_taxed = Column(Numeric(5,2), nullable=False, comment="Soc Sec Percent Taxed (decimal, e.g., 0.50 for 50%)")
    prov_income_min = Column(Numeric(12,2), nullable=False, comment="Min prov income for bracket - no longer used")
    prov_income_max = Column(Numeric(12,2), comment="Max provisional income for bracket")
    __table_args__ = (
        PrimaryKeyConstraint('year', 'filing_status', 'ss_pct_taxed'),
    )

class RetireYrData(Base):
    __tablename__ = "retire_yr_data"
    run_id = Column(Integer, ForeignKey("calculation_runs.run_id"), primary_key=True, comment="Reference to calculation run")
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False, comment="Reference to user")
    conv_group_num = Column(Integer, default=0, primary_key=True, comment="roth conversion grouping incl init state and std ded")
    year = Column(Date, primary_key=True, comment="Year of calculation")
    age = Column(Integer, default=0, comment="User's age in the year")
    pretax_income = Column(Numeric(17,8), default=0.00, comment="Pre-tax income for the year")
    taxable_income = Column(Numeric(17,8), default=0.00, comment="Taxable income for the year")
    trad_dist = Column(Numeric(17,8), default=0.00, comment="Traditional retirement distribution")
    trad_savings = Column(Numeric(17,8), default=0.00, comment="Traditional retirement savings balance")
    fed_tax = Column(Numeric(17,8), default=0.00, comment="Federal tax liability")
    ss_benefit = Column(Numeric(17,8), default=0.00, comment="Social Security benefit for the year")
    trad_atcf = Column(Numeric(17,8), default=0.00, comment="Traditional after-tax cash flow")
    roth_eq_dist = Column(Numeric(17,8), default=0.00, comment="Roth equivalent distribution")
    roth_savings = Column(Numeric(17,8), default=0.00, comment="Roth retirement savings balance")
    roth_eq_fed_tax = Column(Numeric(17,8), default=0.00, comment="Federal tax on Roth equivalent distribution")
    roth_atcf = Column(Numeric(17,8), default=0.00, comment="Roth after-tax cash flow")
    trad_mtr = Column(Numeric(10,8), default=0.00, comment="Traditional marginal tax rate")
    trad_mtr_adj = Column(Numeric(10,8), default=0.00, comment="Adjusted traditional marginal tax rate")
    trad_cum_comp = Column(Numeric(10,8), default=0.00, comment="Traditional cumulative compensation rate")
    pct_ss_taxed_trad = Column(Numeric(10,8), default=0.00, comment="Percentage of Social Security taxed (traditional)")
    roth_dist_opt = Column(Numeric(17,8), default=0.00, comment="Optimized Roth distribution")
    roth_savings_opt = Column(Numeric(17,8), default=0.00, comment="Optimized Roth savings balance")
    trad_dist_opt = Column(Numeric(17,8), default=0.00, comment="Optimized traditional distribution")
    trad_savings_opt = Column(Numeric(17,8), default=0.00, comment="Optimized traditional savings balance")
    fed_tax_opt = Column(Numeric(17,8), default=0.00, comment="Optimized federal tax liability")
    taxable_income_opt = Column(Numeric(17,8), default=0.00, comment="Optimized taxable income")
    after_tax_dist_opt = Column(Numeric(17,8), default=0.00, comment="Optimized after-tax distribution")
    atcf_opt = Column(Numeric(17,8), default=0.00, comment="Optimized after-tax cash flow")
    trad_mtr_opt = Column(Numeric(10,8), default=0.00, comment="Optimized traditional marginal tax rate")
    trad_mtr_adj_opt = Column(Numeric(10,8), default=0.00, comment="Optimized adjusted traditional marginal tax rate")
    trad_dist_opt_tax_rate = Column(Numeric(10,8), default=0.00, comment="Tax rate for optimized traditional distribution")
    pct_ss_taxed_opt = Column(Numeric(10,8), default=0.00, comment="Percentage of Social Security taxed (optimized)")
    taxable_ss_opt = Column(Numeric(17,8), default=0.00, comment="Taxable Social Security benefit (optimized)")
    taxable_ss_trad = Column(Numeric(17,8), default=0.00, comment="Taxable Social Security benefit (traditional)")
    trad_marg_pct_calc = Column(Numeric(10,8), default=0.00, comment="Calculated traditional marginal percentage")
    trad_mtr_adj_calc = Column(Numeric(10,8), default=0.00, comment="Calculated adjusted traditional marginal tax rate")
    trad_dist_opt_tax_rate_calc = Column(Numeric(10,8), default=0.00, comment="Calculated tax rate for optimized traditional distribution")

class RothConversions(Base):
    __tablename__ = "roth_conversions"
    run_id = Column(Integer, ForeignKey("calculation_runs.run_id"), primary_key=True, comment="Reference to calculation run")
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False, comment="Reference to user")
    conv_group_num = Column(Integer, default=0, primary_key=True, comment="bracket groups incl stdDed but not init state")
    tax_rate_bucket = Column(Numeric(6,3), nullable=False, comment="Tax rate (decimal, e.g., 0.10 for 10%)")
    conv_amt = Column(Numeric(17,8), default=0.00, comment="Roth conversion amount")
    conv_tax = Column(Numeric(17,8), default=0.00, comment="Tax paid on the Roth conversion")
    conv_tax_rate = Column(Numeric(10,8), default=0.00, comment="Conversion tax rate paid")
    dist_mtr_pre_conv = Column(Numeric(10,8), default=0.00, comment="Distribution MTR before converting")
    dist_mtr_post_conv = Column(Numeric(10,8), default=0.00, comment="Distribution MTR after converting")
    total_after_tax_dist_chg_amt = Column(Numeric(17,8), default=0.00, comment="Total change in AT distributions")
    tax_rate_arb_amt = Column(Numeric(17,8), default=0.00, comment="Amount gained on tax rate differential")
    synthetic_roth_cont = Column(Numeric(17,8), default=0.00, comment="Amount earned at portfolio return rate")
    conv_return_multiple = Column(Numeric(17,8), default=0.00, comment="multiple received on conversion tax paid")
    conv_irr = Column(Numeric(10,8), default=0.00, comment="IRR on conversion tax paid")
    conv_duration = Column(Numeric(17,8), default=0.00, comment="Conversion tax payment investment duration")
    distributions_total_pre_conv = Column(Numeric(17,8), default=0.00, comment="Total distribution before converting")
    distributions_total_post_conv = Column(Numeric(17,8), default=0.00, comment="Total distribution after converting")
    conv_dist_tax = Column(Numeric(17,8), default=0.00, comment="Tax paid on distributions from conversion")
    conv_dist_tax_rate = Column(Numeric(10,8), default=0.00, comment="Tax rate on distributions from conversion")

class RothConversionsParts(Base):
    __tablename__ = "roth_conversions_parts"
    run_id = Column(Integer, ForeignKey("calculation_runs.run_id"), primary_key=True, comment="Reference to calculation run")
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False, comment="Reference to user")
    conv_group_num = Column(Integer, default=0, primary_key=True, comment="bracket groups incl stdDed but not init state")
    tax_rate_bucket = Column(Numeric(6,3), nullable=False, comment="Tax rate (decimal, e.g., 0.10 for 10%)")
    conv_amt = Column(Numeric(17,8), default=0.00, comment="Roth conversion amount")
    conv_tax = Column(Numeric(17,8), default=0.00, comment="Tax paid on the Roth conversion")
    conv_tax_rate = Column(Numeric(10,8), default=0.00, comment="Conversion tax rate paid")
    dist_mtr_pre_conv = Column(Numeric(10,8), default=0.00, comment="Distribution MTR before converting")
    dist_mtr_post_conv = Column(Numeric(10,8), default=0.00, comment="Distribution MTR after converting")
    total_after_tax_dist_chg_amt = Column(Numeric(17,8), default=0.00, comment="Total change in AT distributions")
    tax_rate_arb_amt = Column(Numeric(17,8), default=0.00, comment="Amount gained on tax rate differential")
    synthetic_roth_cont = Column(Numeric(17,8), default=0.00, comment="Amount earned at portfolio return rate")
    conv_return_multiple = Column(Numeric(17,8), default=0.00, comment="multiple received on conversion tax paid")
    conv_irr = Column(Numeric(10,8), default=0.00, comment="IRR on conversion tax paid")
    conv_duration = Column(Numeric(17,8), default=0.00, comment="Conversion tax payment investment duration")
    distributions_total_pre_conv = Column(Numeric(17,8), default=0.00, comment="Total distribution before converting")
    distributions_total_post_conv = Column(Numeric(17,8), default=0.00, comment="Total distribution after converting")
    conv_dist_tax = Column(Numeric(17,8), default=0.00, comment="Tax paid on distributions from conversion")
    conv_dist_tax_rate = Column(Numeric(10,8), default=0.00, comment="Tax rate on distributions from conversion")

class UserRatings(Base):
    __tablename__ = "user_ratings"
    rating_id = Column(Integer, primary_key=True, autoincrement=True, comment="Unique rating record ID")
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False, comment="Reference to user who submitted rating")
    star_rating = Column(Integer, comment="Star rating 1-5")
    comment = Column(Text, comment="User comment/feedback (max 1000 chars)")
    rating_timestamp = Column(DateTime, default=lambda: datetime.datetime.now(datetime.UTC), comment="When rating was submitted")
    admin_reply = Column(Text, comment="Admin response to user comment (max 2500 chars)")
    reply_timestamp = Column(DateTime, comment="When admin replied")
    is_public = Column(Boolean, default=False, comment="Whether to display publicly in Q&A section")

# ALL EXISTING TABLE CREATION CODE REMAINS THE SAME
from sqlalchemy import inspect

def init_db():
    """Initialize database tables if they don't exist"""
    try:
        inspector = inspect(engine)
        if not inspector.has_table("users"):
            Base.metadata.create_all(engine)
            print("Database schema created successfully")
    except Exception as e:
        print(f"Database initialization warning: {e}")

SessionLocal = sessionmaker(bind=engine)