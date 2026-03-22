"""
RecallAI - AI-Powered Learning Retention Platform
Main application entry point.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn
from shared.config.database import connect_to_mongodb, close_mongodb_connection
from core.config import settings
from shared.utils.logger import logger
from modules.auth.auth_router import router as auth_router
from modules.topic.topic_router import router as topic_router
from modules.material.material_routes import router as material_router
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for startup and shutdown events.
    """
    # Startup
    logger.info("Starting RecallAI backend...")
    await connect_to_mongodb()
    # await connect_redis()
    logger.info("RecallAI backend started successfully")
    
    yield
    
    # Shutdown
    logger.warning("Shutting down RecallAI backend...")
    await close_mongodb_connection()
    # await disconnect_redis()
    logger.info("RecallAI backend shutdown complete")


# Initialize FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI-Powered Learning Retention Platform - Helps students remember what they study using quizzes and spaced repetition",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)


# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include routers
app.include_router(auth_router, prefix="/api/v1")
app.include_router(topic_router, prefix="/api/v1")
app.include_router(material_router, prefix="/api/v1")


# Root endpoint
@app.get("/", tags=["Root"])
async def root():
    """
    Root endpoint - API health check.
    """
    return {
        "message": "Welcome to RecallAI - AI-Powered Learning Retention Platform",
        "status": "ok",
        "version": settings.APP_VERSION,
        "docs": "/docs"
    }


# Health check endpoint
@app.get("/health", tags=["Health"])
async def health_check():
    """
    Health check endpoint.
    """
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION
    }


if __name__ == "__main__":
    logger.info(f"Starting {settings.APP_NAME} server...")
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )