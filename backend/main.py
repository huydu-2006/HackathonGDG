from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.projects import router as projects_router
from api.tasks import router as tasks_router
from api.search import router as search_router

app = FastAPI(
    title="NavisAI API",
    description="Agentic AI Project Manager for Academic Research",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(projects_router)
app.include_router(tasks_router)
app.include_router(search_router)


@app.get("/")
async def root():
    return {
        "name": "NavisAI",
        "description": "Agentic AI Project Manager for Academic Research",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}
