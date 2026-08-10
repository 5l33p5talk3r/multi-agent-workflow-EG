import hashlib
from .models import Opportunity, Ebook, SupportTicket
from .store import FileStore

class ResearchAgent:
    def __init__(self, store): self.store=store
    def run(self, query='evergreen practical problems'):
        # Replace this deterministic provider with a search/LLM adapter.
        seed='home inventory for small landlords'
        oid=hashlib.sha1(seed.encode()).hexdigest()[:12]
        o=Opportunity(id=oid,niche=seed,audience='small independent landlords',problem='reduce vacancy and maintenance chaos',demand_score=78,competition_score=32,profit_score=84,evidence=['Mock evidence: recurring operational pain','Mock evidence: clear buyer with measurable ROI'])
        return self.store.save('opportunities',o)

class PublisherAgent:
    def __init__(self, store): self.store=store
    def run(self, opportunity: Opportunity):
        eid=hashlib.sha1((opportunity.id+'ebook').encode()).hexdigest()[:12]
        chapters=[{'title':f'{i}. Practical system', 'content':f'Full draft chapter {i} for {opportunity.audience}. Add reviewed, original content here.'} for i in range(1,7)]
        e=Ebook(id=eid,opportunity_id=opportunity.id,title='The Small Landlord Operations Playbook',subtitle='A practical system for fewer vacancies and faster maintenance',description='A concise, actionable guide for independent landlords.',chapters=chapters)
        return self.store.save('ebooks',e)

class GrowthAgent:
    def draft_campaign(self, ebook: Ebook):
        return {'ebook_id':ebook.id,'channel':'permission-based email','subject':f'A practical playbook for {ebook.title}','body':'Draft only. Send only to recipients with documented consent and include unsubscribe instructions.','status':'pending_approval'}

class CustomerCareAgent:
    def triage(self, ticket: SupportTicket):
        text=(ticket.subject+' '+ticket.body).lower()
        category='refund' if any(x in text for x in ['refund','chargeback','cancel']) else 'technical' if any(x in text for x in ['download','login','access']) else 'other'
        escalated=category in {'refund'} or any(x in text for x in ['legal','threat','fraud'])
        reply='Thanks for contacting us. We received your request and are reviewing it.' if escalated else 'Thanks for contacting us. We are looking into this and will follow up shortly.'
        return ticket.model_copy(update={'category':category,'draft_reply':reply,'escalated':escalated})
