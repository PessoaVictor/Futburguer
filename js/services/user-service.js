import { auth, db } from './firebase-config.js';
import { getCurrentUser } from './auth-service.js';

export async function getUserData(userId = null) {
    try {
        const uid = userId || getCurrentUser()?.uid;
        if (!uid) {
            return { success: false, error: 'Usuário não está logado' };
        }
        
        const userDoc = await db.collection('users').doc(uid).get();
        
        if (!userDoc.exists) {
            return { success: false, error: 'Usuário não encontrado' };
        }
        
        return { 
            success: true, 
            data: userDoc.data() 
        };
        
    } catch (error) {
        console.error('❌ Erro ao buscar dados do usuário:', error);
        return { 
            success: false, 
            error: 'Erro ao carregar dados do usuário' 
        };
    }
}

export async function updateUserData(updates) {
    try {
        const user = getCurrentUser();
        if (!user) {
            return { success: false, error: 'Usuário não está logado' };
        }
        
        const userRef = db.collection('users').doc(user.uid);
        await userRef.update({
            ...updates,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        console.log('✅ Dados do usuário atualizados');
        return { success: true };
        
    } catch (error) {
        console.error('Erro ao atualizar dados:', error);
        return { 
            success: false, 
            error: 'Erro ao atualizar dados' 
        };
    }
}

export async function addAddress(address) {
    try {
        const user = getCurrentUser();
        if (!user) {
            return { success: false, error: 'Usuário não está logado' };
        }
        
        const addressWithId = {
            id: Date.now().toString(),
            ...address,
            createdAt: new Date().toISOString()
        };
        
        const userRef = db.collection('users').doc(user.uid);
        await userRef.update({
            addresses: firebase.firestore.FieldValue.arrayUnion(addressWithId)
        });
        
        console.log('✅ Endereço adicionado');
        return { success: true, data: addressWithId };
        
    } catch (error) {
        console.error('Erro ao adicionar endereço:', error);
        return { 
            success: false, 
            error: 'Erro ao adicionar endereço' 
        };
    }
}

export async function updateAddress(addressId, updates) {
    try {
        const user = getCurrentUser();
        if (!user) {
            return { success: false, error: 'Usuário não está logado' };
        }
        
        const userData = await getUserData();
        if (!userData.success) {
            return userData;
        }
        
        const addresses = userData.data.addresses || [];
        const updatedAddresses = addresses.map(addr => {
            if (addr.id === addressId) {
                return { ...addr, ...updates };
            }
            return addr;
        });
        
        const userRef = db.collection('users').doc(user.uid);
        await userRef.update({ addresses: updatedAddresses });
        
        console.log('✅ Endereço atualizado');
        return { success: true };
        
    } catch (error) {
        console.error('Erro ao atualizar endereço:', error);
        return { 
            success: false, 
            error: 'Erro ao atualizar endereço' 
        };
    }
}

export async function removeAddress(addressId) {
    try {
        const user = getCurrentUser();
        if (!user) {
            return { success: false, error: 'Usuário não está logado' };
        }
        
        const userData = await getUserData();
        if (!userData.success) {
            return userData;
        }
        
        const addresses = userData.data.addresses || [];
        const updatedAddresses = addresses.filter(addr => addr.id !== addressId);
        
        const userRef = db.collection('users').doc(user.uid);
        await userRef.update({ addresses: updatedAddresses });
        
        console.log('✅ Endereço removido');
        return { success: true };
        
    } catch (error) {
        console.error('Erro ao remover endereço:', error);
        return { 
            success: false, 
            error: 'Erro ao remover endereço' 
        };
    }
}

export async function setDefaultAddress(addressId) {
    try {
        const user = getCurrentUser();
        if (!user) {
            return { success: false, error: 'Usuário não está logado' };
        }
        
        const userData = await getUserData();
        if (!userData.success) {
            return userData;
        }
        
        const addresses = userData.data.addresses || [];
        const updatedAddresses = addresses.map(addr => ({
            ...addr,
            isDefault: addr.id === addressId
        }));
        
        const userRef = db.collection('users').doc(user.uid);
        await userRef.update({ addresses: updatedAddresses });
        
        console.log('✅ Endereço padrão definido');
        return { success: true };
        
    } catch (error) {
        console.error('Erro ao definir endereço padrão:', error);
        return { 
            success: false, 
            error: 'Erro ao definir endereço padrão' 
        };
    }
}

export async function getUserAddresses() {
    try {
        const userData = await getUserData();
        if (!userData.success) {
            return { success: false, error: userData.error };
        }
        
        return { 
            success: true, 
            data: userData.data.addresses || [] 
        };
        
    } catch (error) {
        console.error('Erro ao buscar endereços:', error);
        return { 
            success: false, 
            error: 'Erro ao buscar endereços' 
        };
    }
}

export async function getDefaultAddress() {
    try {
        const addressesResult = await getUserAddresses();
        if (!addressesResult.success) {
            return addressesResult;
        }
        
        const defaultAddress = addressesResult.data.find(addr => addr.isDefault);
        
        return { 
            success: true, 
            data: defaultAddress || null 
        };
        
    } catch (error) {
        console.error('Erro ao buscar endereço padrão:', error);
        return { 
            success: false, 
            error: 'Erro ao buscar endereço padrão' 
        };
    }
}

export async function incrementOrderCount() {
    try {
        const user = getCurrentUser();
        if (!user) {
            return { success: false, error: 'Usuário não está logado' };
        }
        
        const userRef = db.collection('users').doc(user.uid);
        await userRef.update({
            totalOrders: firebase.firestore.FieldValue.increment(1),
            lastOrderDate: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        console.log('✅ Contador de pedidos incrementado');
        return { success: true };
        
    } catch (error) {
        console.error('Erro ao incrementar contador:', error);
        return { 
            success: false, 
            error: 'Erro ao atualizar contador' 
        };
    }
}

export async function checkInactiveUser() {
    try {
        const userData = await getUserData();
        if (!userData.success || !userData.data.lastOrderDate) {
            return { success: true, isInactive: false };
        }
        
        const lastOrder = userData.data.lastOrderDate.toDate();
        const now = new Date();
        const daysSinceLastOrder = (now - lastOrder) / (1000 * 60 * 60 * 24);
        
        const isInactive = daysSinceLastOrder > 30;
        
        return { 
            success: true, 
            isInactive,
            daysSinceLastOrder: Math.floor(daysSinceLastOrder)
        };
        
    } catch (error) {
        console.error('Erro ao verificar inatividade:', error);
        return { 
            success: false, 
            error: 'Erro ao verificar inatividade' 
        };
    }
}

export async function getUserStats() {
    try {
        const userData = await getUserData();
        if (!userData.success) {
            return userData;
        }
        
        const user = getCurrentUser();
        const ordersSnapshot = await db.collection('orders')
            .where('userId', '==', user.uid)
            .orderBy('createdAt', 'desc')
            .get();
        
        const orders = ordersSnapshot.docs.map(doc => doc.data());
        
        const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
        const avgOrderValue = orders.length > 0 ? totalSpent / orders.length : 0;
        const completedOrders = orders.filter(o => o.status === 'completed').length;
        
        return {
            success: true,
            data: {
                totalOrders: userData.data.totalOrders || 0,
                totalSpent,
                avgOrderValue,
                completedOrders,
                loyaltyPoints: userData.data.loyaltyPoints || 0,
                lastOrderDate: userData.data.lastOrderDate
            }
        };
        
    } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        return { 
            success: false, 
            error: 'Erro ao buscar estatísticas' 
        };
    }
}

export async function getUserOrders(limit = 10) {
    try {
        const user = getCurrentUser();
        if (!user) {
            return { success: false, error: 'Usuário não está logado' };
        }
        
        const ordersSnapshot = await db.collection('orders')
            .where('userId', '==', user.uid)
            .orderBy('createdAt', 'desc')
            .limit(limit)
            .get();
        
        const orders = ordersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        return { success: true, data: orders };
        
    } catch (error) {
        console.error('Erro ao buscar pedidos:', error);
        return { 
            success: false, 
            error: 'Erro ao buscar pedidos' 
        };
    }
}

export function watchUserData(callback) {
    const user = getCurrentUser();
    if (!user) {
        console.warn('⚠️ Usuário não está logado para observar dados');
        return null;
    }
    
    return db.collection('users').doc(user.uid)
        .onSnapshot((doc) => {
            if (doc.exists) {
                callback({ success: true, data: doc.data() });
            } else {
                callback({ success: false, error: 'Usuário não encontrado' });
            }
        }, (error) => {
            console.error('Erro ao observar dados:', error);
            callback({ success: false, error: 'Erro ao observar dados' });
        });
}
