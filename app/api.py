from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from .store import FileStore
from .agents import ResearchAgent, PublisherAgent, GrowthAgent, CustomerCareAgent
from .models import Opportunity, Ebook, Approval, SupportTicket, now
from .integrations.digistore24 import Digistore24Client
import uuid
app=FastAPI(title='Niche-to-Ebook Multi-Agent System')
store=FileStore(); research=ResearchAgent(store); publisher=PublisherAgent(store); growth=GrowthAgent(); care=CustomerCareAgent()
class Query(BaseModel): query: str='evergreen practical problems'
@app.post('/research')
def run_research(q:Query): return research.run(q.query)
@app.get('/opportunities')
def opportunities(): return store.all('opportunities',Opportunity)
@app.post('/opportunities/{oid}/approve')
def approve_opportunity(oid:str):
    try: o=store.update('opportunities',oid,Opportunity,status='approved'); return publisher.run(o)
    except FileNotFoundError: raise HTTPException(404,'Opportunity not found')
@app.get('/ebooks')
def ebooks(): return store.all('ebooks',Ebook)
@app.post('/ebooks/{eid}/upload')
def upload(eid:str):
    try: e=store.get('ebooks',eid,Ebook)
    except FileNotFoundError: raise HTTPException(404,'Ebook not found')
    return Digistore24Client().upload_product(e)
@app.post('/ebooks/{eid}/campaign')
def campaign(eid:str):
    try: e=store.get('ebooks',eid,Ebook)
    except FileNotFoundError: raise HTTPException(404,'Ebook not found')
    return growth.draft_campaign(e)
@app.post('/support/triage')
def triage(ticket:SupportTicket): return store.save('tickets',care.triage(ticket))
@app.post('/approvals')
def create_approval(action:str,resource_id:str): return store.save('approvals',Approval(id=uuid.uuid4().hex[:12],action=action,resource_id=resource_id))
