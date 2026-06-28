from sentence_transformers import SentenceTransformer, util
from math import sqrt, pow

class MotorRecomendacion:
    def __init__(self, penalizacion_unidades = 25) -> None:
        self.penalizacion = penalizacion_unidades

        print("Cargando modelo NLP...")
        self.modelo_nlp = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')
        print("✅Modelo NLP cargado correctamente")

        # Diccionario que actúa como dispatcher para elegir rápidamente la función correcta
        self.enrutador = {
            # Variables de Conjuntos (Arrays)
            "gastos_incluidos": self.evaluar_array,
            "tipo_inmueble": self.evaluar_array,

            # Variables Numéricas (Tope de Fricción)
            "meses_fianza_max": self.evaluar_friccion,
            "estancia_minima_meses": self.evaluar_friccion,

            # Variables Numéricas (Umbral Mínimo)
            "banos_minimos": self.evaluar_minimo,

            # Variables Binarias / Exactas
            "cama_doble": self.evaluar_exacta,
            "zona_estudio": self.evaluar_exacta,
            "bano_privado": self.evaluar_exacta,
            "ascensor": self.evaluar_exacta,
            "climatizacion": self.evaluar_exacta,
            "lgtb-friendly": self.evaluar_exacta,

            # Variable con opción de indiferente
            "genero_inquilinos": self.evaluar_exacta_indiferente,
            "ocupacion_inquilinos": self.evaluar_exacta_indiferente,

            # Variables con proximidad en la escala
            "visitas": lambda d, r: self.evaluar_proximidad(d, r, ["rara_vez", "ocasional", "a_menudo"]),
            "limpieza": lambda d, r: self.evaluar_proximidad(d, r, ["ocasional", "a_menudo", "turnos_estrictos"]),
            "ambiente": lambda d, r: self.evaluar_proximidad(d, r, ["estudio", "tranquilo", "animado"])

        }

    # Para los casos de gastos, tipo de vivienda, etc. (Varios valores posibles a solicitar), donde la no presencia de un elemento
    # restará puntos
    def evaluar_array(self, solicitado: list, ofrecido: list) -> float:
        items_pedidos = set(solicitado)
        items_ofrecidos = set(ofrecido)

        # Devuelvo 100 en caso de que el usuario no haya especificado ninguna característica
        if not solicitado:
            return 100.0
        
        aciertos = len(items_pedidos.intersection(items_ofrecidos))
        total_pedido = len(items_pedidos)

        score = (aciertos / total_pedido) * 100

        return score
        
    # Para aquellos casos donde si el valor es menor o igual al solicitado el score es 100%
    # por ejemplo: numero de baños, metros cuadrados, etc.
    def evaluar_minimo(self, deseado: int, real: int) -> float:
        if deseado <= real:
            return 100.0
        else:
            pen = (deseado - real) * self.penalizacion
            score = 100.0 - pen
            if score >= 0:
                return score
            else:
                return 0

    # Para aquellos casos donde si el valor es mayor o igual al solicitado el score es 100%
    # por ejemplo: estancia mínima requerida, meses de fianza, etc.
    def evaluar_friccion(self, deseado: int, real: int) -> float:
        if deseado >= real:
            return 100.0
        else:
            pen = (real - deseado) * self.penalizacion
            score = 100.0 - pen
            if score >= 0:
                return score
            else:
                return 0.0
            
    # Función para los casos donde se responda o sí o no (hay o no hay, se puede o no se puede, etc.)
    def evaluar_exacta(self, deseado: bool, real: bool) -> float:
        if deseado == real:
            return 100.0
            
        return 0.0
    
    def evaluar_exacta_indiferente(self, deseado: str, real: str):
        if deseado == real or deseado == "indiferente":
            return 100.0
        
        return 0.0
    
    def evaluar_proximidad(self, deseado: str, real: str, escala: list) -> float:
        if not deseado:
            return 100.0
        
        if deseado == real or (real == "indiferente" or deseado == "indiferente"):
            return 100.0
        
        if deseado not in escala or real not in escala:
            return 0.0
        
        idx_deseado = escala.index(deseado)
        idx_real = escala.index(real)
        
        distancia = abs(idx_deseado - idx_real)
        distancia_maxima = len(escala) - 1 # Si hay 3 elementos, la distancia máxima es 2
        
        # Cuanta más distancia, menor puntuación
        score = 100.0 - ((distancia / distancia_maxima) * 100.0)
        return score
    
    def codificar(self, texto: str):
        # Devuelve el embedding de un texto (o None si está vacío). Útil para precalcular
        # una sola vez el vector de la descripción del usuario y reutilizarlo en bucle.
        if not texto:
            return None
        return self.modelo_nlp.encode(texto, convert_to_tensor=True)

    def evaluar_semantica(self, descripcion_usuario: str, descripcion_anuncio: str, emb_usuario=None) -> float:
        if not descripcion_usuario or not descripcion_anuncio:
            return 50.0

        # Calculamos los tensores con encode y convert_to_tensor = True.
        # Si el embedding del usuario ya viene precalculado, lo reutilizamos para no
        # recodificar la misma descripción en cada iteración del ranking.
        vector_usuario = emb_usuario if emb_usuario is not None else self.modelo_nlp.encode(descripcion_usuario, convert_to_tensor=True)
        vector_anuncio = self.modelo_nlp.encode(descripcion_anuncio, convert_to_tensor=True)

        # Umbral calibrado como 100%
        umbral = 0.4

        # Cálculo de la Similitud del Coseno
        # Devuelve un tensor 2D, sacamos el número real con .item()
        similitud = util.cos_sim(vector_usuario, vector_anuncio).item()

        # Normalizamos la escala [-1, 1] a [0, 100]
        if similitud < 0.0:
            return 0.0
        
        score_nlp = ((similitud) / umbral) * 100.0
        # score_nlp = ((similitud + 1.0) / 2.0) * 100.0

        if(score_nlp >= 100):
            return 100.0
        
        return round(score_nlp, 2)
    
    def calcular_score_vivienda(self, pref_usuario: dict, caracteristicas_piso: dict, descripcion_usuario: str = "", descripcion_anuncio: str = "", emb_usuario=None) -> float:
        # Acumuladores globales
        score_total_acumulado = 0.0
        peso_modulo_activo = 0.0
        # Valor por defecto: si el usuario no tiene ningún módulo de preferencias válido,
        # el score matemático es 0 y la vivienda se evalúa solo por la parte semántica (NLP),
        # evitando un NameError que descartaría la vivienda.
        score_matematico = 0.0

        # Peso de cada parte en la calificación final
        alfa = 0.8
        beta = 0.2

        for modulo in pref_usuario:
            if modulo not in PESOS_SISTEMA["modulos"]:
                continue

            peso_del_modulo = PESOS_SISTEMA["modulos"][modulo]
            
            # Acumuladores locales del módulo 
            score_interno_acumulado = 0.0
            peso_interno_activo = 0.0

            for interno, peso_interno in PESOS_SISTEMA["internos"][modulo].items():
                funcion = self.enrutador.get(interno)
                
                if funcion:
                    valor_usuario = pref_usuario[modulo].get(interno)
                    
                    if valor_usuario is None:
                        continue
                        
                    valor_anuncio = caracteristicas_piso.get(modulo, {}).get(interno)
                    
                    # Ejecución de la ufnción asociada en cada caso
                    nota_caracteristica = funcion(valor_usuario, valor_anuncio)
                    
                    # Acumulamos aplicando su peso relativo
                    score_interno_acumulado += nota_caracteristica * (peso_interno / 100.0)
                    peso_interno_activo += peso_interno

            # Cierre del módulo
            if peso_interno_activo > 0.0:
                # Extraemos la nota real del módulo sobre 100, ignorando lo que venía vacío
                nota_modulo = (score_interno_acumulado / peso_interno_activo) * 100.0
                
                # Lo transferimos al acumulador global
                score_total_acumulado += nota_modulo * (peso_del_modulo / 100.0)
                peso_modulo_activo += peso_del_modulo

        # Cierre final de la vivienda
        if peso_modulo_activo > 0.0:
            score_matematico = (score_total_acumulado / peso_modulo_activo) * 100.0

        score_nlp = self.evaluar_semantica(descripcion_usuario, descripcion_anuncio, emb_usuario)

        print("Score NLP: ", score_nlp)
        print("Score matemático: ", score_matematico)

        score_final = (score_matematico * alfa) + (score_nlp * beta)
            
        return round(score_final, 2)

