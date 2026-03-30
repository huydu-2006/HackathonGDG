"""
Tests for the NavisAI FastAPI backend.

Run with:
    cd backend
    pytest tests/test_api.py -v
"""

import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport

# Import the app and reset in-memory storage between tests
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from main import app
import services.project_service as ps


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

SAMPLE_PROJECT_PAYLOAD = {
    "name": "NavisAI Research",
    "description": "Agentic AI for academic project management",
    "total_weeks": 4,
    "members": [
        {"id": "m1", "name": "Alice", "role": "Backend Developer", "skills": ["Python", "FastAPI"]},
        {"id": "m2", "name": "Bob", "role": "AI Engineer", "skills": ["LangChain", "Gemini"]},
    ],
}


@pytest.fixture(autouse=True)
def clear_storage():
    """Reset the in-memory store before every test."""
    ps._projects.clear()
    yield
    ps._projects.clear()


@pytest_asyncio.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


# ---------------------------------------------------------------------------
# Health / root
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_root(client):
    resp = await client.get("/")
    assert resp.status_code == 200
    data = resp.json()
    assert data["name"] == "NavisAI"


@pytest.mark.asyncio
async def test_health(client):
    resp = await client.get("/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "healthy"}


# ---------------------------------------------------------------------------
# Projects CRUD
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_list_projects_empty(client):
    resp = await client.get("/api/projects/")
    assert resp.status_code == 200
    assert resp.json() == {"projects": []}


@pytest.mark.asyncio
async def test_create_project(client):
    resp = await client.post("/api/projects/", json=SAMPLE_PROJECT_PAYLOAD)
    assert resp.status_code == 200
    project = resp.json()["project"]
    assert project["name"] == "NavisAI Research"
    assert project["status"] == "planning"
    assert len(project["members"]) == 2
    return project


@pytest.mark.asyncio
async def test_get_project(client):
    create_resp = await client.post("/api/projects/", json=SAMPLE_PROJECT_PAYLOAD)
    project_id = create_resp.json()["project"]["id"]

    resp = await client.get(f"/api/projects/{project_id}")
    assert resp.status_code == 200
    assert resp.json()["project"]["id"] == project_id


@pytest.mark.asyncio
async def test_get_project_not_found(client):
    resp = await client.get("/api/projects/nonexistent-id")
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_list_projects_after_create(client):
    await client.post("/api/projects/", json=SAMPLE_PROJECT_PAYLOAD)
    await client.post(
        "/api/projects/",
        json={**SAMPLE_PROJECT_PAYLOAD, "name": "Second Project"},
    )
    resp = await client.get("/api/projects/")
    assert resp.status_code == 200
    assert len(resp.json()["projects"]) == 2


# ---------------------------------------------------------------------------
# WBS generation (mock — no real Gemini key)
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_generate_wbs(client):
    create_resp = await client.post("/api/projects/", json=SAMPLE_PROJECT_PAYLOAD)
    project_id = create_resp.json()["project"]["id"]

    resp = await client.post(f"/api/projects/{project_id}/generate-wbs")
    assert resp.status_code == 200
    body = resp.json()
    assert body["message"] == "WBS generated successfully"
    project = body["project"]
    assert project["status"] == "active"
    assert project["smart_goal"] is not None
    assert len(project["tasks"]) > 0


@pytest.mark.asyncio
async def test_generate_wbs_project_not_found(client):
    resp = await client.post("/api/projects/bad-id/generate-wbs")
    assert resp.status_code == 404


# ---------------------------------------------------------------------------
# Stats
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_stats_empty_tasks(client):
    create_resp = await client.post("/api/projects/", json=SAMPLE_PROJECT_PAYLOAD)
    project_id = create_resp.json()["project"]["id"]

    resp = await client.get(f"/api/projects/{project_id}/stats")
    assert resp.status_code == 200
    stats = resp.json()["stats"]
    assert stats["total_tasks"] == 0
    assert stats["progress_percent"] == 0.0


@pytest.mark.asyncio
async def test_stats_after_wbs(client):
    create_resp = await client.post("/api/projects/", json=SAMPLE_PROJECT_PAYLOAD)
    project_id = create_resp.json()["project"]["id"]
    await client.post(f"/api/projects/{project_id}/generate-wbs")

    resp = await client.get(f"/api/projects/{project_id}/stats")
    assert resp.status_code == 200
    stats = resp.json()["stats"]
    assert stats["total_tasks"] > 0
    assert stats["pending"] > 0


# ---------------------------------------------------------------------------
# Task operations
# ---------------------------------------------------------------------------


async def _setup_project_with_tasks(client) -> tuple[str, str]:
    """Create project, generate WBS, return (project_id, first_task_id)."""
    create_resp = await client.post("/api/projects/", json=SAMPLE_PROJECT_PAYLOAD)
    project_id = create_resp.json()["project"]["id"]
    wbs_resp = await client.post(f"/api/projects/{project_id}/generate-wbs")
    first_task_id = wbs_resp.json()["project"]["tasks"][0]["id"]
    return project_id, first_task_id


@pytest.mark.asyncio
async def test_update_task_status(client):
    project_id, task_id = await _setup_project_with_tasks(client)

    resp = await client.put(
        f"/api/projects/{project_id}/tasks/{task_id}",
        json={"status": "in_progress"},
    )
    assert resp.status_code == 200
    assert resp.json()["task"]["status"] == "in_progress"


@pytest.mark.asyncio
async def test_update_task_not_found(client):
    create_resp = await client.post("/api/projects/", json=SAMPLE_PROJECT_PAYLOAD)
    project_id = create_resp.json()["project"]["id"]

    resp = await client.put(
        f"/api/projects/{project_id}/tasks/bad-task-id",
        json={"status": "in_progress"},
    )
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_submit_task(client):
    project_id, task_id = await _setup_project_with_tasks(client)

    resp = await client.post(
        f"/api/projects/{project_id}/tasks/{task_id}/submit",
        json={"content": "Here is my detailed submission for the task."},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["task"]["status"] == "submitted"
    assert body["task"]["submission"] == "Here is my detailed submission for the task."


@pytest.mark.asyncio
async def test_evaluate_task(client):
    project_id, task_id = await _setup_project_with_tasks(client)

    # Must submit first
    await client.post(
        f"/api/projects/{project_id}/tasks/{task_id}/submit",
        json={"content": "Comprehensive analysis of the problem domain with references."},
    )

    resp = await client.post(
        f"/api/projects/{project_id}/tasks/{task_id}/evaluate"
    )
    assert resp.status_code == 200
    body = resp.json()
    assert "evaluation" in body
    assert "score" in body["evaluation"]
    assert body["task"]["status"] in ("completed", "needs_revision")


@pytest.mark.asyncio
async def test_evaluate_task_no_submission(client):
    project_id, task_id = await _setup_project_with_tasks(client)

    resp = await client.post(
        f"/api/projects/{project_id}/tasks/{task_id}/evaluate"
    )
    assert resp.status_code == 400


# ---------------------------------------------------------------------------
# Search / RAG (stub)
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_search_documents(client):
    resp = await client.post(
        "/api/search/documents", json={"query": "LangChain AI agents"}
    )
    assert resp.status_code == 200
    body = resp.json()
    assert "documents" in body
    assert isinstance(body["documents"], list)
    assert len(body["documents"]) > 0
    assert body["query"] == "LangChain AI agents"


@pytest.mark.asyncio
async def test_search_documents_no_match_returns_fallback(client):
    resp = await client.post(
        "/api/search/documents", json={"query": "zzzzxxxxxnowordmatch"}
    )
    assert resp.status_code == 200
    # Should return fallback docs, not an empty list
    assert len(resp.json()["documents"]) > 0
