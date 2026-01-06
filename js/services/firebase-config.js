const firebaseConfig = {
    apiKey: "SUA_API_KEY_AQUI",
    authDomain: "futburguer-app.firebaseapp.com",
    projectId: "futburguer-app",
    storageBucket: "futburguer-app.firebasestorage.app",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456"
};

let app;
let auth;
let db;

try {
    app = firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    db = firebase.firestore();
    
    console.log('Firebase inicializado com sucesso!');
} catch (error) {
    console.error('Erro ao inicializar Firebase:', error);
}

if (db) {
    db.enablePersistence()
        .catch((err) => {
            if (err.code === 'failed-precondition') {
                console.warn('⚠️ Múltiplas abas abertas, persistência desabilitada');
            } else if (err.code === 'unimplemented') {
                console.warn('⚠️ Navegador não suporta persistência');
            }
        });
}

auth.onAuthStateChanged((user) => {
    if (user) {
        console.log('👤 Usuário logado:', user.email);
        updateAuthUI(true, user);
    } else {
        console.log('👤 Nenhum usuário logado');
        updateAuthUI(false, null);
    }
});

function updateAuthUI(isLoggedIn, user) {
    const authButtons = document.querySelectorAll('.nav-auth');
    const userMenus = document.querySelectorAll('.user-menu');
    
    authButtons.forEach(btn => {
        if (isLoggedIn) {
            btn.style.display = 'none';
        } else {
            btn.style.display = 'flex';
        }
    });
    
    userMenus.forEach(menu => {
        if (isLoggedIn) {
            menu.style.display = 'flex';
            const userName = menu.querySelector('.user-name');
            if (userName && user) {
                userName.textContent = user.displayName || user.email.split('@')[0];
            }
        } else {
            menu.style.display = 'none';
        }
    });
}

export { app, auth, db, firebaseConfig };
