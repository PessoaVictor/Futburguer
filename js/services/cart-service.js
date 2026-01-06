import { getCurrentUser, isLoggedIn } from './auth-service.js';

const CART_STORAGE_KEY = 'futburguer_cart';

export function getCart() {
    try {
        const cartData = localStorage.getItem(CART_STORAGE_KEY);
        return cartData ? JSON.parse(cartData) : [];
    } catch (error) {
        console.error('Erro ao buscar carrinho:', error);
        return [];
    }
}

function saveCart(cart) {
    try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
        updateCartUI();
        return true;
    } catch (error) {
        console.error('Erro ao salvar carrinho:', error);
        return false;
    }
}

export function addToCart(product) {
    try {
        const cart = getCart();
        
        const existingItemIndex = cart.findIndex(item => item.id === product.id);
        
        if (existingItemIndex > -1) {
            cart[existingItemIndex].quantity += 1;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: 1,
                image: product.image || 'assets/images/default.png',
                category: product.category || 'outros'
            });
        }
        
        saveCart(cart);
        console.log('✅ Produto adicionado ao carrinho:', product.name);
        
        showCartNotification(`${product.name} adicionado ao carrinho!`);
        
        return { success: true, cart };
        
    } catch (error) {
        console.error('Erro ao adicionar ao carrinho:', error);
        return { success: false, error: 'Erro ao adicionar produto' };
    }
}

export function removeFromCart(productId) {
    try {
        let cart = getCart();
        const itemName = cart.find(item => item.id === productId)?.name;
        
        cart = cart.filter(item => item.id !== productId);
        saveCart(cart);
        
        console.log('✅ Produto removido do carrinho');
        showCartNotification(`${itemName} removido do carrinho`, 'warning');
        
        return { success: true, cart };
        
    } catch (error) {
        console.error('Erro ao remover do carrinho:', error);
        return { success: false, error: 'Erro ao remover produto' };
    }
}

export function updateQuantity(productId, quantity) {
    try {
        const cart = getCart();
        const itemIndex = cart.findIndex(item => item.id === productId);
        
        if (itemIndex === -1) {
            return { success: false, error: 'Produto não encontrado' };
        }
        
        if (quantity <= 0) {
            return removeFromCart(productId);
        }
        
        cart[itemIndex].quantity = quantity;
        saveCart(cart);
        
        console.log('✅ Quantidade atualizada');
        return { success: true, cart };
        
    } catch (error) {
        console.error('Erro ao atualizar quantidade:', error);
        return { success: false, error: 'Erro ao atualizar quantidade' };
    }
}

export function clearCart() {
    try {
        localStorage.removeItem(CART_STORAGE_KEY);
        updateCartUI();
        console.log('✅ Carrinho limpo');
        return { success: true };
    } catch (error) {
        console.error('Erro ao limpar carrinho:', error);
        return { success: false, error: 'Erro ao limpar carrinho' };
    }
}

