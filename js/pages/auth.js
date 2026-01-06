import { loginUser, registerUser, resetPassword, loginWithGoogle } from '../services/auth-service.js';

document.querySelectorAll('.toggle-password').forEach(button => {
    button.addEventListener('click', function() {
        const input = this.parentElement.querySelector('input');
        const icon = this.querySelector('i');
        
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    });
});

const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Entrando...';
        
        const formData = {
            email: document.getElementById('email').value,
            password: document.getElementById('password').value,
            remember: document.getElementById('remember')?.checked || false
        };
        
        const result = await loginUser(formData.email, formData.password, formData.remember);
        
        if (result.success) {
            showMessage('Login realizado com sucesso!', 'success');
            setTimeout(() => {
                window.location.href = 'menu.html';
            }, 1000);
        } else {
            showMessage(result.error, 'error');
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    });
    
    const googleBtn = document.querySelector('.btn-google');
    if (googleBtn) {
        googleBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            
            const originalText = this.innerHTML;
            this.disabled = true;
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Conectando...';
            
            const result = await loginWithGoogle();
            
            if (result.success) {
                showMessage('Login com Google realizado!', 'success');
                setTimeout(() => {
                    window.location.href = 'menu.html';
                }, 1000);
            } else {
                showMessage(result.error, 'error');
                this.disabled = false;
                this.innerHTML = originalText;
            }
        });
    }
}

const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (password !== confirmPassword) {
            showMessage('As senhas não coincidem!', 'error');
            return;
        }
        
        if (password.length < 6) {
            showMessage('A senha deve ter no mínimo 6 caracteres!', 'error');
            return;
        }
        
        const userData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            terms: document.getElementById('terms').checked
        };
        
        if (!userData.terms) {
            showMessage('Você precisa aceitar os Termos de Uso!', 'error');
            return;
        }
        
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Criando conta...';
        
        const result = await registerUser(userData.email, password, userData);
        
        if (result.success) {
            showMessage('Conta criada com sucesso!', 'success');
            setTimeout(() => {
                window.location.href = 'menu.html';
            }, 1500);
        } else {
            showMessage(result.error, 'error');
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    });
    
    const googleBtn = document.querySelector('.btn-google');
    if (googleBtn) {
        googleBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            
            const originalText = this.innerHTML;
            this.disabled = true;
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Conectando...';
            
            const result = await loginWithGoogle();
            
            if (result.success) {
                showMessage('Conta criada com Google!', 'success');
                setTimeout(() => {
                    window.location.href = 'menu.html';
                }, 1000);
            } else {
                showMessage(result.error, 'error');
                this.disabled = false;
                this.innerHTML = originalText;
            }
        });
    }
}

const recoverForm = document.getElementById('recoverForm');
if (recoverForm) {
    recoverForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        const email = document.getElementById('email').value;
        
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
        
        const result = await resetPassword(email);
        
        if (result.success) {
            showMessage('Email enviado! Verifique sua caixa de entrada.', 'success');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 3000);
        } else {
            showMessage(result.error, 'error');
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    });
}

const phoneInput = document.getElementById('phone');
if (phoneInput) {
    phoneInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        
        if (value.length <= 11) {
            value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
            value = value.replace(/(\d)(\d{4})$/, '$1-$2');
        }
        
        e.target.value = value;
    });
}

function showMessage(message, type = 'info') {
    const oldMessage = document.querySelector('.auth-message');
    if (oldMessage) {
        oldMessage.remove();
    }
    
    const messageEl = document.createElement('div');
    messageEl.className = `auth-message ${type}`;
    messageEl.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    const authForm = document.querySelector('.auth-form');
    if (authForm) {
        authForm.insertBefore(messageEl, authForm.firstChild);
        
        setTimeout(() => {
            messageEl.remove();
        }, 5000);
    } else {
        alert(message);
    }
}

