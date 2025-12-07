from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from create_retire_database import User, CalculationRun, Input, TaxBrackets, StandardDeductions, SSProvisionalIncomeBrackets
import datetime
import bcrypt
import logging
import os

# Set up logging (console only, no file)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler()  # Console output only
    ]
)
logger = logging.getLogger(__name__)

# Config - use environment variable for database URL (Render will set this)
DB_URL = os.getenv('DATABASE_URL', 'postgresql://postgres:Roth@localhost:5432/retire_db')
engine = create_engine(DB_URL)
Session = sessionmaker(bind=engine)

def load_data():
    session = Session()
    try:

        # TaxBrackets (2024: IRS Revenue Procedure 2023-34, 2025: IRS Revenue Procedure 2024-40)
        tax_brackets = [
            # 2024 Single
            #{"year": 2024, "filing_status": "S", "tax_rate": 0.10, "income_min": 0.00, "income_max": 11600.00},
            #{"year": 2024, "filing_status": "S", "tax_rate": 0.12, "income_min": 11601.00, "income_max": 47150.00},
            #{"year": 2024, "filing_status": "S", "tax_rate": 0.22, "income_min": 47151.00, "income_max": 100525.00},
            #{"year": 2024, "filing_status": "S", "tax_rate": 0.24, "income_min": 100526.00, "income_max": 191950.00},
            #{"year": 2024, "filing_status": "S", "tax_rate": 0.32, "income_min": 191951.00, "income_max": 243725.00},
            #{"year": 2024, "filing_status": "S", "tax_rate": 0.35, "income_min": 243726.00, "income_max": 609350.00},
            #{"year": 2024, "filing_status": "S", "tax_rate": 0.37, "income_min": 609351.00, "income_max": None},
            # 2024 Married Filing Jointly
            #{"year": 2024, "filing_status": "M", "tax_rate": 0.10, "income_min": 0.00, "income_max": 23200.00},
            #{"year": 2024, "filing_status": "M", "tax_rate": 0.12, "income_min": 23201.00, "income_max": 94300.00},
            #{"year": 2024, "filing_status": "M", "tax_rate": 0.22, "income_min": 94301.00, "income_max": 201050.00},
            #{"year": 2024, "filing_status": "M", "tax_rate": 0.24, "income_min": 201051.00, "income_max": 383900.00},
            #{"year": 2024, "filing_status": "M", "tax_rate": 0.32, "income_min": 383901.00, "income_max": 487450.00},
            #{"year": 2024, "filing_status": "M", "tax_rate": 0.35, "income_min": 487451.00, "income_max": 731200.00},
            #{"year": 2024, "filing_status": "M", "tax_rate": 0.37, "income_min": 731201.00, "income_max": None},
            # 2024 Head of Household
            #{"year": 2024, "filing_status": "H", "tax_rate": 0.10, "income_min": 0.00, "income_max": 16550.00},
            #{"year": 2024, "filing_status": "H", "tax_rate": 0.12, "income_min": 16551.00, "income_max": 63100.00},
            #{"year": 2024, "filing_status": "H", "tax_rate": 0.22, "income_min": 63101.00, "income_max": 100500.00},
            #{"year": 2024, "filing_status": "H", "tax_rate": 0.24, "income_min": 100501.00, "income_max": 191950.00},
            #{"year": 2024, "filing_status": "H", "tax_rate": 0.32, "income_min": 191951.00, "income_max": 243700.00},
            #{"year": 2024, "filing_status": "H", "tax_rate": 0.35, "income_min": 243701.00, "income_max": 609350.00},
            #{"year": 2024, "filing_status": "H", "tax_rate": 0.37, "income_min": 609351.00, "income_max": None},
            # 2025 Single
            {"year": 2025, "filing_status": "S", "tax_rate": 0.10, "income_min": 0.00, "income_max": 11925.00},
            {"year": 2025, "filing_status": "S", "tax_rate": 0.12, "income_min": 11926.00, "income_max": 48475.00},
            {"year": 2025, "filing_status": "S", "tax_rate": 0.22, "income_min": 48476.00, "income_max": 103350.00},
            {"year": 2025, "filing_status": "S", "tax_rate": 0.24, "income_min": 103351.00, "income_max": 197300.00},
            {"year": 2025, "filing_status": "S", "tax_rate": 0.32, "income_min": 197301.00, "income_max": 250525.00},
            {"year": 2025, "filing_status": "S", "tax_rate": 0.35, "income_min": 250526.00, "income_max": 626350.00},
            {"year": 2025, "filing_status": "S", "tax_rate": 0.37, "income_min": 626351.00, "income_max": None},
            # 2025 Married Filing Jointly
            {"year": 2025, "filing_status": "M", "tax_rate": 0.10, "income_min": 0.00, "income_max": 23850.00},
            {"year": 2025, "filing_status": "M", "tax_rate": 0.12, "income_min": 23851.00, "income_max": 96950.00},
            {"year": 2025, "filing_status": "M", "tax_rate": 0.22, "income_min": 96951.00, "income_max": 206700.00},
            {"year": 2025, "filing_status": "M", "tax_rate": 0.24, "income_min": 206701.00, "income_max": 394600.00},
            {"year": 2025, "filing_status": "M", "tax_rate": 0.32, "income_min": 394601.00, "income_max": 501050.00},
            {"year": 2025, "filing_status": "M", "tax_rate": 0.35, "income_min": 501051.00, "income_max": 751600.00},
            {"year": 2025, "filing_status": "M", "tax_rate": 0.37, "income_min": 751601.00, "income_max": None},
            # 2025 Head of Household
            {"year": 2025, "filing_status": "H", "tax_rate": 0.10, "income_min": 0.00, "income_max": 17050.00},
            {"year": 2025, "filing_status": "H", "tax_rate": 0.12, "income_min": 17051.00, "income_max": 64650.00},
            {"year": 2025, "filing_status": "H", "tax_rate": 0.22, "income_min": 64651.00, "income_max": 103350.00},
            {"year": 2025, "filing_status": "H", "tax_rate": 0.24, "income_min": 103351.00, "income_max": 197300.00},
            {"year": 2025, "filing_status": "H", "tax_rate": 0.32, "income_min": 197301.00, "income_max": 250525.00},
            {"year": 2025, "filing_status": "H", "tax_rate": 0.35, "income_min": 250526.00, "income_max": 626350.00},
            {"year": 2025, "filing_status": "H", "tax_rate": 0.37, "income_min": 626351.00, "income_max": None},
            # 2026 Single
            {"year": 2026, "filing_status": "S", "tax_rate": 0.10, "income_min": 0.00, "income_max": 12400.00},
            {"year": 2026, "filing_status": "S", "tax_rate": 0.12, "income_min": 12401.00, "income_max": 50400.00},
            {"year": 2026, "filing_status": "S", "tax_rate": 0.22, "income_min": 50401.00, "income_max": 105700.00},
            {"year": 2026, "filing_status": "S", "tax_rate": 0.24, "income_min": 105701.00, "income_max": 201775.00},
            {"year": 2026, "filing_status": "S", "tax_rate": 0.32, "income_min": 201776.00, "income_max": 256225.00},
            {"year": 2026, "filing_status": "S", "tax_rate": 0.35, "income_min": 256226.00, "income_max": 640600.00},
            {"year": 2026, "filing_status": "S", "tax_rate": 0.37, "income_min": 640601.00, "income_max": None},
            # 2026 Married Filing Jointly
            {"year": 2026, "filing_status": "M", "tax_rate": 0.10, "income_min": 0.00, "income_max": 24800.00},
            {"year": 2026, "filing_status": "M", "tax_rate": 0.12, "income_min": 24801.00, "income_max": 100800.00},
            {"year": 2026, "filing_status": "M", "tax_rate": 0.22, "income_min": 100801.00, "income_max": 211400.00},
            {"year": 2026, "filing_status": "M", "tax_rate": 0.24, "income_min": 211401.00, "income_max": 403550.00},
            {"year": 2026, "filing_status": "M", "tax_rate": 0.32, "income_min": 403551.00, "income_max": 512450.00},
            {"year": 2026, "filing_status": "M", "tax_rate": 0.35, "income_min": 512451.00, "income_max": 768700.00},
            {"year": 2026, "filing_status": "M", "tax_rate": 0.37, "income_min": 768701.00, "income_max": None},
            # 2026 Head of Household
            {"year": 2026, "filing_status": "H", "tax_rate": 0.10, "income_min": 0.00, "income_max": 17700.00},
            {"year": 2026, "filing_status": "H", "tax_rate": 0.12, "income_min": 17701.00, "income_max": 67450.00},
            {"year": 2026, "filing_status": "H", "tax_rate": 0.22, "income_min": 67451.00, "income_max": 105700.00},
            {"year": 2026, "filing_status": "H", "tax_rate": 0.24, "income_min": 105701.00, "income_max": 201750.00},
            {"year": 2026, "filing_status": "H", "tax_rate": 0.32, "income_min": 201751.00, "income_max": 256200.00},
            {"year": 2026, "filing_status": "H", "tax_rate": 0.35, "income_min": 256201.00, "income_max": 640600.00},
            {"year": 2026, "filing_status": "H", "tax_rate": 0.37, "income_min": 640601.00, "income_max": None},
        ]
        for bracket in tax_brackets:
            exists = session.query(TaxBrackets).filter_by(
                year=bracket["year"],
                filing_status=bracket["filing_status"],
                tax_rate=bracket["tax_rate"]
            ).first()
            if not exists:
                session.add(TaxBrackets(**bracket))

        # StandardDeductions (2024: IRS Revenue Procedure 2023-34, 2025: IRS Revenue Procedure 2024-40)
        standard_deductions = [
            {"year": 2024, "filing_status": "S", "std_ded": 14600.00, "std_ded_65_add": 1950.00},
            {"year": 2024, "filing_status": "M", "std_ded": 29200.00, "std_ded_65_add": 1550.00},
            {"year": 2024, "filing_status": "H", "std_ded": 21900.00, "std_ded_65_add": 1950.00},
            {"year": 2025, "filing_status": "S", "std_ded": 15750.00, "std_ded_65_add": 2000.00}, # Big, Beautiful bill raised from $15,000
            {"year": 2025, "filing_status": "M", "std_ded": 31500.00, "std_ded_65_add": 1600.00}, # Big, Beautiful bill raised from $30,000
            {"year": 2025, "filing_status": "H", "std_ded": 23625.00, "std_ded_65_add": 2000.00}, # Big, Beautiful bill raised from $22,500
            {"year": 2026, "filing_status": "S", "std_ded": 16100.00, "std_ded_65_add": 2050.00},
            {"year": 2026, "filing_status": "M", "std_ded": 32200.00, "std_ded_65_add": 1650.00},
            {"year": 2026, "filing_status": "H", "std_ded": 24150.00, "std_ded_65_add": 2050.00},
        ]
        for deduction in standard_deductions:
            exists = session.query(StandardDeductions).filter_by(
                year=deduction["year"],
                filing_status=deduction["filing_status"]
            ).first()
            if not exists:
                session.add(StandardDeductions(**deduction))

        # SSProvisionalIncomeBrackets (2025, IRS rules)
        ss_prov_inc_brackets = [
            {"year": 2025, "filing_status": "S", "ss_pct_taxed": 0.00, "prov_income_min": 0.00, "prov_income_max": 25000.00},
            {"year": 2025, "filing_status": "S", "ss_pct_taxed": 0.50, "prov_income_min": 25001.00, "prov_income_max": 34000.00},
            {"year": 2025, "filing_status": "S", "ss_pct_taxed": 0.85, "prov_income_min": 34001.00, "prov_income_max": None},
            {"year": 2025, "filing_status": "M", "ss_pct_taxed": 0.00, "prov_income_min": 0.00, "prov_income_max": 32000.00},
            {"year": 2025, "filing_status": "M", "ss_pct_taxed": 0.50, "prov_income_min": 32001.00, "prov_income_max": 44000.00},
            {"year": 2025, "filing_status": "M", "ss_pct_taxed": 0.85, "prov_income_min": 44001.00, "prov_income_max": None},
            {"year": 2025, "filing_status": "H", "ss_pct_taxed": 0.00, "prov_income_min": 0.00, "prov_income_max": 25000.00},
            {"year": 2025, "filing_status": "H", "ss_pct_taxed": 0.50, "prov_income_min": 25001.00, "prov_income_max": 34000.00},
            {"year": 2025, "filing_status": "H", "ss_pct_taxed": 0.85, "prov_income_min": 34001.00, "prov_income_max": None},
        ]
        for bracket in ss_prov_inc_brackets:
            exists = session.query(SSProvisionalIncomeBrackets).filter_by(
                year=bracket["year"],
                filing_status=bracket["filing_status"],
                ss_pct_taxed=bracket["ss_pct_taxed"]
            ).first()
            if not exists:
                session.add(SSProvisionalIncomeBrackets(**bracket))

        session.commit()
        logger.info("Data loaded successfully")
    except Exception as e:
        session.rollback()
        logger.error(f"Error loading data: {e}")
    finally:
        session.close()

if __name__ == "__main__":
    load_data()