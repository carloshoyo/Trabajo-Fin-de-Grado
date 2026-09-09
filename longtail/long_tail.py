import numpy as np
import matplotlib.pyplot as plt

# 1. Generar los datos teóricos de la curva (Función de ley de potencias)
x = np.linspace(1, 50, 500)
y = 1000 / (x ** 1.2)

# 2. Configurar el estilo del gráfico
plt.figure(figsize=(10, 6))
plt.style.use('seaborn-v0_8-whitegrid')

# 3. Dibujar la línea principal
plt.plot(x, y, color='#2c3e50', linewidth=3)

# 4. Sombrear la "Cabeza" (Hits / Productos populares)
corte = 8 # Punto donde empieza la larga cola
plt.fill_between(x[:corte*10], y[:corte*10], color='#e74c3c', alpha=0.7, 
                 label='Cabeza (Pocos productos, muchas ventas)')

# 5. Sombrear la "Larga Cola" (Nichos)
plt.fill_between(x[corte*10:], y[corte*10:], color='#f39c12', alpha=0.7, 
                 label='Larga Cola (Muchos productos, pocas ventas)')

# 6. Personalizar ejes y textos (Sin números, para que sea conceptual)
plt.title('El modelo de la Larga Cola (Long Tail)', fontsize=16, fontweight='bold', pad=20)
plt.xlabel('Catálogo de Productos (Ordenados por popularidad)', fontsize=12, labelpad=15)
plt.ylabel('Volumen de Ventas / Demanda', fontsize=12, labelpad=15)

# Ocultar los números de los ejes para dejarlo como diagrama conceptual
plt.xticks([]) 
plt.yticks([])

# Añadir leyenda
plt.legend(loc='upper right', fontsize=11)

# 7. Añadir anotaciones de texto en el gráfico
plt.text(4, 300, 'Éxitos\n(Mainstream)', fontsize=12, color="#6C241C", fontweight='bold', ha='center')
plt.text(25, 50, 'Mercado de Nichos', fontsize=12, color='#b9770e', fontweight='bold')

# 8. Guardar la imagen con calidad altísima
plt.tight_layout()
plt.savefig('long_tail_grafico.png', dpi=300) # Cambia a .svg si quieres formato vectorial
plt.show()