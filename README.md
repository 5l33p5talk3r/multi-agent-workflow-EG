# Niche-to-Ebook Multi-Agent System

Production-oriented starter architecture for four cooperating agents:

1. **Researcher**: discovers and scores niches, saving structured opportunities.
2. **Publisher**: turns an approved opportunity into a complete ebook package with a cover prompt/image and listing copy.
3. **Growth**: finds consent-based audiences and drafts compliant campaigns; no unsolicited bulk messaging.
4. **Customer Care**: triages support tickets, drafts replies, and escalates refunds/payment/account issues.

This starter intentionally uses mock providers. Replace adapters with authenticated services through environment variables. High-impact actions are represented as approval requests.

## Run

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python -m app.cli demo
uvicorn app.api:app --host 0.0.0.0 --port 8000
```

Open `http://localhost:8000/docs` for the API.

## Workflow

```text
research -> opportunity JSON -> approval -> ebook package -> approval -> Digistore24 adapter
                                                      \\-> consent-based campaign drafts
customer webhook -> support ticket -> policy triage -> reply draft/escalation
```

## Production checklist

- Use Postgres/object storage instead of local JSON files.
- Put a queue (Celery, Temporal, or managed workflow) between agents.
- Add authentication, audit logs, rate limits, secret manager, backups, and observability.
- Implement Digistore24's current official API/webhook contract in `app/integrations/digistore24.py`; verify permissions and terms before enabling writes.
- Add human approval for publishing, paid campaigns, refunds, legal/privacy issues, and any message without documented consent.
- Use only lawful, permission-based lead sources. Honor opt-outs and applicable marketing/privacy laws.