class MotorCompaneros:
    def __init__(self) -> None:
        pass

    def aplanar_vector(self, diccionario: dict) -> list:
        vector_plano = []
        
        # 1. Extraemos las claves y las ordenamos alfabéticamente
        # Esto garantiza que 'comunicacion' siempre se evalúe antes que 'higiene',
        # asegurando que los índices [0, 1, 2...] de ambos usuarios coincidan.
        claves_ordenadas = sorted(diccionario.keys())
        
        for clave in claves_ordenadas:
            valor = diccionario[clave]
            
            # 2. Si el valor es otro diccionario (sub-nodo), aplicamos recursividad
            if isinstance(valor, dict):
                vector_plano.extend(self.aplanar_vector(valor))
                
            # 3. Si llegamos al valor final (el número del 1 al 5), lo guardamos
            elif isinstance(valor, (int, float)):
                vector_plano.append(valor)
                
        return vector_plano

    def distancia_euclidea(self, vector1, vector2) -> float:
        if(len(vector1) != len(vector2)):
            return 0.0
    
        sum = 0.0

        for coord in range(len(vector1)):
            sum += pow((vector1[coord] - vector2[coord]), 2)

        distancia = sqrt(sum)

        return distancia

    def afinidad_usuarios(self, vector1, vector2) -> float:
        if(len(vector1) != len(vector2)):
            return 0.0
        distancia = self.distancia_euclidea(vector1, vector2)

        n = len(vector1)

        distancia_max = sqrt(n * pow(4, 2))

        afinidad = (1 - (distancia / distancia_max)) * 100

        return afinidad
    
    def scoring_usuarios(self, pref_a: dict, real_a: dict, pref_b: dict, real_b: dict, score_nlp: float = 50.0) -> float:
        vector_pref_a = self.aplanar_vector(pref_a)
        vector_pref_b = self.aplanar_vector(pref_b)
        vector_real_a = self.aplanar_vector(real_a)
        vector_real_b = self.aplanar_vector(real_b)

        afinidad_a_b = self.afinidad_usuarios(vector_pref_a, vector_real_b)
        afinidad_b_a = self.afinidad_usuarios(vector_pref_b, vector_real_a)

        if afinidad_a_b == 0 or afinidad_b_a == 0:
            return 0.0

        # Cálculo de la media armónica (Score Matemático)
        scoring_matematico = 2 / ((1 / afinidad_a_b) + (1 / afinidad_b_a))

        # Combinación con NLP
        alfa = 0.8
        beta = 0.2
        score_final = (scoring_matematico * alfa) + (score_nlp * beta)

        return round(score_final, 2)
        

