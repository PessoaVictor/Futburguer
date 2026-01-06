/* ========================================
   FUTBURGUER - JAVASCRIPT
   Funcionalidades e Interatividade
   ======================================== */

// ===== GOOGLE REVIEWS DINÂMICOS =====
// Para integrar com Google Places API, você precisará:
// 1. Criar uma chave API no Google Cloud Console
// 2. Ativar a Google Places API
// 3. Adicionar a chave abaixo

async function updateGoogleReviews() {
    // Configuração da API (você precisa adicionar sua chave)
    const GOOGLE_API_KEY = 'SUA_CHAVE_API_AQUI';
    const PLACE_ID = 'ChIJJVKPuGLVswsR95lZ-pBuwfU'; // Place ID do Futburguer
    
    // Se não tiver API key configurada, usa valores padrão
    if (GOOGLE_API_KEY === 'SUA_CHAVE_API_AQUI') {
        console.log('Configure a API key do Google Places para atualizar avaliações dinamicamente');
        return;
    }
    
    try {
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/place/details/json?place_id=${PLACE_ID}&fields=rating,user_ratings_total&key=${GOOGLE_API_KEY}`
        );
        
        const data = await response.json();
        
        if (data.result) {
            // Atualizar avaliação
            const ratingElement = document.getElementById('google-rating');
            if (ratingElement && data.result.rating) {
                ratingElement.textContent = data.result.rating.toFixed(1);
            }
            
            // Atualizar número de avaliações
            const reviewsElement = document.getElementById('google-reviews');
            if (reviewsElement && data.result.user_ratings_total) {
                reviewsElement.textContent = data.result.user_ratings_total.toLocaleString('pt-BR');
            }
        }
    } catch (error) {
        console.error('Erro ao buscar dados do Google:', error);
    }
}

// Atualizar reviews ao carregar a página
// updateGoogleReviews();

// Atualizar a cada 1 hora (3600000 ms)
// setInterval(updateGoogleReviews, 3600000);

// ===== NAVEGAÇÃO =====
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');
const navLinks = document.querySelectorAll('.nav-link');

// Toggle menu mobile
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
    document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
});

// Fechar menu ao clicar em um link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = '';
    });
});

// Navbar scroll effect
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
});

// ===== SCROLL SUAVE =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        
        if (target) {
            const offsetTop = target.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// ===== FILTROS DO CARDÁPIO =====
const filterBtns = document.querySelectorAll('.filter-btn');
const menuItems = document.querySelectorAll('.menu-item');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active de todos os botões
        filterBtns.forEach(b => b.classList.remove('active'));
        // Adiciona active no botão clicado
        btn.classList.add('active');
        
        const filter = btn.getAttribute('data-filter');
        
        menuItems.forEach(item => {
            if (filter === 'all') {
                item.style.display = 'block';
                setTimeout(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'translateY(0)';
                }, 10);
            } else {
                const category = item.getAttribute('data-category');
                
                if (category === filter) {
                    item.style.display = 'block';
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'translateY(0)';
                    }, 10);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 300);
                }
            }
        });
    });
});

// ===== ADICIONAR AO CARRINHO =====
const addToCartBtns = document.querySelectorAll('.menu-item-footer .btn-primary');

addToCartBtns.forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Feedback visual
        const originalText = this.innerHTML;
        this.innerHTML = '<i class="fas fa-check"></i> Adicionado!';
        this.style.background = '#4caf50';
        
        // Criar elemento de animação
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: linear-gradient(135deg, #4caf50, #45a049);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
            z-index: 10000;
            animation: slideInRight 0.3s ease-out;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            font-weight: 600;
        `;
        notification.innerHTML = '<i class="fas fa-check-circle"></i> Item adicionado ao carrinho!';
        document.body.appendChild(notification);
        
        // Remover notificação após 3 segundos
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
        
        // Resetar botão após 2 segundos
        setTimeout(() => {
            this.innerHTML = originalText;
            this.style.background = '';
        }, 2000);
    });
});

// Adicionar animações CSS dinamicamente
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ===== FORMULÁRIO DE CONTATO =====
const contactForm = document.getElementById('contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validação básica
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const subject = document.getElementById('subject').value;
        const message = document.getElementById('message').value.trim();
        
        if (!name || !email || !phone || !subject || !message) {
            showNotification('Por favor, preencha todos os campos!', 'error');
            return;
        }
        
        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showNotification('Por favor, insira um e-mail válido!', 'error');
            return;
        }
        
        // Simular envio (aqui você integraria com backend)
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
        submitBtn.disabled = true;
        
        setTimeout(() => {
            showNotification('Mensagem enviada com sucesso! Entraremos em contato em breve.', 'success');
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
            contactForm.reset();
        }, 2000);
    });
}

