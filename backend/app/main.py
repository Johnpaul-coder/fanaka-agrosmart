from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# 1. Import the database engine and Base from your database.py file
from app.database import engine, Base

# 2. IMPORTANT: You must import your models here before calling create_all()
# This tells SQLAlchemy, "Hey, look at these files to know what tables to build."
from app.models import user_model, product_model, hub_model

# 3. The "Magic Line": This creates the database and all tables if they don't exist yet
Base.metadata.create_all(bind=engine)

# 4. Initialize the FastAPI application
app = FastAPI(
    title="Fanaka AGROSMART API",
    description="Backend engine for the Fanaka Agricultural Platform",
    version="1.0.0"
)

# 5. Security: Allow your Next.js frontend to talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, change this to your actual website URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 6. Import and link your API routes (The "Doors")
from app.api import auth, market, scans, payments

app.include_router(auth.router, prefix="/api/auth", tags=["Security & Login"])
app.include_router(market.router, prefix="/api/market", tags=["Marketplace"])
app.include_router(scans.router, prefix="/api/scans", tags=["AI Diagnostics"])
app.include_router(payments.router, prefix="/api/payments", tags=["M-Pesa Integration"])

# 7. A simple health check route to ensure the server is alive
@app.get("/")
def health_check():
    return {
        "status": "Online",
        "message": "Fanaka Engine is Running Successfully",
        "database": "Connected"
    }