from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class RecommendationRequest(BaseModel):
    id_inquilino: int

class BusquedaVolatilRequest(BaseModel):
    id_inquilino: int
    presupuesto_max: int
    zona: List[str]
    ciudad: str
    preferencias: Dict[str, Any]

class Interaction(BaseModel):
    id_inquilino: int
    id_anuncio: int
    tipo: str
    peso: int

