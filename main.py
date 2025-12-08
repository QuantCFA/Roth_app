from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from pydantic import BaseModel
from sqlalchemy import create_engine, func
from sqlalchemy.orm import sessionmaker
from create_retire_database import User, CalculationRun, Input, RothConversions, RothConversionsParts, StandardDeductions, TaxBrackets, RetireYrData, UserRatings, init_db
from calc_roth_conv_data import calc_retire_and_conversions
from decimal import Decimal
import bcrypt
import datetime
import os
from dotenv import load_dotenv
import stripe

# Load environment variables from .env file
load_dotenv()

# Initialize Stripe with your secret key
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")

app = FastAPI()

# Configure CORS for production and local development
allowed_origins = [
    "http://localhost:3000",
    "http://localhost:8000",
    "https://rothgpt.com",
    "https://www.rothgpt.com",
    "https://rothconv.com",
    "https://www.rothconv.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    init_db()

# Database engine is already created in create_retire_database.py
# It uses DATABASE_URL environment variable if available

class UserCreate(BaseModel):
    username: str
    password: str
    email: str
    birth_date: str
    marital_status: str
    birth_date_spouse: str | None
    trad_savings: float
    roth_savings: float

class InputCreate(BaseModel):
    user_id: int
    soc_sec_benefit: float
    salary: float
    cont_return_assum: float
    dist_return_assum: float
    trad_cont_annual: float
    inflation_assum: float
    soc_sec_grw_assum: float
    retire_tax_hl: int
    contribution_status: str
    distribution_status: str
    life_years: int
    trad_savings: float
    roth_savings: float

class LoginRequest(BaseModel):
    username: str
    password: str

class UserUpdate(BaseModel):
    email: str | None = None
    birth_date: str | None = None
    marital_status: str | None = None
    birth_date_spouse: str | None = None

class PasswordChange(BaseModel):
    current_password: str
    new_password: str

class RatingCreate(BaseModel):
    user_id: int
    star_rating: int
    comment: str = ""

@app.post("/users")
def create_user(user: UserCreate):
    session = SessionLocal()
    try:
        if session.query(User).filter_by(username=user.username).first():
            raise HTTPException(status_code=400, detail="Username already exists")
        if session.query(User).filter_by(email=user.email).first():
            raise HTTPException(status_code=400, detail="Email already exists")
        
        hashed_password = bcrypt.hashpw(user.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        birth_date = datetime.datetime.strptime(user.birth_date, '%Y-%m-%d').date()
        birth_date_spouse = (
            datetime.datetime.strptime(user.birth_date_spouse, '%Y-%m-%d').date()
            if user.birth_date_spouse else None
        )
        
        db_user = User(
            username=user.username,
            password_hash=hashed_password,
            email=user.email,
            birth_date=birth_date,
            marital_status=user.marital_status,
            birth_date_spouse=birth_date_spouse,
            trad_savings=Decimal(str(user.trad_savings)),
            roth_savings=Decimal(str(user.roth_savings)),
        )
        session.add(db_user)
        session.commit()
        session.refresh(db_user)
        return {"user_id": db_user.user_id}
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        session.close()

@app.post("/inputs")
def create_input(input_data: InputCreate):
    session = SessionLocal()
    try:
        user = session.query(User).filter_by(user_id=input_data.user_id).first()
        if not user:
            raise HTTPException(status_code=400, detail="User not found")
        
        user.trad_savings = Decimal(str(input_data.trad_savings))
        user.roth_savings = Decimal(str(input_data.roth_savings))

        calc_run = session.query(CalculationRun).filter_by(user_id=input_data.user_id).order_by(CalculationRun.run_timestamp.desc()).first()
        
        db_input = session.query(Input).filter_by(user_id=input_data.user_id).first()
        if db_input:
            db_input.run_id = calc_run.run_id if calc_run else None
            db_input.input_timestamp = datetime.datetime.now(datetime.UTC)
            db_input.soc_sec_benefit = Decimal(str(input_data.soc_sec_benefit))
            db_input.salary = Decimal(str(input_data.salary))
            db_input.cont_return_assum = Decimal(str(input_data.cont_return_assum))
            db_input.dist_return_assum = Decimal(str(input_data.dist_return_assum))
            db_input.trad_cont_annual = Decimal(str(input_data.trad_cont_annual))
            db_input.inflation_assum = Decimal(str(input_data.inflation_assum))
            db_input.soc_sec_grw_assum = Decimal(str(input_data.soc_sec_grw_assum))
            db_input.retire_tax_hl = input_data.retire_tax_hl
            db_input.contribution_status = input_data.contribution_status
            db_input.distribution_status = input_data.distribution_status
            db_input.life_years = input_data.life_years
        else:
            db_input = Input(
                user_id=input_data.user_id,
                run_id=calc_run.run_id if calc_run else None,
                input_timestamp=datetime.datetime.now(datetime.UTC),
                soc_sec_benefit=Decimal(str(input_data.soc_sec_benefit)),
                salary=Decimal(str(input_data.salary)),
                cont_return_assum=Decimal(str(input_data.cont_return_assum)),
                dist_return_assum=Decimal(str(input_data.dist_return_assum)),
                trad_cont_annual=Decimal(str(input_data.trad_cont_annual)),
                inflation_assum=Decimal(str(input_data.inflation_assum)),
                soc_sec_grw_assum=Decimal(str(input_data.soc_sec_grw_assum)),
                retire_tax_hl=input_data.retire_tax_hl,
                contribution_status=input_data.contribution_status,
                distribution_status=input_data.distribution_status,
                life_years=input_data.life_years,
            )
            session.add(db_input)
        
        session.commit()
        session.refresh(db_input)
        return {"message": "Input and savings updated successfully", "input_id": db_input.input_id}
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create or update input: {str(e)}")
    finally:
        session.close()

@app.post("/calculate-yr-data/{user_id}")
def calculate_yr_data(user_id: int):
    session = SessionLocal()
    try:
        result = calc_retire_and_conversions(user_id)

        # Retrieve updated calc_count
        user = session.query(User).filter_by(user_id=user_id).first()
        calc_count = user.calc_count if user else 0

        return {
            "run_id": result["run_id"],
            "records_created": result["records_created"],
            "calc_count": calc_count,
            "subscription_status": user.subscription_status or "unpaid",
            "distribution": result.get("distribution"),
            "annuity_factor_multiple": result.get("annuity_factor_multiple"),
            "base_duration": result.get("base_duration")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to calculate retirement data: {str(e)}")
    finally:
        session.close()

@app.get("/roth_conversions/{run_id}")
def get_roth_conversions(run_id: int):
    session = SessionLocal()
    try:
        conversions = session.query(RothConversions).filter_by(run_id=run_id).order_by(RothConversions.conv_group_num).all()
        print(f"Queried roth_conversions for run_id={run_id}, found {len(conversions)} records")
        results = [
            {
                "run_id": c.run_id,
                "user_id": c.user_id,
                "conv_group_num": c.conv_group_num,
                "tax_rate_bucket": float(c.tax_rate_bucket),
                "conv_amt": float(c.conv_amt),
                "conv_tax": float(c.conv_tax),
                "conv_tax_rate": float(c.conv_tax_rate),
                "dist_mtr_pre_conv": float(c.dist_mtr_pre_conv),
                "dist_mtr_post_conv": float(c.dist_mtr_post_conv),
                "conv_dist_tax": float(c.conv_dist_tax),
                "conv_dist_tax_rate": float(c.conv_dist_tax_rate),
                "distributions_total_pre_conv": float(c.distributions_total_pre_conv),
                "distributions_total_post_conv": float(c.distributions_total_post_conv),
                "total_after_tax_dist_chg_amt": float(c.total_after_tax_dist_chg_amt),
                "conv_return_multiple": float(c.conv_return_multiple),
                "conv_irr": float(c.conv_irr),
                "conv_duration": float(c.conv_duration),
                "synthetic_roth_cont": float(c.synthetic_roth_cont),
                "tax_rate_arb_amt": float(c.tax_rate_arb_amt)
            } for c in conversions
        ]
        return results
    except Exception as e:
        print(f"Error in get_roth_conversions for run_id={run_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch conversions: {str(e)}")
    finally:
        session.close()

@app.get("/roth_conversions_parts/{run_id}")
def get_roth_conversions_parts(run_id: int):
    session = SessionLocal()
    try:
        parts = session.query(RothConversionsParts).filter_by(run_id=run_id).order_by(RothConversionsParts.conv_group_num).all()
        print(f"Queried roth_conversions_parts for run_id={run_id}, found {len(parts)} records")
        results = [
            {
                "run_id": p.run_id,
                "user_id": p.user_id,
                "conv_group_num": p.conv_group_num,
                "tax_rate_bucket": float(p.tax_rate_bucket),
                "conv_amt": float(p.conv_amt),
                "conv_tax": float(p.conv_tax),
                "conv_tax_rate": float(p.conv_tax_rate),
                "dist_mtr_pre_conv": float(p.dist_mtr_pre_conv),
                "dist_mtr_post_conv": float(p.dist_mtr_post_conv),
                "conv_dist_tax": float(p.conv_dist_tax),
                "conv_dist_tax_rate": float(p.conv_dist_tax_rate),
                "distributions_total_pre_conv": float(p.distributions_total_pre_conv),
                "distributions_total_post_conv": float(p.distributions_total_post_conv),
                "total_after_tax_dist_chg_amt": float(p.total_after_tax_dist_chg_amt),
                "conv_return_multiple": float(p.conv_return_multiple),
                "conv_irr": float(p.conv_irr),
                "conv_duration": float(p.conv_duration),
                "synthetic_roth_cont": float(p.synthetic_roth_cont),
                "tax_rate_arb_amt": float(p.tax_rate_arb_amt)
            } for p in parts
        ]
        return results
    except Exception as e:
        print(f"Error in get_roth_conversions_parts for run_id={run_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch parts: {str(e)}")
    finally:
        session.close()

@app.get("/retire_yr_data/{run_id}")
def get_retire_yr_data(run_id: int):
    session = SessionLocal()
    try:
        records = session.query(RetireYrData).filter_by(run_id=run_id, conv_group_num=0).order_by(RetireYrData.year).all()
        if not records:
            raise HTTPException(status_code=404, detail="No retire_yr_data found for run_id with conv_group_num=0")
        results = [
            {
                "year": r.year.isoformat(),
                "age": r.age,
                "ss_benefit": float(r.ss_benefit),
                "trad_dist_opt": float(r.trad_dist_opt),
                "roth_dist_opt": float(r.roth_dist_opt),
                "fed_tax_opt": float(r.fed_tax_opt),
                "after_tax_dist_opt": float(r.after_tax_dist_opt),
                "atcf_opt": float(r.atcf_opt),
                "pct_ss_taxed_opt": float(r.pct_ss_taxed_opt),
                "trad_dist_opt_tax_rate": float(r.trad_dist_opt_tax_rate),
                "trad_mtr_adj_opt": float(r.trad_mtr_adj_opt)
            } for r in records
        ]
        print(f"Queried retire_yr_data for run_id={run_id}, conv_group_num=0, found {len(results)} records")
        return results
    except Exception as e:
        print(f"Error in get_retire_yr_data for run_id={run_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch retire_yr_data: {str(e)}")
    finally:
        session.close()

@app.get("/distribution_schedule/{run_id}")
def get_distribution_schedule(run_id: int):
    session = SessionLocal()
    try:
        calc_run = session.query(CalculationRun).filter_by(run_id=run_id).first()
        if not calc_run:
            raise HTTPException(status_code=404, detail="Calculation run not found")

        return {
            "distribution": float(calc_run.distribution) if calc_run.distribution else None,
            "annuity_factor_multiple": float(calc_run.annuity_factor_multiple) if calc_run.annuity_factor_multiple else None,
            "base_duration": float(calc_run.base_duration) if calc_run.base_duration else None
        }
    except Exception as e:
        print(f"Error in get_distribution_schedule for run_id={run_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch distribution schedule: {str(e)}")
    finally:
        session.close()

@app.post("/login")
def login(login_data: LoginRequest):
    session = SessionLocal()
    try:
        user = session.query(User).filter_by(username=login_data.username).first()
        if not user or not bcrypt.checkpw(login_data.password.encode('utf-8'), user.password_hash.encode('utf-8')):
            raise HTTPException(status_code=400, detail="Invalid username or password")
        return {"user_id": user.user_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")
    finally:
        session.close()

@app.get("/users/{user_id}")
def get_user(user_id: int):
    session = SessionLocal()
    try:
        user = session.query(User).filter_by(user_id=user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return {
            "user_id": user.user_id,
            "username": user.username,
            "email": user.email,
            "birth_date": user.birth_date.isoformat(),
            "marital_status": user.marital_status,
            "birth_date_spouse": user.birth_date_spouse.isoformat() if user.birth_date_spouse else None,
            "trad_savings": float(user.trad_savings),
            "roth_savings": float(user.roth_savings)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch user: {str(e)}")
    finally:
        session.close()

@app.put("/users/{user_id}")
def update_user_profile(user_id: int, user_update: UserUpdate):
    session = SessionLocal()
    try:
        user = session.query(User).filter_by(user_id=user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Check if email is being changed and if it's already taken by another user
        if user_update.email and user_update.email != user.email:
            existing_email = session.query(User).filter_by(email=user_update.email).first()
            if existing_email:
                raise HTTPException(status_code=400, detail="Email already exists")
            user.email = user_update.email

        # Update other fields if provided
        if user_update.birth_date:
            user.birth_date = datetime.datetime.strptime(user_update.birth_date, '%Y-%m-%d').date()

        if user_update.marital_status:
            user.marital_status = user_update.marital_status

        if user_update.birth_date_spouse:
            user.birth_date_spouse = datetime.datetime.strptime(user_update.birth_date_spouse, '%Y-%m-%d').date()
        elif user_update.marital_status == 'S':  # If changing to Single, clear spouse birth date
            user.birth_date_spouse = None

        session.commit()
        return {"message": "Profile updated successfully"}
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update profile: {str(e)}")
    finally:
        session.close()

@app.post("/users/{user_id}/change-password")
def change_password(user_id: int, password_change: PasswordChange):
    session = SessionLocal()
    try:
        user = session.query(User).filter_by(user_id=user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Verify current password
        if not bcrypt.checkpw(password_change.current_password.encode('utf-8'), user.password_hash.encode('utf-8')):
            raise HTTPException(status_code=400, detail="Current password is incorrect")

        # Hash and update new password
        hashed_password = bcrypt.hashpw(password_change.new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        user.password_hash = hashed_password

        session.commit()
        return {"message": "Password changed successfully"}
    except HTTPException:
        raise
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to change password: {str(e)}")
    finally:
        session.close()

@app.delete("/users/{user_id}")
def delete_user_account(user_id: int):
    session = SessionLocal()
    try:
        user = session.query(User).filter_by(user_id=user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Delete all related records
        session.query(UserRatings).filter_by(user_id=user_id).delete()
        session.query(Input).filter_by(user_id=user_id).delete()
        session.query(RothConversions).filter_by(user_id=user_id).delete()
        session.query(RothConversionsParts).filter_by(user_id=user_id).delete()
        session.query(RetireYrData).filter_by(user_id=user_id).delete()
        session.query(CalculationRun).filter_by(user_id=user_id).delete()

        # Delete user
        session.delete(user)
        session.commit()

        return {"message": "Account deleted successfully"}
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete account: {str(e)}")
    finally:
        session.close()

@app.get("/inputs/{user_id}")
def get_inputs(user_id: int):
    session = SessionLocal()
    try:
        inputs = session.query(Input).filter_by(user_id=user_id).order_by(Input.input_timestamp.desc()).first()
        if not inputs:
            raise HTTPException(status_code=404, detail="No inputs found for user")
        return {
            "input_id": inputs.input_id,
            "user_id": inputs.user_id,
            "run_id": inputs.run_id,
            "input_timestamp": inputs.input_timestamp.isoformat(),
            "soc_sec_benefit": float(inputs.soc_sec_benefit),
            "salary": float(inputs.salary),
            "cont_return_assum": float(inputs.cont_return_assum),
            "dist_return_assum": float(inputs.dist_return_assum),
            "trad_cont_annual": float(inputs.trad_cont_annual),
            "inflation_assum": float(inputs.inflation_assum),
            "soc_sec_grw_assum": float(inputs.soc_sec_grw_assum),
            "retire_tax_hl": inputs.retire_tax_hl,
            "contribution_status": inputs.contribution_status,
            "distribution_status": inputs.distribution_status,
            "life_years": inputs.life_years
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch inputs: {str(e)}")
    finally:
        session.close()

@app.post("/ratings")
def submit_rating(rating: RatingCreate):
    session = SessionLocal()
    try:
        # Validate star rating is between 1-5
        if rating.star_rating < 1 or rating.star_rating > 5:
            raise HTTPException(status_code=400, detail="Star rating must be between 1 and 5")

        # Check if user exists
        user = session.query(User).filter_by(user_id=rating.user_id).first()
        if not user:
            raise HTTPException(status_code=400, detail="User not found")

        # Check if user already has a rating - update if exists, create if new
        existing_rating = session.query(UserRatings).filter_by(user_id=rating.user_id).first()

        if existing_rating:
            # Update existing rating
            existing_rating.star_rating = rating.star_rating
            existing_rating.comment = rating.comment[:1000]  # Truncate to 1000 chars
            existing_rating.rating_timestamp = datetime.datetime.now(datetime.UTC)
        else:
            # Create new rating
            db_rating = UserRatings(
                user_id=rating.user_id,
                star_rating=rating.star_rating,
                comment=rating.comment[:1000],  # Truncate to 1000 chars
                rating_timestamp=datetime.datetime.now(datetime.UTC),
                is_public=False
            )
            session.add(db_rating)

        session.commit()
        return {"message": "Rating submitted successfully"}

    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to submit rating: {str(e)}")
    finally:
        session.close()

@app.get("/ratings/summary")
def get_ratings_summary(user_id: int = None):
    session = SessionLocal()
    try:
        # Get average rating and total count
        avg_rating = session.query(func.avg(UserRatings.star_rating)).scalar() or 0
        total_ratings = session.query(func.count(UserRatings.rating_id)).scalar() or 0

        result = {
            "averageRating": round(float(avg_rating), 1),
            "totalRatings": total_ratings,
            "userCurrentRating": None,
            "userComment": None
        }

        # If user_id provided, get their current rating
        if user_id:
            user_rating = session.query(UserRatings).filter_by(user_id=user_id).first()
            if user_rating:
                result["userCurrentRating"] = user_rating.star_rating
                result["userComment"] = user_rating.comment

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch ratings summary: {str(e)}")
    finally:
        session.close()

@app.get("/users/{user_id}/subscription-status")
def get_subscription_status(user_id: int):
    """Get user's subscription and calculation count status"""
    session = SessionLocal()
    try:
        user = session.query(User).filter_by(user_id=user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        return {
            "calc_count": user.calc_count or 0,
            "subscription_status": user.subscription_status or "unpaid",
            "subscription_type": user.subscription_type,
            "amount_paid": float(user.amount_paid) if user.amount_paid else None,
            "payment_timestamp": user.payment_timestamp.isoformat() if user.payment_timestamp else None,
            "sub_end_date": user.sub_end_date.isoformat() if user.sub_end_date else None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch subscription status: {str(e)}")
    finally:
        session.close()


@app.get("/stripe/price-ids")
def get_price_ids():
    """Return Stripe Price IDs for Checkout Sessions"""
    return {
        "professional": os.getenv("STRIPE_PRICE_PROFESSIONAL"),
        "individual_50": os.getenv("STRIPE_PRICE_INDIVIDUAL_50"),
        "individual_25": os.getenv("STRIPE_PRICE_INDIVIDUAL_25"),
        "individual_10": os.getenv("STRIPE_PRICE_INDIVIDUAL_10")
    }

@app.post("/users/{user_id}/select-free")
def select_free_plan(user_id: int):
    """Update user to paid status when they select the free option"""
    session = SessionLocal()
    try:
        user = session.query(User).filter_by(user_id=user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        user.subscription_status = "paid"
        user.subscription_type = "free"
        session.commit()

        return {"message": "Free plan selected", "subscription_status": "paid"}
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update user: {str(e)}")
    finally:
        session.close()

class CheckoutSessionRequest(BaseModel):
    user_id: int
    price_id: str

@app.post("/stripe/create-checkout-session")
def create_checkout_session(request: CheckoutSessionRequest):
    """Create a Stripe Checkout Session with user's email pre-filled"""
    base_url = os.getenv("APP_BASE_URL")
    if not base_url:
        raise HTTPException(status_code=500, detail="APP_BASE_URL not configured")

    session = SessionLocal()
    try:
        user = session.query(User).filter_by(user_id=request.user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Create Stripe Checkout Session
        checkout_session = stripe.checkout.Session.create(
            customer_email=user.email,  # Pre-fill email from database
            line_items=[{
                'price': request.price_id,
                'quantity': 1,
            }],
            mode='payment',
            success_url=base_url + "/?payment=success&tab=conversions",
            cancel_url=base_url,
            metadata={
                'user_id': str(request.user_id)  # Store user_id for webhook
            }
        )

        return {"url": checkout_session.url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create checkout session: {str(e)}")
    finally:
        session.close()

@app.post("/stripe/webhook")
async def stripe_webhook(request: Request):
    """Webhook endpoint to receive payment confirmations from Stripe"""
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    try:
        # Verify the webhook signature (security check)
        event = stripe.Webhook.construct_event(
            payload, sig_header, STRIPE_WEBHOOK_SECRET
        )
    except ValueError as e:
        # Invalid payload
        print(f"Webhook error: Invalid payload - {e}")
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        # Invalid signature
        print(f"Webhook error: Invalid signature - {e}")
        raise HTTPException(status_code=400, detail="Invalid signature")

    # Handle the checkout.session.completed event
    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]

        # Extract payment information
        customer_email = session.get("customer_details", {}).get("email")
        amount_total = session.get("amount_total", 0) / 100  # Convert cents to dollars
        payment_intent = session.get("payment_intent")

        print(f"Payment received: {customer_email}, ${amount_total}")

        # Find user by email and update their subscription
        db_session = SessionLocal()
        try:
            user = db_session.query(User).filter_by(email=customer_email).first()
            if user:
                user.subscription_status = "paid"
                user.amount_paid = Decimal(str(amount_total))
                user.payment_timestamp = datetime.datetime.now(datetime.UTC)
                user.stripe_subscription_id = payment_intent

                # Set subscription end date (1 year from now)
                user.sub_end_date = (datetime.datetime.now(datetime.UTC) + datetime.timedelta(days=365)).date()

                # Determine subscription type based on amount
                # You'll need to adjust these amounts to match your actual prices
                if amount_total >= 99:
                    user.subscription_type = "professional"
                else:
                    user.subscription_type = "individual"

                db_session.commit()
                print(f"Updated user {user.user_id}: subscription_status=paid, type={user.subscription_type}")
            else:
                print(f"Warning: No user found with email {customer_email}")
        except Exception as e:
            db_session.rollback()
            print(f"Database error: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to update user: {str(e)}")
        finally:
            db_session.close()

    return {"status": "success"}

# Serve React static files (added for production)
# This mounts the React build folder to serve the app
frontend_dir = Path(__file__).parent / "frontend" / "build"
if frontend_dir.exists():
    app.mount("/", StaticFiles(directory=frontend_dir, html=True), name="static")