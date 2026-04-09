# Trabajo-Fin-de-Grado
Repositorio para mi proyecto de fin de grado de Ingeniería Informática.

## Resumen
Este Trabajo de Fin de Grado consistirá en una aplicación para la ayuda en la búsqueda de viviendas y compañeros. Está principalmente orientada a aquellas personas que buscan compartir piso con otras personas y no conocen a nadie, por lo que tendrán que convivir con gente desconocida. No obsante también servirá como portal de vivienda en general para cualquier tipo depersona que busque una vivienda donde vivir, ya sea compartiendo o no con otra gente.

## Características principales
La aplicación cuenta con una serie de distintos aspectos relevantes.
### Sistema de valoraciones
Como se ha comentado, una de las cosas que trata de hacer esta aplicación es facilitar la búsqueda de compañeros. Es por esto que cuenta con un sistema de valoración de compañeros, de manera que, cuando se ha convivido con alguien, se abrirá la posibilidad de realizar una valoración de los aspectos considerados como principales en la convivencia, además de un comentario final opcional. 

Este sistema ayudará a los usuarios de la aplicación a poder encontrar a aquellos usuarios con los que, sobre el papel y respecto a lo que busque cada uno, sean más afines.

Las valoraciones se dan en un rango del 0 al 5 para cada aspecto de la convivencia, siendo 0 una experiencia desastrosa y 5 una experiencia inmejorable. Los aspectos condierados son:

* ### Higiene y orden
  - Frecuencia y calidad de limpieza
  - Gestión de la vajilla
  - Zonas comunes
* ### Economía y responsabilidad
  - Puntualidad de los pagos
  - Gastos compartidos
  - Consumo responsable
* ### Ruido y horarios
  - Respeto de las horas de descanso
* ### Visitas
  - Frecuencia de visitas
  - Uso del espacio  con invitados
* ### Comunicación
  - Reacción ante el conflicto
  - Empatía
  - Forma de comunicar las cosas
* ### Respeto de la propiedad
  - Cuidado del inmobiliario de la vivienda
 
## Arquitectura del sistema
Se trata de un proyecto full-stack donde tenemos la parte de servidor realizada en **Node.js**, el frontend desarrollado con **React Native** y **Expo**, un motor de recomendaciones realizado en **Python** y una base de datos con **PostgreSQL**.
