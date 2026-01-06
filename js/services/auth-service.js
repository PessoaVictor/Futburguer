import { auth, db } from './firebase-config.js';

export async function registerUser(email, password, userData) {
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        await user.updateProfile({
            displayName: userData.name
        });
        
        await db.collection('users').doc(user.uid).set({
            uid: user.uid,
            name: userData.name,
            email: email,
            phone: userData.phone,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            loyaltyPoints: 0,
            totalOrders: 0,
            lastOrderDate: null,
            addresses: []
        });
        
        await db.collection('loyalty_cards').doc(user.uid).set({
            userId: user.uid,
            points: 0,
            level: 'bronze',
            stampsCollected: 0,
            nextRewardAt: 10,
            history: []
        });
        
        console.log('✅ Usuário registrado:', user.uid);
        return { success: true, user };
        
    } catch (error) {
        console.error('Erro ao registrar:', error);
        return { 
            success: false, 
            error: getErrorMessage(error.code) 
        };
    }
}

export async function loginUser(email, password, remember = false) {
    try {
        const persistence = remember 
            ? firebase.auth.Auth.Persistence.LOCAL
            : firebase.auth.Auth.Persistence.SESSION;
        
        await auth.setPersistence(persistence);
        
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        console.log('✅ Login realizado:', user.email);
        return { success: true, user };
        
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        return { 
            success: false, 
            error: getErrorMessage(error.code) 
        };
    }
}

export async function loginWithGoogle() {
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.addScope('email');
        provider.addScope('profile');
        
        const result = await auth.signInWithPopup(provider);
        const user = result.user;
        
        const userDoc = await db.collection('users').doc(user.uid).get();
        
        if (!userDoc.exists) {
            await db.collection('users').doc(user.uid).set({
                uid: user.uid,
                name: user.displayName,
                email: user.email,
                phone: '',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                loyaltyPoints: 0,
                totalOrders: 0,
                lastOrderDate: null,
                addresses: []
            });
            
            await db.collection('loyalty_cards').doc(user.uid).set({
                userId: user.uid,
                points: 0,
                level: 'bronze',
                stampsCollected: 0,
                nextRewardAt: 10,
                history: []
            });
        }
        
        console.log('✅ Login com Google realizado:', user.email);
        return { success: true, user };
        
    } catch (error) {
        console.error('Erro ao fazer login com Google:', error);
        return { 
            success: false, 
            error: getErrorMessage(error.code) 
        };
    }
}

export async function logoutUser() {
    try {
        await auth.signOut();
        console.log('✅ Logout realizado');
        return { success: true };
    } catch (error) {
        console.error('Erro ao fazer logout:', error);
        return { 
            success: false, 
            error: 'Erro ao fazer logout. Tente novamente.' 
        };
    }
}

export async function resetPassword(email) {
    try {
        await auth.sendPasswordResetEmail(email);
        console.log('✅ Email de recuperação enviado para:', email);
        return { 
            success: true, 
            message: 'Email de recuperação enviado! Verifique sua caixa de entrada.' 
        };
    } catch (error) {
        console.error('Erro ao enviar email de recuperação:', error);
        return { 
            success: false, 
            error: getErrorMessage(error.code) 
        };
    }
}

export function getCurrentUser() {
    return auth.currentUser;
}

export function isLoggedIn() {
    return auth.currentUser !== null;
}

export function onAuthChange(callback) {
    return auth.onAuthStateChanged(callback);
}

export async function updateUserProfile(updates) {
    try {
        const user = auth.currentUser;
        if (!user) {
            return { success: false, error: 'Usuário não está logado' };
        }
        
        if (updates.displayName || updates.photoURL) {
            await user.updateProfile({
                displayName: updates.displayName,
                photoURL: updates.photoURL
            });
        }
        
        const userRef = db.collection('users').doc(user.uid);
        await userRef.update(updates);
        
        console.log('✅ Perfil atualizado');
        return { success: true };
        
    } catch (error) {
        console.error('❌ Erro ao atualizar perfil:', error);
        return { 
            success: false, 
            error: 'Erro ao atualizar perfil. Tente novamente.' 
        };
    }
}

export async function updateUserEmail(newEmail) {
    try {
        const user = auth.currentUser;
        if (!user) {
            return { success: false, error: 'Usuário não está logado' };
        }
        
        await user.updateEmail(newEmail);
        
        await db.collection('users').doc(user.uid).update({
            email: newEmail
        });
        
        console.log('Email atualizado para:', newEmail);
        return { success: true };
        
    } catch (error) {
        console.error('Erro ao atualizar email:', error);
        return { 
            success: false, 
            error: getErrorMessage(error.code) 
        };
    }
}

export async function updateUserPassword(newPassword) {
    try {
        const user = auth.currentUser;
        if (!user) {
            return { success: false, error: 'Usuário não está logado' };
        }
        
        await user.updatePassword(newPassword);
        
        console.log('✅ Senha atualizada');
        return { success: true };
        
    } catch (error) {
        console.error('Erro ao atualizar senha:', error);
        return { 
            success: false, 
            error: getErrorMessage(error.code) 
        };
    }
}

export async function reauthenticateUser(password) {
    try {
        const user = auth.currentUser;
        if (!user || !user.email) {
            return { success: false, error: 'Usuário não está logado' };
        }
        
        const credential = firebase.auth.EmailAuthProvider.credential(
            user.email,
            password
        );
        
        await user.reauthenticateWithCredential(credential);
        
        console.log('✅ Reautenticação realizada');
        return { success: true };
        
    } catch (error) {
        console.error('Erro ao reautenticar:', error);
        return { 
            success: false, 
            error: 'Senha incorreta.' 
        };
    }
}

function getErrorMessage(errorCode) {
    const errorMessages = {
        'auth/email-already-in-use': 'Este email já está cadastrado.',
        'auth/invalid-email': 'Email inválido.',
        'auth/operation-not-allowed': 'Operação não permitida.',
        'auth/weak-password': 'Senha muito fraca. Use no mínimo 6 caracteres.',
        'auth/user-disabled': 'Esta conta foi desativada.',
        'auth/user-not-found': 'Usuário não encontrado.',
        'auth/wrong-password': 'Senha incorreta.',
        'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde.',
        'auth/network-request-failed': 'Erro de conexão. Verifique sua internet.',
        'auth/popup-closed-by-user': 'Popup fechado. Tente novamente.',
        'auth/cancelled-popup-request': 'Operação cancelada.',
        'auth/requires-recent-login': 'Por segurança, faça login novamente.'
    };
    
    return errorMessages[errorCode] || 'Erro desconhecido. Tente novamente.';
}
