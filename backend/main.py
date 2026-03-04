from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine
import models
from routers import orders, dispatches, dashboard

# Create all tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Charbhuja Cotton Pvt. Ltd — Transaction API",
    version="1.0.0",
    description="Transaction management system for agro-trading business",
)

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://charbhuja-transaction-management.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(orders.router)
app.include_router(dispatches.router)
app.include_router(dashboard.router)


@app.get("/")
def root():
    return {"message": "Charbhuja Cotton Pvt. Ltd Transaction API", "status": "running"}
