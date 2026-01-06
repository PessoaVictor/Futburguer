const components = [
    { file: 'navbar', target: 'navbar-placeholder' },
    { file: 'hero', target: 'hero-placeholder' },
    { file: 'features', target: 'features-placeholder' },
    { file: 'menu', target: 'menu-placeholder' },
    { file: 'about', target: 'about-placeholder' },
    { file: 'gallery', target: 'gallery-placeholder' },
    { file: 'cta', target: 'cta-placeholder' },
    { file: 'contact', target: 'contact-placeholder' },
    { file: 'footer', target: 'footer-placeholder' },
    { file: 'whatsapp-btn', target: 'whatsapp-placeholder' }
];

async function loadComponent(file, targetId) {
    try {
        const response = await fetch(`components/${file}.html`);
        const html = await response.text();
        const target = document.getElementById(targetId);
        if (target) {
            target.innerHTML = html;
        }
    } catch (error) {
        console.error(`Erro ao carregar componente ${file}:`, error);
    }
}

export async function loadAllComponents() {
    const promises = components.map(({ file, target }) => loadComponent(file, target));
    await Promise.all(promises);
}
