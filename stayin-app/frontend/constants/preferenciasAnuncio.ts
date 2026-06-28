// Estructura compartida de los filtros/preferencias de búsqueda de anuncios.
// La usan tanto searchScreen (búsqueda volátil) como editProfile (preferencias persistentes).

export const CHIPS_MULTISELECT = [
    { label: 'Tipo de inmueble', seccion: 'caracteristicas_vivienda', campo: 'tipo_inmueble',
      opciones: ['piso', 'ático', 'dúplex', 'bajo', 'estudio'] },
    { label: 'Gastos incluidos', seccion: 'economia_contrato', campo: 'gastos_incluidos',
      opciones: ['agua', 'internet', 'luz', 'gas'] },
];

export const CHIPS_UNICO = [
    { label: 'Ambiente', seccion: 'convivencia_normas', campo: 'ambiente',
      opciones: ['estudio', 'tranquilo', 'animado'] },
    { label: 'Visitas', seccion: 'convivencia_normas', campo: 'visitas',
      opciones: ['rara_vez', 'ocasional', 'a_menudo'] },
    { label: 'Limpieza', seccion: 'convivencia_normas', campo: 'limpieza',
      opciones: ['ocasional', 'a_menudo', 'turnos_estrictos'] },
];

export const TOGGLES_BOOLEANOS = [
    { label: 'Baño privado',  seccion: 'habitacion',              campo: 'bano_privado' },
    { label: 'Cama doble',    seccion: 'habitacion',              campo: 'cama_doble' },
    { label: 'Zona estudio',  seccion: 'habitacion',              campo: 'zona_estudio' },
    { label: 'Ascensor',      seccion: 'caracteristicas_vivienda', campo: 'ascensor' },
    { label: 'LGBT-friendly', seccion: 'convivencia_normas',      campo: 'lgtb-friendly' },
];
