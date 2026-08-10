import json, os
from pathlib import Path
from typing import TypeVar, Type
from pydantic import BaseModel

T = TypeVar('T', bound=BaseModel)
class FileStore:
    def __init__(self, root=None): self.root = Path(root or os.getenv('DATA_DIR','data')); self.root.mkdir(exist_ok=True)
    def save(self, collection: str, obj: BaseModel):
        p=self.root/collection; p.mkdir(exist_ok=True); (p/f'{obj.id}.json').write_text(obj.model_dump_json(indent=2)); return obj
    def get(self, collection: str, item_id: str, cls: Type[T]) -> T:
        return cls.model_validate_json((self.root/collection/f'{item_id}.json').read_text())
    def all(self, collection: str, cls: Type[T]):
        p=self.root/collection; p.mkdir(exist_ok=True)
        return [cls.model_validate_json(x.read_text()) for x in p.glob('*.json')]
    def update(self, collection: str, item_id: str, cls: Type[T], **changes):
        obj=self.get(collection,item_id,cls); obj=obj.model_copy(update=changes); return self.save(collection,obj)
