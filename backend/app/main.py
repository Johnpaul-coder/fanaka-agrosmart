from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, scans

# If you still have the payments.py file from earlier, you can uncomment this:
# from app.api import payments 

app = FastAPI(title="Fanaka AGROSMART API", description="Backend engine for agricultural management")

# ==========================================
# CORS SECURITY: ALLOW FRONTEND TO CONNECT
# ==========================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allows your Next.js site at localhost:3000 to connect
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# CONNECTING THE "PIPES" (ROUTERS)
# ==========================================
# 1. The Security & Login Router
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])

# 2. The AI Plant Doctor Router
app.include_router(scans.router, prefix="/api/scans", tags=["AI Scanner"])

# 3. The Money Engine Router (Uncomment if you are ready for M-Pesa!)
# app.include_router(payments.router, prefix="/api/payments", tags=["Payments"])

# ==========================================
# ROOT CHECK (IS THE ENGINE ON?)
# ==========================================
@app.get("/")
def read_root():
    return {"message": "Fanaka AGROSMART Backend is Live!"}