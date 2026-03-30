from fastapi import APIRouter
from pydantic import BaseModel

from agents.navis_agent import search_documents

router = APIRouter(prefix="/api/search", tags=["search"])


class SearchRequest(BaseModel):
    query: str


@router.post("/documents")
async def search_docs(req: SearchRequest):
    docs = search_documents(req.query)
    return {"documents": docs, "query": req.query}