// Função para mostrar notificações
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    const bgColor = type === 'success' 
        ? 'linear-gradient(135deg, #4caf50, #45a049)' 
        : 'linear-gradient(135deg, #f44336, #e53935)';
    const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${bgColor};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        font-weight: 600;
        max-width: 350px;
    `;
    notification.innerHTML = `<i class="fas ${icon}"></i> ${message}`;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 4000);
}

// ===== NEWSLETTER =====
const newsletterForms = document.querySelectorAll('.newsletter-form');

newsletterForms.forEach(form => {
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const emailInput = this.querySelector('input[type="email"]');
        const email = emailInput.value.trim();
        
        if (!email) {
            showNotification('Por favor, insira seu e-mail!', 'error');
            return;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showNotification('Por favor, insira um e-mail válido!', 'error');
            return;
        }
        
        showNotification('Inscrito com sucesso! Você receberá nossas promoções.', 'success');
        emailInput.value = '';
    });
});

// ===== SCROLL TO TOP =====
const scrollTopBtn = document.getElementById('scrollTop');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 500) {
        scrollTopBtn.classList.add('visible');
    } else {
        scrollTopBtn.classList.remove('visible');
    }
});

scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// ===== ANIMAÇÕES ON SCROLL =====
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observar elementos que devem animar
const animateElements = document.querySelectorAll('.feature-card, .menu-item, .about-feature-item, .contact-item');

animateElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    observer.observe(el);
});

// ===== MÁSCARAS DE ENTRADA =====
const phoneInputs = document.querySelectorAll('input[type="tel"]');

phoneInputs.forEach(input => {
    input.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        
        if (value.length > 11) {
            value = value.slice(0, 11);
        }
        
        if (value.length > 6) {
            value = value.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
        } else if (value.length > 2) {
            value = value.replace(/(\d{2})(\d{0,5})/, '($1) $2');
        } else if (value.length > 0) {
            value = value.replace(/(\d*)/, '($1');
        }
        
        e.target.value = value;
    });
});

// ===== LAZY LOADING DE IMAGENS =====
if ('loading' in HTMLImageElement.prototype) {
    const images = document.querySelectorAll('img[loading="lazy"]');
    images.forEach(img => {
        img.src = img.dataset.src;
    });
} else {
    // Fallback para navegadores que não suportam lazy loading
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js';
    document.body.appendChild(script);
}

// ===== CONTADOR DE ESTATÍSTICAS =====
function animateCounter(element, target, duration = 2000) {
    let current = 0;
    const increment = target / (duration / 16);
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target.toLocaleString('pt-BR');
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current).toLocaleString('pt-BR');
        }
    }, 16);
}

// Animar contadores quando visíveis
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
            const target = entry.target;
            const value = target.textContent;
            
            // Se for o rating (tem ID google-rating), não anima
            if (target.id === 'google-rating') {
                target.classList.add('counted');
                return;
            }
            
            // Extrair número do texto
            const number = parseInt(value.replace(/\D/g, ''));
            
            if (number) {
                target.textContent = '0';
                animateCounter(target, number);
                target.classList.add('counted');
            }
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-item strong').forEach(stat => {
    statsObserver.observe(stat);
});

// ===== PROTEÇÃO CONTRA SPAM NO FORMULÁRIO =====
let formSubmitCount = 0;
const maxSubmits = 3;
const timeWindow = 60000; // 1 minuto

if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        formSubmitCount++;
        
        if (formSubmitCount > maxSubmits) {
            e.preventDefault();
            showNotification('Muitas tentativas. Por favor, aguarde um momento.', 'error');
            return false;
        }
        
        setTimeout(() => {
            formSubmitCount = Math.max(0, formSubmitCount - 1);
        }, timeWindow);
    });
}

// ===== DETECÇÃO DE DISPOSITIVO =====
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

if (isMobile) {
    // Otimizações para mobile
    document.body.classList.add('is-mobile');
}

// ===== PERFORMANCE: DEBOUNCE SCROLL =====
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Aplicar debounce no scroll
const debouncedScroll = debounce(() => {
    // Lógica de scroll otimizada
}, 100);

window.addEventListener('scroll', debouncedScroll);

// ===== LOG DE INICIALIZAÇÃO =====
console.log('%c🍔 Futburguer Website Carregado! ⚽', 'color: #1a5f3e; font-size: 20px; font-weight: bold;');
console.log('%cMarque um golaço na sua fome!', 'color: #ff6b35; font-size: 14px;');

// ===== TRATAMENTO DE ERROS GLOBAL =====
window.addEventListener('error', (e) => {
    console.error('Erro capturado:', e.error);
    // Aqui você pode enviar o erro para um serviço de monitoramento
});

// ===== PWA: SERVICE WORKER (OPCIONAL) =====
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Descomente quando tiver um service worker configurado
        // navigator.serviceWorker.register('/sw.js')
        //     .then(reg => console.log('Service Worker registrado'))
        //     .catch(err => console.log('Erro no Service Worker:', err));
    });
}

// ===== ANALYTICS (PLACEHOLDER) =====
function trackEvent(category, action, label) {
    // Integrar com Google Analytics ou outro serviço
    console.log('Event tracked:', { category, action, label });
    
    // Exemplo: gtag('event', action, { event_category: category, event_label: label });
}

// Rastrear cliques nos botões de pedido
document.querySelectorAll('.btn-primary, .btn-whatsapp').forEach(btn => {
    btn.addEventListener('click', () => {
        trackEvent('CTA', 'Click', btn.textContent.trim());
    });
});

// ===== ACESSIBILIDADE: FOCO VISÍVEL =====
document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
    }
});

document.addEventListener('mousedown', () => {
    document.body.classList.remove('keyboard-navigation');
});

// Adicionar estilos de foco para navegação por teclado
const focusStyle = document.createElement('style');
focusStyle.textContent = `
    .keyboard-navigation *:focus {
        outline: 3px solid #ff6b35 !important;
        outline-offset: 2px !important;
    }
`;
document.head.appendChild(focusStyle);