# Variable para almacenar el peso de cada modulo de preferencias y, a su vez, de todos los aspectos
# internos de cada módulo
PESOS_SISTEMA = {    
    "modulos": {
        "economia_contrato": 40.0,
        "convivencia_normas": 30.0,
        "caracteristicas_vivienda": 15.0,
        "habitacion": 15.0
    },    
    
    "internos": {
        "economia_contrato": {
            "gastos_incluidos": 50.0,
            "estancia_minima_meses": 30.0,
            "meses_fianza_max": 20.0
        },
        "convivencia_normas": {
            "ambiente": 40.0,
            "limpieza": 30.0,
            "visitas": 15.0,
            "ocupacion_inquilinos": 9.0,
            "genero_inquilinos": 4.0,
            "lgtb-friendly": 2.0
        },
        "habitacion": {
            "bano_privado": 30.0,
            "cama_doble": 35.0,
            "zona_estudio": 35.0
        },
        "caracteristicas_vivienda": {
            "tipo_inmueble": 40.0,
            "banos_minimos": 30.0,
            "climatizacion": 20.0,
            "ascensor": 10.0
        }
    }
}

if __name__ == "__main__":
    print("Iniciando prueba unitaria del Motor Algebraico...")

    # Descripciones usuario y anuncio
    texto_usuario = "Soy un estudiante tranquilo, me gusta el silencio y estudiar en casa. Odio el ruido."
    texto_anuncio = "Buscamos a alguien calmado, el piso es un templo de estudio. No se admiten fiestas."

    descripcion_prueba1 = "Estudiante de máster, tranquila pero me gusta convivir. Busco un piso donde se respete el estudio entre semana y se puedan compartir cenas los fines de semana. Soy ordenada y cuido los espacios comunes."
    descripcion_prueba2 = "Trabajo por las mañanas y madrugo, así que llevo un ritmo tranquilo. Me gusta tener la casa recogida y un ambiente relajado. Disfruto cocinando y charlando un rato, aunque también valoro mi espacio."

    # Ejemplo preferencias usuario
    mock_usuario = {
        "economia_contrato": {
            "gastos_incluidos": ["agua", "internet"], 
            "estancia_minima_meses": 6,
            "meses_fianza_max": 1
        },
        "convivencia_normas": {
            "visitas": "ocasional",          # Ahora usa la escala ordinal
            "limpieza": "turnos_estrictos",  # Ahora usa la escala ordinal
            "ambiente": "estudio",
            "ocupacion_inquilinos": "solo_estudiantes",
            "genero_inquilinos": "indiferente", # Prueba del comodín
            "lgtb-friendly": True
        },
        "caracteristicas_vivienda": {
            "banos_minimos": 2,
            "tipo_inmueble": ["piso", "atico"] # Asumiendo que prefieres que sea un array
        }
    }

    # Ejemplo características anuncio 1
    mock_piso = {
        "economia_contrato": {
            "gastos_incluidos": ["agua"], 
            "estancia_minima_meses": 6,   
            "meses_fianza_max": 2         
        },
        "convivencia_normas": {
            "visitas": "ocasional",          # 100% de afinidad
            "limpieza": "a_menudo",          # Falla por un nivel de proximidad (debería dar nota parcial)
            "ambiente": "animado",           # Falla por dos niveles (mucha penalización)
            "ocupacion_inquilinos": "solo_estudiantes",
            "genero_inquilinos": "femenino", # El usuario dijo indiferente, así que 100%
            "lgtb-friendly": True
        },
        "caracteristicas_vivienda": {
            "banos_minimos": 3,            
            "tipo_inmueble": ["piso"]        # Coincide en 1 de 2 solicitados
        }
    }

    # Ejemplo características anuncio 1
    mock_piso2 = {
        "economia_contrato": {
            "gastos_incluidos": [], 
            "estancia_minima_meses": 12,
            "meses_fianza_max": 6
        },
        "convivencia_normas": {
            "visitas": "rara_vez",          # Ahora usa la escala ordinal
            "limpieza": "ocasional",  # Ahora usa la escala ordinal
            "ambiente": "animado",
            "ocupacion_inquilinos": "erasmus",
            "genero_inquilinos": "femenino", # Prueba del comodín
            "lgtb-friendly": False
        },
        "caracteristicas_vivienda": {
            "banos_minimos": 1,
            "tipo_inmueble": ["duplex", "bajo"] # Asumiendo que prefieres que sea un array
        }
    }

    # Ejemplo 3, con un 100% de compatibilidad con el usuario
    mock_piso3 = {
        "economia_contrato": {
            "gastos_incluidos": ["agua", "internet"], 
            "estancia_minima_meses": 6,
            "meses_fianza_max": 1
        },
        "convivencia_normas": {
            "visitas": "ocasional",          # Ahora usa la escala ordinal
            "limpieza": "turnos_estrictos",  # Ahora usa la escala ordinal
            "ambiente": "estudio",
            "ocupacion_inquilinos": "solo_estudiantes",
            "genero_inquilinos": "indiferente", # Prueba del comodín
            "lgtb-friendly": True
        },
        "caracteristicas_vivienda": {
            "banos_minimos": 2,
            "tipo_inmueble": ["piso", "atico"] # Asumiendo que prefieres que sea un array
        }
    }

    mock_pref_usuario2 = {
        "higiene_y_orden": {
            "frecuencia_limpieza": 5,
            "gestion_vajilla": 4,
            "zonas_comunes": 5
        },
        "economia_y_responsabilidad": {
            "puntualidad_pagos": 5,
            "gastos_compartidos": 4,
            "consumo_responsable": 3
        },
        "ruido_y_horarios": {
            "respeto_descanso": 5
        },
        "visitas": {
            "frecuencia_visitas": 2,
            "respeto_zonas_comunes": 4
        },
        "comunicacion": {
            "resolucion_conflictos": 4,
            "empatia": 5,
            "expresividad": 3
        },
        "respeto_propiedad": {
            "cuidado_mobiliario": 5
        }
    }

    mock_real_usuario2 = {
        "higiene_y_orden": {
            "frecuencia_limpieza": 4,
            "gestion_vajilla": 3,
            "zonas_comunes": 4
        },
        "economia_y_responsabilidad": {
            "puntualidad_pagos": 4,
            "gastos_compartidos": 4,
            "consumo_responsable": 3
        },
        "ruido_y_horarios": {
            "respeto_descanso": 5
        },
        "visitas": {
            "frecuencia_visitas": 3,
            "respeto_zonas_comunes": 3
        },
        "comunicacion": {
            "resolucion_conflictos": 4,
            "empatia": 4,
            "expresividad": 3
        },
        "respeto_propiedad": {
            "cuidado_mobiliario": 4
        }
    }

    mock_pref_companero1 = {
        "higiene_y_orden": {
            "frecuencia_limpieza": 5,
            "gestion_vajilla": 4,
            "zonas_comunes": 5
        },
        "economia_y_responsabilidad": {
            "puntualidad_pagos": 5,
            "gastos_compartidos": 4,
            "consumo_responsable": 3
        },
        "ruido_y_horarios": {
            "respeto_descanso": 5
        },
        "visitas": {
            "frecuencia_visitas": 2,
            "respeto_zonas_comunes": 4
        },
        "comunicacion": {
            "resolucion_conflictos": 4,
            "empatia": 5,
            "expresividad": 3
        },
        "respeto_propiedad": {
            "cuidado_mobiliario": 5
        }
    }

    mock_real_companero1 = {
        "higiene_y_orden": {
            "frecuencia_limpieza": 3,
            "gestion_vajilla": 4,
            "zonas_comunes": 4
        },
        "economia_y_responsabilidad": {
            "puntualidad_pagos": 5,
            "gastos_compartidos": 5,
            "consumo_responsable": 5
        },
        "ruido_y_horarios": {
            "respeto_descanso": 4
        },
        "visitas": {
            "frecuencia_visitas": 4,
            "respeto_zonas_comunes": 4
        },
        "comunicacion": {
            "resolucion_conflictos": 4,
            "empatia": 5,
            "expresividad": 4
        },
        "respeto_propiedad": {
            "cuidado_mobiliario": 5
        }
    }

    # 3. Instanciamos el motor y disparamos la evaluación
    motor = MotorRecomendacion(penalizacion_unidades=25)
    nota_final = motor.calcular_score_vivienda(mock_usuario, mock_piso, descripcion_prueba1, descripcion_prueba2)

    # motor = MotorCompaneros()
    # nota_final = motor.scoring_usuarios(mock_pref_usuario2, mock_real_usuario2, mock_pref_companero1, mock_real_companero1)
    
    print(f"✅ Resultado de la evaluación cruzada: {nota_final}% de afinidad.")