import asyncpg
from scoring import MotorRecomendacion, MotorCompaneros
import json

print("Iniciando el motor de recomendación del sistema")
motor_global = MotorRecomendacion(penalizacion_unidades=25)
motor_social = MotorCompaneros()

def generar_ranking_viviendas(
        pref_usuario: dict,
        descripcion_usuario: str,
        viviendas_candidatas: list,
        top_n: int = 20
) -> list:
    ranking_temporal = []

    for v in viviendas_candidatas:
        vivienda = dict(v)
        id_vivienda = vivienda.get("id_vivienda")

        descripcion_texto = vivienda.get("descripcion")
        if not descripcion_texto: # Atrapa tanto None como strings vacíos
            descripcion_texto = ""
            
        feedback = vivienda.get("feedback_score", 0)

        # Extracción segura para que si un anuncio no tiene caracteristicas definidas, no colapse
        caracteristicas_raw = vivienda.get("caracteristicas")
        
        # Si en la base de datos es NULL o un string vacío, forzamos un JSON vacío
        if not caracteristicas_raw:
            caracteristicas_raw = "{}"

        # Lo convertimos a diccionario
        caracteristicas_json = json.loads(caracteristicas_raw) if isinstance(caracteristicas_raw, str) else caracteristicas_raw
        
        # Si por algún motivo json.loads devolvió None, lo forzamos a dict
        if not isinstance(caracteristicas_json, dict):
            caracteristicas_json = {}


        try:
            score_base = motor_global.calcular_score_vivienda(
                pref_usuario=pref_usuario,
                caracteristicas_piso=caracteristicas_json,
                descripcion_usuario=descripcion_usuario,
                descripcion_anuncio=descripcion_texto
            )

            score_final = min(score_base + feedback, 100)
            
            # Guardamos el resultado en nuestra lista temporal
            ranking_temporal.append({
                "id_vivienda": id_vivienda,
                "score_afinidad": score_final,
                "vivienda_data": vivienda # Pasamos el objeto entero para el frontend
            })
            
        except Exception as e:
            print(f"Error evaluando vivienda {id_vivienda}: {e}")
            continue

    # Ordenamos de mayor a mnor puntuación
    ranking_ordenado = sorted(ranking_temporal, key=lambda x: x["score_afinidad"], reverse=True)

    # Devolvemos el top N anuncios
    return ranking_ordenado[:top_n]


async def get_preferencias_anuncios_usuario(id_usuario, pool):
    query = """
        SELECT p.presupuesto_max, p.zona, p.ciudad, p.preferencias, i.descripcion
        FROM Preferencias_Inquilinos p
        JOIN Inquilino i ON p.id_inquilino = i.id_inquilino 
        WHERE p.id_inquilino = $1
    """
    resultado = await pool.fetchrow(query, id_usuario)

    return resultado

async def get_preferencias_companeros_usuario(id_usuario, pool):
    query = """
        SELECT p.perfil_social, p.preferencias, p.zona, p.ciudad, i.vector_realidad, u.sexo, i.descripcion
        FROM Preferencias_Inquilinos p
        JOIN Usuarios u ON p.id_inquilino = u.id_usuario
        JOIN Inquilino i ON i.id_inquilino = u.id_usuario
        WHERE p.id_inquilino = $1
    """

    resultado = await pool.fetchrow(query, id_usuario)

    return resultado

async def get_companeros_validos(id_usuario, zona, ciudad, pool):
    ciudad_limpia = ciudad.split(',')[0].strip() if ciudad else ""

    query = """
        SELECT i.vector_realidad, p.zona, p.perfil_social, p.preferencias, u.sexo, u.username, u.nombre, i.descripcion,
               COALESCE(SUM(int_c.peso_interaccion), 0) AS feedback_score
        FROM Inquilino i
        JOIN Preferencias_Inquilinos p ON p.id_inquilino = i.id_inquilino
        JOIN Usuarios u ON u.id_usuario = i.id_inquilino
        LEFT JOIN Interacciones_Companeros int_c 
            ON int_c.id_valorado = i.id_inquilino 
            AND int_c.id_valorador = $1
        WHERE i.id_inquilino != $1 
        AND (
            (cardinality($2::varchar[]) > 0 AND p.zona && $2)
            OR 
            (cardinality($2::varchar[]) = 0 AND p.ciudad ILIKE $3)
        )
        GROUP BY i.id_inquilino, p.id_inquilino, u.id_usuario
        HAVING COALESCE(SUM(int_c.peso_interaccion), 0) >= 0
    """
    
    resultado = await pool.fetch(query, id_usuario, zona, ciudad_limpia)
    return resultado

