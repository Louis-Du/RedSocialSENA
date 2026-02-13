/**
 * MockNews - Datos de ejemplo para noticias
 * 
 * Proporciona un conjunto de noticias de ejemplo para probar
 * la funcionalidad del panel de noticias
 */

export function initializeMockNews() {
    const mockNews = [
        {
            id: 'news_1',
            titulo: 'Nueva Convocatoria SENA 2024',
            descripcion: 'Se abre una nueva convocatoria para programas de formación en tecnología e innovación. Más de 2000 espacios disponibles.',
            contenido: 'El SENA abre sus puertas para una nueva convocatoria de programas en las áreas de tecnología, servicios y manufactura. Esta oportunidad es para aprendices interesados en formarse en competencias digitales, programación, análisis de datos y mucho más.',
            imagen: 'assets/noticias/noticia1.webp',
            fecha: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            categoria: 'Convocatoria',
            autor: 'SENA',
            destacada: true,
            lecturas: 1250
        },
        {
            id: 'news_2',
            titulo: 'Oportunidades de Práctica en Empresas Líderes',
            descripcion: 'Descubre las empresas que buscan practicantes SENA. Enviar tu CV antes del 15 de diciembre.',
            contenido: 'Grandes empresas del sector tecnológico, financiero y comercial están buscando practicantes SENA para fortalecer sus equipos. Encuentra las mejores oportunidades de práctica empresarial que complementarán tu formación.',
            imagen: 'assets/noticias/noticia2.webp',
            fecha: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            categoria: 'Empleo',
            autor: 'Bolsa de Empleo SENA',
            destacada: true,
            lecturas: 890
        },
        {
            id: 'news_3',
            titulo: 'Webinar: Tendencias en Desarrollo de Software 2024',
            descripcion: 'Únete a nuestro webinar gratuito sobre las tendencias más importantes en desarrollo de software.',
            contenido: 'Especialistas de empresas como Google, Amazon y Globant compartirán sus experiencias sobre las tecnologías más relevantes del momento. Inscripciones abiertas hasta el 30 de noviembre.',
            imagen: 'assets/placeholders/post-1.svg',
            fecha: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            categoria: 'Capacitación',
            autor: 'Dirección de Gestión del Conocimiento',
            destacada: false,
            lecturas: 450
        },
        {
            id: 'news_4',
            titulo: 'Éxito en los Egresados SENA',
            descripcion: 'El 92% de nuestros egresados consigue empleo en los primeros 6 meses. Conoce sus historias de éxito.',
            contenido: 'Historias inspiradoras de aprendices que lograron sus metas profesionales. Daniel Esteban pasó de estudiante a desarrollador senior, María García ahora lidera equipos en una empresa multinacional.',
            imagen: 'assets/placeholders/post-2.svg',
            fecha: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            categoria: 'Egresados',
            autor: 'Seguimiento a Egresados',
            destacada: false,
            lecturas: 2100
        },
        {
            id: 'news_5',
            titulo: 'Certificaciones Internacionales Disponibles',
            descripcion: 'Prepárate para certificaciones globales. Cursos de Google Cloud, AWS y Azure disponibles.',
            contenido: 'Aprovecha los cursos especializados que te preparan para las certificaciones más reconocidas internacionalmente. Aumenta tus oportunidades laborales con credenciales globales.',
            imagen: 'assets/placeholders/post-3.svg',
            fecha: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            categoria: 'Formación',
            autor: 'Coordinación de Programas',
            destacada: false,
            lecturas: 670
        }
    ];
    
    return mockNews;
}

/**
 * Obtiene todas las noticias
 * @returns {Array} Array de noticias
 */
export function getAllNews() {
    return initializeMockNews();
}

/**
 * Obtiene una noticia por ID
 * @param {string} id - ID de la noticia
 * @returns {Object|null} Noticia o null
 */
export function getNewsById(id) {
    const news = initializeMockNews();
    return news.find(n => n.id === id) || null;
}

/**
 * Obtiene noticias destacadas
 * @returns {Array} Noticias marcadas como destacadas
 */
export function getFeaturedNews() {
    const news = initializeMockNews();
    return news.filter(n => n.destacada).slice(0, 3);
}

/**
 * Obtiene noticias por categoría
 * @param {string} categoria - Categoría a filtrar
 * @returns {Array} Noticias de la categoría
 */
export function getNewsByCategory(categoria) {
    const news = initializeMockNews();
    return news.filter(n => n.categoria === categoria);
}

/**
 * Ordena noticias por fecha descendente
 * @param {Array} news - Array de noticias
 * @returns {Array} Noticias ordenadas
 */
export function sortNewsByDate(news) {
    return [...news].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
}

/**
 * Ordena noticias por número de lecturas descendente
 * @param {Array} news - Array de noticias
 * @returns {Array} Noticias ordenadas
 */
export function sortNewsByReads(news) {
    return [...news].sort((a, b) => b.lecturas - a.lecturas);
}
