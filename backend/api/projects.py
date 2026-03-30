import uuid

from fastapi import APIRouter, HTTPException

from models.schemas import CreateProjectRequest
from services.project_service import (
    create_project,
    get_all_projects,
    get_project,
    get_project_stats,
    update_project_wbs,
)
from agents.navis_agent import generate_smart_goals, generate_wbs

router = APIRouter(prefix="/api/projects", tags=["projects"])


@router.get("/")
async def list_projects():
    return {"projects": get_all_projects()}


@router.post("/")
async def create_new_project(req: CreateProjectRequest):
    members_data = [
        m.model_dump() if hasattr(m, "model_dump") else m for m in req.members
    ]
    # Ensure every member has an id
    for m in members_data:
        if not m.get("id"):
            m["id"] = str(uuid.uuid4())

    project = create_project(
        name=req.name,
        description=req.description,
        members=members_data,
        total_weeks=req.total_weeks,
    )
    return {"project": project}


@router.get("/{project_id}")
async def get_project_detail(project_id: str):
    project = get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"project": project}


@router.post("/{project_id}/generate-wbs")
async def generate_project_wbs(project_id: str):
    project = get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    smart_goal = generate_smart_goals(project["name"], project["description"])
    tasks = generate_wbs(
        project_name=project["name"],
        description=project["description"],
        members=project["members"],
        total_weeks=project["total_weeks"],
        smart_goal=smart_goal,
    )

    updated = update_project_wbs(project_id, smart_goal, tasks)
    return {"project": updated, "message": "WBS generated successfully"}


@router.get("/{project_id}/stats")
async def get_stats(project_id: str):
    stats = get_project_stats(project_id)
    if not stats:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"stats": stats}
