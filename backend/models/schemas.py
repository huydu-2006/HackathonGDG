from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from enum import Enum


class TaskStatus(str, Enum):
    pending = "pending"
    in_progress = "in_progress"
    submitted = "submitted"
    completed = "completed"
    needs_revision = "needs_revision"


class ProjectStatus(str, Enum):
    planning = "planning"
    active = "active"
    completed = "completed"


class Member(BaseModel):
    id: str
    name: str
    role: str
    skills: List[str] = []


class SmartGoal(BaseModel):
    specific: str
    measurable: str
    achievable: str
    relevant: str
    time_bound: str


class Task(BaseModel):
    id: str
    title: str
    description: str
    deadline: str  # ISO date string or "Week N"
    status: TaskStatus = TaskStatus.pending
    assigned_to: Optional[str] = None  # member id or name
    week: int
    resources: List[str] = []  # list of document/resource titles
    submission: Optional[str] = None
    feedback: Optional[str] = None


class Project(BaseModel):
    id: str
    name: str
    description: str
    smart_goal: Optional[SmartGoal] = None
    members: List[Member] = []
    tasks: List[Task] = []
    status: ProjectStatus = ProjectStatus.planning
    created_at: str
    total_weeks: int = 8


class CreateProjectRequest(BaseModel):
    name: str
    description: str
    members: List[Member] = []
    total_weeks: int = 8


class GenerateWBSRequest(BaseModel):
    project_id: str


class UpdateTaskRequest(BaseModel):
    status: Optional[TaskStatus] = None
    assigned_to: Optional[str] = None


class SubmitTaskRequest(BaseModel):
    content: str


class EvaluateRequest(BaseModel):
    task_id: str
    submission_content: str
