import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

# 1. Load the secret variables from the .env file
load_dotenv()

# 2. Fetch the database URL you defined
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# 3. Handle SQLite-specific settings for local development
# SQLite only allows one thread to communicate with it by default. 
# FastAPI handles multiple requests at once, so we need to disable that check.
connect_args = {}
if SQLALCHEMY_DATABASE_URL and SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

# 4. Create the Engine (The core connection to the database)
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args=connect_args
)

# 5. Create a Session Local class
# Each time a request comes in (like a farmer logging in), we create a temporary 
# session to talk to the database, then close it when the request is done.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 6. Create the Base class
# All your models (user_model.py, product_model.py) will inherit from this
Base = declarative_base()

# 7. Dependency to get the database session in your API routes
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()