def get_ranking_companeros(pref_a_generales: dict, perfil_social_a: dict, real_a: dict, sexo_a: str, descripcion_usuario: str, candidatos: list, top_n: int = 20) -> list:
    ranking_temporal = []

    for c in candidatos:
        candidato = dict(c)
        id_candidato = candidato.get("id_inquilino")
        pref_b_raw = candidato.get("preferencias", "{}") 
        perfil_social_b_raw = candidato.get("perfil_social", "{}")
        real_b_raw = candidato.get("vector_realidad", "{}")
        sexo_b = candidato.get("sexo", "").lower()
        
        # --- BLINDAJE DE EXTRACCIÓN ---
        desc_b = candidato.get("descripcion")
        if not desc_b:
            desc_b = ""
            
        feedback = candidato.get("feedback_score", 0)

        pref_b = json.loads(pref_b_raw) if isinstance(pref_b_raw, str) else pref_b_raw
        perfil_social_b = json.loads(perfil_social_b_raw) if isinstance(perfil_social_b_raw, str) else perfil_social_b_raw
        real_b = json.loads(real_b_raw) if isinstance(real_b_raw, str) else real_b_raw
        
        genero_req_a = pref_a_generales.get("convivencia_normas", {}).get("genero_inquilinos", "indiferente").lower()
        if (genero_req_a != "indiferente" and genero_req_a != "indefinido") and genero_req_a != sexo_b:
            continue

        genero_req_b = pref_b.get("convivencia_normas", {}).get("genero_inquilinos", "indiferente").lower()
        if (genero_req_b != "indiferente" and genero_req_b != "indefinido") and genero_req_b != sexo_a:
            continue

        ocupacion_req_a = pref_a_generales.get("convivencia_normas", {}).get("ocupacion_inquilinos", "indiferente").lower()
        ocupacion_real_b = candidato.get("ocupacion", "").lower()
        if ocupacion_req_a != "indiferente" and ocupacion_req_a != ocupacion_real_b:
            continue 

        try:
            # Obtenemos el Score NLP aprovechando el modelo que ya está en RAM
            score_nlp = motor_global.evaluar_semantica(descripcion_usuario, desc_b)

            # Score Base (Matemático + NLP)
            score_base = motor_social.scoring_usuarios(perfil_social_a, real_a, perfil_social_b, real_b, score_nlp)
            
            # Aplicamos el Boost de Feedback 
            if score_base > 0.0:
                score_final = min(score_base + feedback, 100.0)
                
                ranking_temporal.append({
                    "id_inquilino": id_candidato,
                    "username": candidato.get("username"),
                    "nombre": candidato.get("nombre"),
                    "score_afinidad": score_final
                })
        except Exception as e:
            print(f"Error evaluando al candidato {id_candidato}: {e}")
            continue

    ranking_ordenado = sorted(ranking_temporal, key=lambda x: x["score_afinidad"], reverse=True)
    return ranking_ordenado[:top_n]

async def get_viviendas_validas(precio, cp, ciudad, id_inquilino, pool):
    # Si llega "Granada, España", se queda con "Granada". Si llega " Granada ", quita los espacios extra.
    ciudad_limpia = ciudad.split(',')[0].strip() if ciudad else ""

    query = """
        SELECT 
            a.*, 
            v.*, 
            COALESCE(SUM(i.peso_interaccion), 0) AS feedback_score,
            COALESCE(BOOL_OR(i.tipo_interaccion = 'favoritos'), FALSE) AS es_favorito
        FROM Anuncios a
        JOIN Viviendas v ON a.id_vivienda = v.id_vivienda
        LEFT JOIN Interacciones_Anuncios i 
            ON a.id_anuncio = i.id_anuncio 
            AND i.id_inquilino = $4
        WHERE a.precio <= $1 
        AND (
            -- Si el array de Códigos Postales tiene elementos, filtramos por ellos
            (cardinality($2::varchar[]) > 0 AND v.cpostal = ANY ($2))
            OR 
            -- 2. Uso de ILIKE: ignorará mayúsculas y minúsculas ("granada" será igual a "Granada")
            (cardinality($2::varchar[]) = 0 AND v.ciudad ILIKE $3)
        )
        GROUP BY a.id_anuncio, v.id_vivienda
        HAVING COALESCE(SUM(i.peso_interaccion), 0) >= 0;
    """

    resultado = await pool.fetch(query, precio, cp, ciudad_limpia, id_inquilino)

    return resultado

async def set_interaction(id_usuario, id_anuncio, tipo, peso, pool):
    query = """
        INSERT INTO Interacciones_Anuncios
        (id_inquilino, id_anuncio, tipo_interaccion, peso_interaccion)
        VALUES
        ($1, $2, $3, $4)
    """

    await pool.execute(query, id_usuario, id_anuncio, tipo, peso)