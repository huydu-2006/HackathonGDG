from fastapi import APIRouter, HTTPException

from models.schemas import UpdateTaskRequest, SubmitTaskRequest
from services.project_service import (
    apply_evaluation,
    get_project,
    submit_task,
    update_task,
)
from agents.navis_agent import evaluate_submission

router = APIRouter(prefix="/api/projects", tags=["tasks"])


@router.put("/{project_id}/tasks/{task_id}")
async def update_task_endpoint(
    project_id: str, task_id: str, req: UpdateTaskRequest
):
    task = update_task(project_id, task_id, req.model_dump(exclude_none=True))
    if not task:
        raise HTTPException(status_code=404, detail="Task or project not found")
    return {"task": task}


@router.post("/{project_id}/tasks/{task_id}/submit")
async def submit_task_endpoint(
    project_id: str, task_id: str, req: SubmitTaskRequest
):
    task = submit_task(project_id, task_id, req.content)
    if not task:
        raise HTTPException(status_code=404, detail="Task or project not found")
    return {
        "task": task,
        "message": "Submission received. Use /evaluate to get AI feedback.",
    }


@router.post("/{project_id}/tasks/{task_id}/evaluate")
async def evaluate_task_endpoint(project_id: str, task_id: str):
    project = get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    task = next((t for t in project["tasks"] if t["id"] == task_id), None)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if not task.get("submission"):
        raise HTTPException(
            status_code=400, detail="No submission found for this task"
        )

    evaluation = evaluate_submission(
        task_title=task["title"],
        task_description=task["description"],
        submission_content=task["submission"],
    )

    result = apply_evaluation(project_id, task_id, evaluation)
    return result
