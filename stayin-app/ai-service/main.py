from fastapi import FastAPI, HTTPException
from schemas import RecommendationRequest
from schemas import Interaction
import database
from contextlib import asynccontextmanager
import engine
import json

@asynccontextmanager
async def lifespan(app: FastAPI):
    await database.connect_db()
    yield
    await database.close_db()

app = FastAPI(lifespan=lifespan)

@app.post("/recomendar/anuncios")
async def recomendar(request: RecommendationRequest):
    datos_usuario = await engine.get_preferencias_anuncios_usuario(request.id_inquilino, database.db_pool)

    if not datos_usuario:
        raise HTTPException(status_code=404, detail="Preferencias no encontradas")

    presupuesto = datos_usuario['presupuesto_max']
    zonas = datos_usuario['zona']
    descripcion_usuario = datos_usuario['descripcion']

    pref_raw = datos_usuario['preferencias']
    preferencias = json.loads(pref_raw) if isinstance(pref_raw, str) else pref_raw
    
    viviendas_validas = await engine.get_viviendas_validas(presupuesto, zonas, request.id_inquilino, database.db_pool)
    
    mejores_pisos = engine.generar_ranking_viviendas(preferencias, descripcion_usuario, viviendas_validas)

    return mejores_pisos

@app.post("/recomendar/companeros")
async def recomendar_companeros(request: RecommendationRequest):
    datos_usuario = await engine.get_preferencias_companeros_usuario(request.id_inquilino, database.db_pool)

    if not datos_usuario:
        raise HTTPException(status_code=404, detail="Preferencias no encontradas")
    
    pref_raw = datos_usuario['perfil_social']
    
    preferencias = json.loads(pref_raw) if isinstance(pref_raw, str) else pref_raw

    candidatos = await engine.get_companeros_validos(request.id_inquilino, datos_usuario['zona'], database.db_pool)

    ranking_companeros = engine.get_ranking_companeros(datos_usuario['preferencias'], 
                                                       datos_usuario['perfil_social'], 
                                                       datos_usuario['vector_realidad'],
                                                       datos_usuario['sexo'],
                                                       candidatos,
                                                       )
    
    return ranking_companeros

@app.post("/interaccion")
async def interactuar(interaccion: Interaction):
    await engine.set_interaction(interaccion.id_inquilino, interaccion.id_anuncio, interaccion.tipo, interaccion.peso, database.db_pool)

