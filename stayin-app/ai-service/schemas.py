from pydantic import BaseModel

class RecommendationRequest(BaseModel):
    id_inquilino: int



class Interaction(BaseModel):
    id_inquilino: int
    id_anuncio: int
    tipo: str
    peso: int

