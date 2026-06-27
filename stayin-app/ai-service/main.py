from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from schemas import RecommendationRequest, Interaction, BusquedaVolatilRequest
import database
from contextlib import asynccontextmanager
import engine
import json
import jwt
import os

security = HTTPBearer()
SECRET_KEY = os.getenv("SECRET_KEY")

def verificar_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    if not SECRET_KEY:
        raise HTTPException(status_code=500, detail="Falta configurar SECRET_KEY en el motor")
        
    try:
        # Decodificamos usando el mismo algoritmo por defecto de Node.js (HS256)
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload # Devuelve el id_usuario y rol decodificados
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=403, detail="Token inválido o caducado.")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=403, detail="Acceso denegado. Token malformado.")

@asynccontextmanager
async def lifespan(app: FastAPI):
    await database.connect_db()
    yield
    await database.close_db()

app = FastAPI(
    lifespan=lifespan,
    dependencies=[Depends(verificar_token)] # <--- El escudo protector
)

@app.post("/recomendar/anuncios")
async def recomendar(request: RecommendationRequest):
    datos_usuario = await engine.get_preferencias_anuncios_usuario(request.id_inquilino, database.db_pool)

    if not datos_usuario or not datos_usuario['presupuesto_max'] or not datos_usuario['zona']:
        raise HTTPException(status_code=404, detail="Preferencias no configuradas")

    presupuesto = datos_usuario['presupuesto_max']
    zonas = datos_usuario['zona'] or []
    ciudad = datos_usuario.get('ciudad', '')
    descripcion_usuario = datos_usuario['descripcion']

    pref_raw = datos_usuario['preferencias']
    preferencias = json.loads(pref_raw) if isinstance(pref_raw, str) else pref_raw
    
    viviendas_validas = await engine.get_viviendas_validas(presupuesto, zonas, ciudad, request.id_inquilino, database.db_pool)

    print(f"[DEBUG] presupuesto_max={presupuesto}, zona={zonas}")
    print(f"[DEBUG] viviendas_validas encontradas: {len(viviendas_validas)}")

    mejores_pisos = engine.generar_ranking_viviendas(preferencias, descripcion_usuario, viviendas_validas)

    return mejores_pisos

@app.post("/recomendar/companeros")
async def recomendar_companeros(request: RecommendationRequest):
    datos_usuario = await engine.get_preferencias_companeros_usuario(request.id_inquilino, database.db_pool)

    if not datos_usuario or not datos_usuario['zona'] or not datos_usuario['perfil_social']:
        raise HTTPException(status_code=404, detail="Preferencias no configuradas")

    pref_raw = datos_usuario['preferencias']
    preferencias_a = json.loads(pref_raw) if isinstance(pref_raw, str) else pref_raw

    perfil_soc_raw = datos_usuario['perfil_social']
    perfil_social_a = json.loads(perfil_soc_raw) if isinstance(perfil_soc_raw, str) else perfil_soc_raw

    real_raw = datos_usuario['vector_realidad']
    vector_realidad_a = json.loads(real_raw) if isinstance(real_raw, str) else real_raw

    ciudad = datos_usuario.get('ciudad', '');

    descripcion_usuario = datos_usuario.get('descripcion')
    if not descripcion_usuario:
        descripcion_usuario = ""

    candidatos = await engine.get_companeros_validos(request.id_inquilino, datos_usuario['zona'], ciudad, database.db_pool)

    ranking_companeros = engine.get_ranking_companeros(preferencias_a,
                                                       perfil_social_a,
                                                       vector_realidad_a,
                                                       datos_usuario['sexo'],
                                                       descripcion_usuario,
                                                       candidatos,
                                                       )
    
    return ranking_companeros

@app.post("/interaccion")
async def interactuar(interaccion: Interaction):
    await engine.set_interaction(interaccion.id_inquilino, interaccion.id_anuncio, interaccion.tipo, interaccion.peso, database.db_pool)

@app.post("/recomendar/anuncios/volatil")
async def buscar_anuncios_volatil(request: BusquedaVolatilRequest):
    # Obtenemos la descripción del usuario para el análisis NLP de descripciones
    query_desc = "SELECT descripcion FROM Inquilino WHERE id_inquilino = $1"
    desc_row = await database.db_pool.fetchrow(query_desc, request.id_inquilino)

    descripcion_usuario = desc_row['descripcion'] if (desc_row and desc_row['descripcion']) else ""

    # Buscamos viviendas usando los filtros temporales del request
    viviendas_validas = await engine.get_viviendas_validas(
        request.presupuesto_max, request.zona, request.ciudad, request.id_inquilino, database.db_pool
    )

    # Las ordenamos usando las preferencias temporales del request
    mejores_pisos = engine.generar_ranking_viviendas(request.preferencias, descripcion_usuario, viviendas_validas)

    return mejores_pisos

@app.post("/recomendar/companeros/volatil")
async def buscar_companeros_volatil(request: BusquedaVolatilRequest):
    # 1. Obtenemos tu propio perfil social y de realidad de la base de datos para poder compararte
    query_user = """
        SELECT p.perfil_social, i.vector_realidad, u.sexo, p.preferencias 
        FROM Preferencias_Inquilinos p
        JOIN Inquilino i ON i.id_inquilino = p.id_inquilino
        JOIN Usuarios u ON u.id_usuario = p.id_inquilino
        WHERE p.id_inquilino = $1
    """
    user_row = await database.db_pool.fetchrow(query_user, request.id_inquilino)
    
    if not user_row:
        return []

    # Extraemos tus variables y las convertimos a JSON
    pref_raw = user_row['preferencias']
    preferencias_a = json.loads(pref_raw) if isinstance(pref_raw, str) else pref_raw

    perfil_soc_raw = user_row['perfil_social']
    perfil_social_a = json.loads(perfil_soc_raw) if isinstance(perfil_soc_raw, str) else perfil_soc_raw

    real_raw = user_row['vector_realidad']
    vector_realidad_a = json.loads(real_raw) if isinstance(real_raw, str) else real_raw

    descripcion_usuario = user_row.get('descripcion')
    if not descripcion_usuario:
        descripcion_usuario = ""

    # 2. Buscamos compañeros que estén en la zona/ciudad volátil que has tecleado
    candidatos = await engine.get_companeros_validos(request.id_inquilino, request.zona, request.ciudad, database.db_pool)

    # 3. Calculamos la afinidad y los ordenamos
    ranking_companeros = engine.get_ranking_companeros(
        preferencias_a, 
        perfil_social_a,
        vector_realidad_a,
        user_row['sexo'],
        descripcion_usuario,
        candidatos
    )
    
    return ranking_companeros

