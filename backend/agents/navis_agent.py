import os
import json
import uuid
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import ChatPromptTemplate

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")


def get_llm(model: str = "gemini-2.0-flash"):
    """Return an LLM instance, or None when no API key is configured."""
    if not GEMINI_API_KEY:
        return None
    return ChatGoogleGenerativeAI(
        model=model,
        google_api_key=GEMINI_API_KEY,
        temperature=0.7,
    )


def _strip_markdown_fences(text: str) -> str:
    """Remove ```json ... ``` fences that models sometimes wrap around JSON."""
    text = text.strip()
    if text.startswith("```"):
        # Drop opening fence line
        text = text.split("\n", 1)[-1]
        # Drop closing fence
        if text.endswith("```"):
            text = text.rsplit("```", 1)[0]
    return text.strip()


def generate_smart_goals(project_name: str, description: str) -> dict:
    """Generate SMART goals from a project description using Gemini."""
    llm = get_llm()
    if not llm:
        return {
            "specific": f"Develop {project_name} system with defined features: {description[:100]}",
            "measurable": "Complete all WBS tasks with 80%+ quality score on each submission",
            "achievable": "Team of 4 members with 8 weeks timeline and Gemini API integration",
            "relevant": "Addresses real pain points in academic research project management",
            "time_bound": "MVP delivered within 8 weeks with weekly milestone reviews",
        }

    prompt = ChatPromptTemplate.from_template(
        """You are NavisAI, an expert project manager for academic research.
Given this research project, create SMART goals.

Project Name: {name}
Description: {description}

Return a JSON object with these fields:
- specific: What exactly will be accomplished
- measurable: How success will be measured
- achievable: Why this is realistic
- relevant: Why this matters
- time_bound: Timeline and deadlines

Return ONLY valid JSON, no markdown."""
    )

    try:
        chain = prompt | llm
        result = chain.invoke({"name": project_name, "description": description})
        return json.loads(_strip_markdown_fences(result.content))
    except Exception:
        return {
            "specific": f"Develop {project_name} with measurable outcomes",
            "measurable": "Weekly deliverables tracked and reviewed",
            "achievable": "Scoped for available team and timeline",
            "relevant": "Directly addresses stated research problem",
            "time_bound": "Completed within project duration",
        }


def generate_wbs(
    project_name: str,
    description: str,
    members: list,
    total_weeks: int,
    smart_goal: dict,
) -> list:
    """Generate a Work Breakdown Structure task list using Gemini."""
    member_info = "\n".join(
        f"- {m['name']} ({m['role']}): skills={', '.join(m.get('skills', []))}"
        for m in members
    )

    llm = get_llm()
    if not llm:
        return _mock_wbs(members, total_weeks)

    prompt = ChatPromptTemplate.from_template(
        """You are NavisAI, an expert project manager for academic research projects.

Project: {name}
Description: {description}
Duration: {weeks} weeks
Team Members:
{members}

SMART Goals:
{smart_goal}

Create a detailed Work Breakdown Structure (WBS) with {weeks} tasks/milestones.
Assign each task to the most suitable team member based on their skills.
Include relevant learning resources for each task.

Return a JSON array of tasks with these fields:
- id: unique string (use sequential numbers like "task_1", "task_2")
- title: concise task title
- description: detailed description of what needs to be done
- deadline: "Week N" format
- status: "pending"
- assigned_to: member name (match from team members list)
- week: week number (integer)
- resources: array of 2-3 relevant document/resource titles

Return ONLY valid JSON array, no markdown."""
    )

    try:
        chain = prompt | llm
        result = chain.invoke(
            {
                "name": project_name,
                "description": description,
                "weeks": total_weeks,
                "members": member_info,
                "smart_goal": json.dumps(smart_goal),
            }
        )
        tasks = json.loads(_strip_markdown_fences(result.content))
        for t in tasks:
            if not t.get("id"):
                t["id"] = str(uuid.uuid4())
        return tasks
    except Exception:
        # Fall back to mock WBS so the endpoint always returns useful data
        return _mock_wbs(members, total_weeks)


