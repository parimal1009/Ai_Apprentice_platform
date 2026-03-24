from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
import os
import logging

from app.core.config import settings
from app.api.v1.auth import router as auth_router
from app.api.v1.apprentice import router as apprentice_router
from app.api.v1.company import router as company_router
from app.api.v1.provider import router as provider_router
from app.api.v1.admin import router as admin_router
from app.api.v1.public import router as public_router
from app.api.v1.analysis import router as analysis_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Comprehensive multi-role apprenticeship lifecycle management platform",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files for uploads
upload_dir = settings.UPLOAD_DIR
os.makedirs(upload_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=upload_dir), name="uploads")

# API Routers
app.include_router(auth_router, prefix="/api/v1")
app.include_router(apprentice_router, prefix="/api/v1")
app.include_router(company_router, prefix="/api/v1")
app.include_router(provider_router, prefix="/api/v1")
app.include_router(admin_router, prefix="/api/v1")
app.include_router(public_router, prefix="/api/v1")
app.include_router(analysis_router, prefix="/api/v1")


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )


@app.get("/api/v1/health")
async def health_check():
    return {
        "status": "healthy",
        "version": settings.APP_VERSION,
        "app": settings.APP_NAME,
    }


@app.get("/")
async def root():
    return {
        "message": f"Welcome to {settings.APP_NAME}",
        "docs": "/docs",
        "version": settings.APP_VERSION,
    }
