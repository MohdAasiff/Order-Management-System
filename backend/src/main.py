# src/main.py
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.infrastructure.database import engine, Base, wait_for_db

# ✅ Import Routers
from src.modules.inventory.routers import router as inventory_router
from src.modules.customers.routers import router as customers_router
from src.modules.orders.routers import router as orders_router

# ✅ Import Models explicitly so SQLAlchemy registers them before create_all runs
from src.modules.inventory.models import Product
from src.modules.customers.models import Customer
from src.modules.orders.models import Order

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    FAANG Standard Lifecycle Management: Resolves database checks and migrations 
    safely at service startup rather than build time.
    """
    print("🚀 Starting up ERP Backend Application Services...")
    
    # 1. Block and poll until database answers network pings safely
    wait_for_db()
    
    # 2. Automatically generate any missing database tables on Render
    Base.metadata.create_all(bind=engine)
    print("✅ Database structural verification complete.")
    
    yield  # Hand over control to incoming HTTP requests
    
    print("🛑 Shutting down ERP Backend Application Services...")

# ✅ Initialize FastAPI with the lifecycle manager
app = FastAPI(
    title="Enterprise Inventory & Order API",
    lifespan=lifespan
)

# ✅ Configure Cross-Origin Resource Sharing (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Register Application Routing Modules
app.include_router(inventory_router)
app.include_router(customers_router)
app.include_router(orders_router)

@app.get("/")
def health_check():
    return {"status": "healthy", "service": "ERP Backend"}