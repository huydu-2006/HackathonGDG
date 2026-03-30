import uuid
from datetime import datetime, timezone
from typing import Dict, List, Optional

# In-memory storage for demo purposes
_projects: Dict[str, dict] = {}


def get_all_projects() -> List[dict]:
    return list(_projects.values())


def get_project(project_id: str) -> Optional[dict]:
    return _projects.get(project_id)


def create_project(
    name: str, description: str, members: list, total_weeks: int
) -> dict:
    project_id = str(uuid.uuid4())

    normalised_members = []
    for m in members:
        if hasattr(m, "model_dump"):
            member_dict = m.model_dump()
        elif isinstance(m, dict):
            member_dict = dict(m)
        else:
            member_dict = {
                "id": getattr(m, "id", str(uuid.uuid4())),
                "name": getattr(m, "name", ""),
                "role": getattr(m, "role", ""),
                "skills": getattr(m, "skills", []),
            }
        if not member_dict.get("id"):
            member_dict["id"] = str(uuid.uuid4())
        normalised_members.append(member_dict)

    project = {
        "id": project_id,
        "name": name,
        "description": description,
        "smart_goal": None,
        "members": normalised_members,
        "tasks": [],
        "status": "planning",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "total_weeks": total_weeks,
    }
    _projects[project_id] = project
    return project


def update_project_wbs(
    project_id: str, smart_goal: dict, tasks: list
) -> Optional[dict]:
    project = _projects.get(project_id)
    if not project:
        return None
    project["smart_goal"] = smart_goal
    project["tasks"] = tasks
    project["status"] = "active"
    return project


def update_task(
    project_id: str, task_id: str, updates: dict
) -> Optional[dict]:
    project = _projects.get(project_id)
    if not project:
        return None
    for task in project["tasks"]:
        if task["id"] == task_id:
            task.update({k: v for k, v in updates.items() if v is not None})
            return task
    return None


def submit_task(
    project_id: str, task_id: str, content: str
) -> Optional[dict]:
    project = _projects.get(project_id)
    if not project:
        return None
    for task in project["tasks"]:
        if task["id"] == task_id:
            task["submission"] = content
            task["status"] = "submitted"
            return task
    return None


def apply_evaluation(
    project_id: str, task_id: str, evaluation: dict
) -> Optional[dict]:
    project = _projects.get(project_id)
    if not project:
        return None
    for task in project["tasks"]:
        if task["id"] == task_id:
            task["feedback"] = evaluation.get("feedback")
            task["status"] = (
                "completed" if evaluation.get("passed") else "needs_revision"
            )
            return {"task": task, "evaluation": evaluation}
    return None


def get_project_stats(project_id: str) -> Optional[dict]:
    project = _projects.get(project_id)
    if not project:
        return None
    tasks = project["tasks"]
    total = len(tasks)
    completed = sum(1 for t in tasks if t["status"] == "completed")
    in_progress = sum(1 for t in tasks if t["status"] == "in_progress")
    pending = sum(1 for t in tasks if t["status"] == "pending")
    needs_revision = sum(1 for t in tasks if t["status"] == "needs_revision")
    submitted = sum(1 for t in tasks if t["status"] == "submitted")

    return {
        "total_tasks": total,
        "completed": completed,
        "in_progress": in_progress,
        "pending": pending,
        "needs_revision": needs_revision,
        "submitted": submitted,
        "progress_percent": round((completed / total * 100) if total > 0 else 0, 1),
    }