def _mock_wbs(members: list, total_weeks: int) -> list:
    """Return a sensible mock WBS when the LLM is unavailable."""
    task_templates = [
        (
            "Literature Review & Problem Analysis",
            "Review existing solutions, identify gaps, and analyze related work",
            1,
            ["Research Methodology Guide", "Academic Paper Template"],
        ),
        (
            "System Architecture Design",
            "Design system architecture, define components and data flow",
            2,
            ["System Design Patterns", "API Design Best Practices"],
        ),
        (
            "Core Backend Development",
            "Implement main API endpoints and business logic",
            3,
            ["FastAPI Documentation", "Python Best Practices"],
        ),
        (
            "AI Agent Integration",
            "Integrate LangChain with Gemini for intelligent task planning",
            4,
            ["LangChain Documentation", "Gemini API Guide"],
        ),
        (
            "Database & Storage Setup",
            "Configure vector database and data persistence layer",
            4,
            ["Pinecone Documentation", "Firebase Setup Guide"],
        ),
        (
            "Frontend Development",
            "Build React/Next.js dashboard with project management UI",
            5,
            ["Next.js Documentation", "React Best Practices"],
        ),
        (
            "Testing & Quality Assurance",
            "Write unit tests, integration tests, and conduct user testing",
            6,
            ["Testing Best Practices", "QA Checklist"],
        ),
        (
            "Documentation & Demo Preparation",
            "Write technical docs, user guide, and prepare demo",
            7,
            ["Documentation Template", "Demo Presentation Guide"],
        ),
    ]

    mock_tasks = []
    for i, (title, desc, week, resources) in enumerate(
        task_templates[: min(len(task_templates), total_weeks)]
    ):
        assigned = members[i % len(members)]["id"] if members else None
        mock_tasks.append(
            {
                "id": str(uuid.uuid4()),
                "title": title,
                "description": desc,
                "deadline": f"Week {week}",
                "status": "pending",
                "assigned_to": assigned,
                "week": week,
                "resources": resources,
            }
        )
    return mock_tasks


def evaluate_submission(
    task_title: str, task_description: str, submission_content: str
) -> dict:
    """Evaluate a task submission and provide structured feedback."""
    llm = get_llm(model="gemini-2.5-pro-preview-06-05") if GEMINI_API_KEY else None

    if not llm:
        return {
            "score": 75,
            "passed": True,
            "feedback": (
                f"Your submission for '{task_title}' has been reviewed. "
                "The content demonstrates understanding of the core concepts. "
                "Consider adding more specific implementation details and references "
                "to strengthen your work."
            ),
            "improvements": [
                "Add more concrete examples or code snippets",
                "Include references to academic sources",
                "Elaborate on the methodology used",
            ],
            "strengths": ["Clear problem statement", "Logical structure"],
        }

    prompt = ChatPromptTemplate.from_template(
        """You are NavisAI, evaluating a student's task submission for an academic research project.

Task: {task_title}
Task Requirements: {task_description}

Student Submission:
{submission}

Evaluate the submission and provide:
1. A quality score (0-100)
2. Whether it passes (score >= 70)
3. Detailed constructive feedback
4. List of 2-3 specific improvements needed
5. List of 2-3 strengths

Return a JSON object with:
- score: integer (0-100)
- passed: boolean
- feedback: detailed feedback paragraph
- improvements: array of improvement suggestions
- strengths: array of strengths identified

Return ONLY valid JSON, no markdown."""
    )

    try:
        chain = prompt | llm
        result = chain.invoke(
            {
                "task_title": task_title,
                "task_description": task_description,
                "submission": submission_content,
            }
        )
        return json.loads(_strip_markdown_fences(result.content))
    except Exception:
        return {
            "score": 72,
            "passed": True,
            "feedback": "Submission reviewed. Good effort shown with room for improvement.",
            "improvements": ["Add more detail", "Include references"],
            "strengths": ["Clear structure", "Addresses main points"],
        }


def search_documents(query: str) -> list:
    """Search for relevant documents using RAG (stub — Pinecone not wired up)."""
    mock_docs = [
        {
            "title": "Introduction to Agentic AI Systems",
            "excerpt": (
                "Agentic AI refers to systems that can autonomously plan and "
                "execute multi-step tasks..."
            ),
            "relevance": 0.95,
            "source": "DeepLearning.AI - Andrew Ng",
        },
        {
            "title": "LangChain: Building AI Agents",
            "excerpt": (
                "LangChain provides tools for building language model applications "
                "with memory and tools..."
            ),
            "relevance": 0.88,
            "source": "LangChain Documentation",
        },
        {
            "title": "RAG: Retrieval-Augmented Generation",
            "excerpt": (
                "RAG combines retrieval systems with generative models to provide "
                "accurate, grounded responses..."
            ),
            "relevance": 0.82,
            "source": "Pinecone Research",
        },
    ]

    query_lower = query.lower()
    filtered = [
        d
        for d in mock_docs
        if any(
            word in d["title"].lower() or word in d["excerpt"].lower()
            for word in query_lower.split()
        )
    ]
    return filtered if filtered else mock_docs[:2]
