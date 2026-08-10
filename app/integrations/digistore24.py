import os
class Digistore24Client:
    def __init__(self):
        self.base_url=os.getenv('DIGISTORE24_API_BASE','https://api.digistore24.com')
        self.api_key=os.getenv('DIGISTORE24_API_KEY')
    def upload_product(self, ebook):
        if not self.api_key: return {'mode':'mock','status':'not_uploaded','reason':'DIGISTORE24_API_KEY is not configured','ebook_id':ebook.id}
        raise NotImplementedError('Implement against the current official Digistore24 API after confirming endpoint and account permissions.')
