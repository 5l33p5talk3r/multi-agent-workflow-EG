from datetime import datetime, timezone
from typing import Literal
from pydantic import BaseModel, Field


def now(): return datetime.now(timezone.utc).isoformat()

class Opportunity(BaseModel):
    id: str
    niche: str
    audience: str
    problem: str
    demand_score: float = Field(ge=0, le=100)
    competition_score: float = Field(ge=0, le=100)
    profit_score: float = Field(ge=0, le=100)
    evidence: list[str] = []
    status: Literal['draft','approved','rejected'] = 'draft'
    created_at: str = Field(default_factory=now)

class Ebook(BaseModel):
    id: str
    opportunity_id: str
    title: str
    subtitle: str
    description: str
    chapters: list[dict]
    cover_image_path: str | None = None
    price_usd: float = 19.0
    status: Literal['draft','approved','uploaded'] = 'draft'

class Approval(BaseModel):
    id: str
    action: str
    resource_id: str
    status: Literal['pending','approved','rejected'] = 'pending'
    created_at: str = Field(default_factory=now)

class SupportTicket(BaseModel):
    id: str
    customer_email: str
    subject: str
    body: str
    category: str = 'other'
    priority: Literal['low','normal','high','urgent'] = 'normal'
    draft_reply: str | None = None
    escalated: bool = False