export function getCartSubtotal() {
    const cart = getCart();
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

export function getCartItemCount() {
    const cart = getCart();
    return cart.reduce((count, item) => count + item.quantity, 0);
}

export function getCartTotal(deliveryFee = 0, discount = 0) {
    const subtotal = getCartSubtotal();
    return subtotal + deliveryFee - discount;
}

export function isCartEmpty() {
    return getCart().length === 0;
}

export function getCartSummary() {
    const cart = getCart();
    const subtotal = getCartSubtotal();
    const itemCount = getCartItemCount();
    
    return {
        items: cart,
        itemCount,
        subtotal,
        isEmpty: cart.length === 0
    };
}

function updateCartUI() {
    const itemCount = getCartItemCount();
    
    const cartCounts = document.querySelectorAll('#cartCount, .cart-count, .cart-badge');
    cartCounts.forEach(element => {
        element.textContent = itemCount;
        element.style.display = itemCount > 0 ? 'block' : 'none';
    });
    
    const floatingCart = document.querySelector('#floatingCart');
    if (floatingCart) {
        if (itemCount > 0) {
            floatingCart.classList.add('has-items');
        } else {
            floatingCart.classList.remove('has-items');
        }
    }
    
    window.dispatchEvent(new CustomEvent('cartUpdated', { 
        detail: { itemCount, cart: getCart() } 
    }));
}

function showCartNotification(message, type = 'success') {
    let notification = document.querySelector('.cart-notification');
    
    if (!notification) {
        notification = document.createElement('div');
        notification.className = 'cart-notification';
        document.body.appendChild(notification);
    }
    
    notification.textContent = message;
    notification.className = `cart-notification show ${type}`;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

export function formatCartForWhatsApp(customerData, deliveryFee = 5.00) {
    const cart = getCart();
    const subtotal = getCartSubtotal();
    const total = getCartTotal(deliveryFee);
    
    let message = '🍔 *NOVO PEDIDO - FUTBURGUER* ⚽\n\n';
    
    message += `*Cliente:* ${customerData.name}\n`;
    message += `*Telefone:* ${customerData.phone}\n`;
    if (customerData.email) {
        message += `*Email:* ${customerData.email}\n`;
    }
    message += '\n';
    
    if (customerData.address) {
        message += '*Endereço de Entrega:*\n';
        message += `${customerData.address.street}, ${customerData.address.number}\n`;
        if (customerData.address.complement) {
            message += `${customerData.address.complement}\n`;
        }
        message += `${customerData.address.neighborhood} - ${customerData.address.city}, ${customerData.address.state}\n`;
        if (customerData.address.zipCode) {
            message += `CEP: ${customerData.address.zipCode}\n`;
        }
        message += '\n';
    }
    
    message += '*Pedido:*\n';
    message += '━━━━━━━━━━━━━━━━━━━\n';
    cart.forEach(item => {
        const itemTotal = (item.price * item.quantity).toFixed(2);
        message += `${item.quantity}x ${item.name} - R$ ${itemTotal}\n`;
    });
    message += '━━━━━━━━━━━━━━━━━━━\n\n';
    
    message += `*Subtotal:* R$ ${subtotal.toFixed(2)}\n`;
    message += `*Taxa de entrega:* R$ ${deliveryFee.toFixed(2)}\n`;
    message += `*TOTAL:* R$ ${total.toFixed(2)}\n\n`;
    
    if (customerData.paymentMethod) {
        const paymentMethods = {
            'pix': 'PIX',
            'card': 'Cartão',
            'cash': 'Dinheiro'
        };
        message += `*Forma de pagamento:* ${paymentMethods[customerData.paymentMethod]}\n\n`;
    }
    
    const now = new Date();
    const dateStr = now.toLocaleDateString('pt-BR');
    const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    message += `✅ Pedido realizado em: ${dateStr} às ${timeStr}\n`;
    
    if (isLoggedIn()) {
        message += `\n[Cliente cadastrado - Ganhará pontos fidelidade]`;
    }
    
    return encodeURIComponent(message);
}

export function sendToWhatsApp(customerData, deliveryFee = 5.00) {
    try {
        if (isCartEmpty()) {
            showCartNotification('Carrinho está vazio!', 'error');
            return { success: false, error: 'Carrinho vazio' };
        }
        
        const message = formatCartForWhatsApp(customerData, deliveryFee);
        const whatsappNumber = '5581995343404';
        const whatsappURL = `https://wa.me/${whatsappNumber}?text=${message}`;
        
        window.open(whatsappURL, '_blank');
        
        console.log('✅ Pedido enviado para WhatsApp');
        return { success: true };
        
    } catch (error) {
        console.error('Erro ao enviar para WhatsApp:', error);
        return { success: false, error: 'Erro ao enviar pedido' };
    }
}

export function initCart() {
    updateCartUI();
    
    window.addEventListener('cartUpdated', (e) => {
        console.log('🔄 Carrinho atualizado:', e.detail);
    });
    
    console.log('✅ Carrinho inicializado');
}

if (typeof window !== 'undefined') {
    initCart();
}
