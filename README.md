# EbookForge Multi-Agent Workflow

This repository combines the Niche-to-Ebook Python workspace with the multi-agent dashboard and storefront.

## Cloudflare storefront

The Next.js dashboard is configured for Cloudflare Workers through OpenNext. It requires a PostgreSQL-compatible `DATABASE_URL` secret at runtime for its workflow data APIs.

```bash
npm install
npm run build:cloudflare
npm run deploy
```

## Niche-to-Ebook workspace

The original FastAPI workspace remains in `app/` alongside the storefront routes. Its starter data lives in `data/`.

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.api:app --host 0.0.0.0 --port 8000
```

Before production publishing, migrate the starter JSON storage to managed infrastructure and keep approval gates for publishing, payments, campaigns, refunds, and legal/privacy actions.
