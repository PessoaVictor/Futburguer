import { initNavigation } from './components/navigation.js';
import { initMenuFilters } from './components/menu-filters.js';
import { initCart } from './components/cart.js';
import { initForms } from './components/forms.js';
import { initGallery } from './components/gallery.js';
import { initScrollAnimations, initScrollToTop } from './components/animations.js';
import { updateGoogleReviews } from './utils/google-reviews.js';
import { loadAllComponents } from './utils/component-loader.js';

async function init() {
    await loadAllComponents();
    
    initNavigation();
    initMenuFilters();
    initCart();
    initForms();
    initGallery();
    initScrollAnimations();
    initScrollToTop();
}

document.addEventListener('DOMContentLoaded', init);
