/**
 * bootstrap.js - Carga las vistas HTML y arranca la aplicación
 *
 * Las vistas están en src/ui/views/ y se montan en los
 * contenedores definidos en index.html.
 */

const VIEWS = [
    { mountId: 'viewMount-login',    file: 'ui/views/loginView.html'    },
    { mountId: 'viewMount-register', file: 'ui/views/registerView.html' },
    { mountId: 'viewMount-feed',     file: 'ui/views/feedView.html'     },
    { mountId: 'viewMount-profile',  file: 'ui/views/profileView.html'  },
    { mountId: 'viewMount-chat',     file: 'ui/views/chatView.html'     }
];

async function mountViews() {
    for (const view of VIEWS) {
        const mount = document.getElementById(view.mountId);
        if (!mount) continue;

        try {
            const response = await fetch(view.file, { cache: 'no-store' });
            if (!response.ok) throw new Error(`No se pudo cargar ${view.file}`);
            mount.innerHTML = await response.text();
        } catch (error) {
            console.error('[BOOTSTRAP]', error?.message || error);
        }
    }
}

async function bootstrapApp() {
    await mountViews();

    if (typeof window.loadLucideIcons === 'function') {
        window.loadLucideIcons();
    }

    await import('./main.js');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrapApp);
} else {
    bootstrapApp();
}
