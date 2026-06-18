import os
import time
from dotenv import load_dotenv

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.exc import OperationalError

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()

def wait_for_db():
    retries = 5

    while retries > 0:
        try:
            with engine.connect():
                print("✅ Successfully connected to MySQL")
                return

        except OperationalError as e:
            print(f"⏳ Database not ready. Retrying... ({retries} left)")
            print(e)
            retries -= 1
            time.sleep(3)

    raise Exception("❌ Could not connect to MySQL")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()