from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# 1. Load Environment Variables First 
load_dotenv() 

# 2. Database Setup
from app.database import engine, Base
from app.models import user_model, product_model, payment_model, hub_model, scan_model

# Create all tables on startup
Base.metadata.create_all(bind=engine)

# 3. Initialize FastAPI App (MUST happen before include_router)
app = FastAPI(
    title="Fanaka AGROSMART API",
    description="Backend engine for the Fanaka Agricultural Platform",
    version="1.0.0"
)

# 4. Middleware Configuration
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

# 5. Import and Include Routers
from app.api import auth, market, payments, scans, learning

app.include_router(auth.router,     prefix="/api/auth",     tags=["Auth"])
app.include_router(market.router,   prefix="/api/market",   tags=["Marketplace"])
app.include_router(payments.router, prefix="/api/payments", tags=["Payments"])
app.include_router(scans.router,    prefix="/api/scans",    tags=["AI Scanner"])
app.include_router(learning.router, prefix="/api/learning", tags=["Learning Hub"])

# 6. Health Check
@app.get("/")
def health_check():
    return {
        "status": "Online", 
        "message": "Fanaka Engine is Running", 
        "database": "Connected"
    }