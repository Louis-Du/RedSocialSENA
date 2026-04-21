// MockNews.js
// Datos simulados y utilidades para el panel de noticias.

const MOCK_NEWS = [
    {
        id: 'news-1',
        titulo: 'SENA abre nuevas convocatorias para formacion virtual 2026',
        descripcion: 'La oferta incluye programas en desarrollo de software, analitica de datos y habilidades digitales.',
        contenido: 'El Servicio Nacional de Aprendizaje anuncio la apertura de una nueva convocatoria nacional para programas virtuales. Los aspirantes podran inscribirse sin costo y acceder a rutas de formacion por niveles.',
        categoria: 'Convocatoria',
        autor: 'Equipo Comunicaciones SENA',
        fecha: '2026-03-05T10:30:00.000Z',
        lecturas: 1832,
        imagen: 'assets/noticias/noticia1.webp',
        destacada: true
    },
    {
        id: 'news-2',
        titulo: 'Feria de empleo regional conectara aprendices con 40 empresas',
        descripcion: 'Se realizaran entrevistas rapidas y talleres de hoja de vida para egresados y aprendices activos.',
        contenido: 'La feria tendra espacios de reclutamiento, revision de perfil y charlas sobre tendencias del mercado laboral. La jornada sera presencial con cupos limitados en cada franja horaria.',
        categoria: 'Empleo',
        autor: 'Agencia Publica de Empleo',
        fecha: '2026-03-04T14:20:00.000Z',
        lecturas: 1545,
        imagen: 'assets/noticias/noticia2.webp',
        destacada: true
    },
    {
        id: 'news-3',
        titulo: 'Nueva ruta de capacitacion en ciberseguridad para instructores',
        descripcion: 'El programa contempla laboratorios guiados y certificacion en buenas practicas de seguridad.',
        contenido: 'La Escuela Nacional de Instructores habilito una ruta de actualizacion con sesiones sincronicas y trabajo aplicado. El enfoque principal estara en prevencion de incidentes y gestion de riesgos.',
        categoria: 'Capacitación',
        autor: 'Escuela Nacional de Instructores',
        fecha: '2026-03-02T09:00:00.000Z',
        lecturas: 1220,
        imagen: 'assets/noticias/noticia1.webp',
        destacada: false
    },
    {
        id: 'news-4',
        titulo: 'Programa de formacion dual fortalecera practicas con empresas aliadas',
        descripcion: 'Se ampliaran convenios para que mas aprendices combinen estudio y experiencia real en industria.',
        contenido: 'La estrategia de formacion dual busca mejorar la empleabilidad mediante proyectos reales y acompanamiento de instructores. Las regionales priorizaran sectores de manufactura y tecnologia.',
        categoria: 'Formación',
        autor: 'Direccion de Formacion Profesional',
        fecha: '2026-02-27T16:15:00.000Z',
        lecturas: 980,
        imagen: 'assets/noticias/noticia2.webp',
        destacada: false
    },
    {
        id: 'news-5',
        titulo: 'Convocatoria especial para semilleros de innovacion educativa',
        descripcion: 'Centros de formacion podran presentar propuestas de aula con enfoque en tecnologia y territorio.',
        contenido: 'Los proyectos seleccionados recibiran mentoria y acompanamiento para su implementacion. Las postulaciones deben incluir plan de impacto y medicion de resultados.',
        categoria: 'Convocatoria',
        autor: 'Subdireccion Academica',
        fecha: '2026-02-25T08:40:00.000Z',
        lecturas: 765,
        imagen: 'assets/noticias/noticia1.webp',
        destacada: false
    },
    {
        id: 'news-6',
        titulo: 'Bootcamp de empleabilidad reforzara habilidades blandas y entrevistas',
        descripcion: 'La iniciativa incluye simulaciones de entrevista y retroalimentacion personalizada.',
        contenido: 'Durante cuatro semanas, los participantes trabajaran comunicacion efectiva, perfil profesional y preparacion para procesos de seleccion. Habra sesiones virtuales y presenciales.',
        categoria: 'Empleo',
        autor: 'Bienestar al Aprendiz',
        fecha: '2026-02-22T11:10:00.000Z',
        lecturas: 642,
        imagen: 'assets/noticias/noticia2.webp',
        destacada: false
    }
];

let cachedNews = null;

function cloneNews(newsList) {
    return newsList.map(news => ({ ...news }));
}

export function initializeMockNews() {
    if (!cachedNews) {
        cachedNews = cloneNews(MOCK_NEWS);
    }

    return cloneNews(cachedNews);
}

export function getAllNews() {
    return initializeMockNews();
}

export function getNewsById(newsId) {
    const id = String(newsId);
    return getAllNews().find(news => String(news.id) === id) || null;
}

export function getFeaturedNews(limit = 3) {
    return getAllNews()
        .sort((a, b) => {
            if (a.destacada === b.destacada) {
                return (b.lecturas || 0) - (a.lecturas || 0);
            }
            return Number(b.destacada) - Number(a.destacada);
        })
        .slice(0, limit);
}

export function sortNewsByDate(newsList = getAllNews()) {
    return [...newsList].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
}

export function sortNewsByReads(newsList = getAllNews()) {
    return [...newsList].sort((a, b) => (b.lecturas || 0) - (a.lecturas || 0));
}

export function getNewsByCategory(category) {
    if (!category) {
        return getAllNews();
    }

    const normalizedCategory = String(category).trim().toLowerCase();
    return getAllNews().filter(
        news => String(news.categoria).trim().toLowerCase() === normalizedCategory
    );
}
