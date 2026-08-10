import sys
from .store import FileStore
from .agents import ResearchAgent, PublisherAgent

def demo():
    s=FileStore(); o=ResearchAgent(s).run(); print('Opportunity:',o.model_dump_json(indent=2)); e=PublisherAgent(s).run(o); print('Ebook:',e.model_dump_json(indent=2)); print('Saved under data/')
if __name__=='__main__':
    if len(sys.argv)>1 and sys.argv[1]=='demo': demo()
    else: print('Usage: python -m app.cli demo')
