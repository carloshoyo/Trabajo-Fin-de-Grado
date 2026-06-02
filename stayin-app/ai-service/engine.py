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
        descripcion_texto = vivienda.get("descripcion", "")
        feedback = vivienda.get("feedback_score", 0)

        caracteristicas_raw = vivienda.get("caracteristicas", "{}")
        caracteristicas_json = json.loads(caracteristicas_raw) if isinstance(caracteristicas_raw, str) else caracteristicas_raw


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
        SELECT p.presupuesto_max, p.zona, p.preferencias, i.descripcion 
        FROM Preferencias_Inquilinos p
        JOIN Inquilino i ON p.id_inquilino = i.id_inquilino 
        WHERE p.id_inquilino = $1
    """
    resultado = await pool.fetchrow(query, id_usuario)

    return resultado

async def get_preferencias_companeros_usuario(id_usuario, pool):
    query = """
        SELECT p.perfil_social, p.preferencias, p.zona, i.vector_realidad, u.sexo 
        FROM Preferencias_Inquilinos p
        JOIN Usuarios u ON p.id_inquilino = u.id_usuario
        JOIN Inquilino i ON i.id_inquilino = u.id_usuario
        WHERE p.id_inquilino = $1
    """

    resultado = await pool.fetchrow(query, id_usuario)

    return resultado

async def get_companeros_validos(id_usuario, zona, pool):
    query = """
        SELECT i.vector_realidad, p.zona, p.perfil_social, p.preferencias, u.sexo, u.username, u.nombre
        FROM Inquilino i
        JOIN Preferencias_Inquilinos p ON p.id_inquilino = i.id_inquilino
        JOIN Usuarios u ON u.id_usuario = i.id_inquilino
        WHERE i.id_inquilino != $1 AND p.zona && $2
    """
    
    resultado = await pool.fetch(query, id_usuario, zona)

    return resultado

def get_ranking_companeros(pref_a_generales: dict, perfil_social_a: dict, real_a: dict, sexo_a: str, candidatos: list, top_n: int = 20) -> list:
    ranking_temporal = []

    for c in candidatos:
        candidato = dict(c)
        id_candidato = candidato.get("id_inquilino")
        pref_b_raw = candidato.get("preferencias", "{}") 
        perfil_social_b_raw = candidato.get("perfil_social", "{}")
        real_b_raw = candidato.get("vector_realidad", "{}")
        sexo_b = candidato.get("sexo", "").lower()

        pref_b = json.loads(pref_b_raw) if isinstance(pref_b_raw, str) else pref_b_raw
        perfil_social_b = json.loads(perfil_social_b_raw) if isinstance(perfil_social_b_raw, str) else perfil_social_b_raw
        real_b = json.loads(real_b_raw) if isinstance(real_b_raw, str) else real_b_raw
        
        # Comprobacióndel primer filtro barrera, la compatibilidad en la preferencia de género
        # Compatibilidad de A con B
        genero_req_a = pref_a_generales.get("convivencia_normas", {}).get("genero_inquilinos", "indiferente").lower()
        if (genero_req_a != "indiferente" or genero_req_a != "indefinido") and genero_req_a != sexo_b:
            continue # El candidato B es descartado al instante

        # Compatibilidad de B con A
        genero_req_b = pref_b.get("convivencia_normas", {}).get("genero_inquilinos", "indiferente").lower()
        if (genero_req_b != "indiferente" or genero_req_b != "indefinido") and genero_req_b != sexo_a:
            continue # Al candidato B no le gustaría convivir con el Usuario A

        # Comprobación del segundo filtro barrera, la compatibilidad en la ocupación
        ocupacion_req_a = pref_a_generales.get("convivencia_normas", {}).get("ocupacion_inquilinos", "indiferente").lower()
        ocupacion_real_b = candidato.get("ocupacion", "").lower()
        if ocupacion_req_a != "indiferente" and ocupacion_req_a != ocupacion_real_b:
            continue # Los usuarios no buscan el mismo perfil de compañero

        try:
            # Importante: Le pasamos los perfiles sociales puros (solo los números del 1 al 5), no las preferencias generales
            score_final = motor_social.scoring_usuarios(perfil_social_a, real_a, perfil_social_b, real_b)
            
            if score_final > 0.0:
                ranking_temporal.append({
                    "id_inquilino": id_candidato,
                    "username": candidato.get("username"),
                    "nombre": candidato.get("nombre"),
                    "score_afinidad": score_final
                })
        except Exception as e:
            print(f"Error evaluando al candidato {id_candidato}: {e}")
            continue

    # Ordenamos de mayor a menor porcentaje y devolvemos el top N
    ranking_ordenado = sorted(ranking_temporal, key=lambda x: x["score_afinidad"], reverse=True)
    return ranking_ordenado[:top_n]

async def get_viviendas_validas(precio, cp, id_inquilino, pool):
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
            AND i.id_inquilino = $3
        WHERE a.precio <= $1 
        AND v.cpostal = ANY ($2)
        GROUP BY a.id_anuncio, v.id_vivienda
        HAVING COALESCE(SUM(i.peso_interaccion), 0) >= 0;
    """
    resultado = await pool.fetch(query, precio, cp, id_inquilino)

    return resultado

async def set_interaction(id_usuario, id_anuncio, tipo, peso, pool):
    query = """
        INSERT INTO Interacciones_Anuncios
        (id_inquilino, id_anuncio, tipo_interaccion, peso_interaccion)
        VALUES
        ($1, $2, $3, $4)
    """

    await pool.execute(query, id_usuario, id_anuncio, tipo, peso)