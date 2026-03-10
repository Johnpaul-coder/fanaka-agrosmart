from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()  # Load .env file

from app.database import engine, Base
from app.models import user_model, product_model, payment_model, hub_model, scan_model

# Create all tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Fanaka AGROSMART API",
    description="Backend engine for the Fanaka Agricultural Platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.api import auth, market, payments, scans

app.include_router(auth.router,     prefix="/api/auth",     tags=["Auth"])
app.include_router(market.router,   prefix="/api/market",   tags=["Marketplace"])
app.include_router(payments.router, prefix="/api/payments", tags=["Payments"])
app.include_router(scans.router,    prefix="/api/scans",    tags=["AI Scanner"])

@app.get("/")
def health_check():
    return {"status": "Online", "message": "Fanaka Engine is Running", "database": "Connected"}