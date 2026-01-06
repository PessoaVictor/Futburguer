export async function updateGoogleReviews() {
    const GOOGLE_API_KEY = 'SUA_CHAVE_API_AQUI';
    const PLACE_ID = 'ChIJJVKPuGLVswsR95lZ-pBuwfU';
    
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
            const ratingElement = document.getElementById('google-rating');
            if (ratingElement && data.result.rating) {
                ratingElement.textContent = data.result.rating.toFixed(1);
            }
            
            const reviewsElement = document.getElementById('google-reviews');
            if (reviewsElement && data.result.user_ratings_total) {
                reviewsElement.textContent = data.result.user_ratings_total.toLocaleString('pt-BR');
            }
        }
    } catch (error) {
        console.error('Erro ao buscar dados do Google:', error);
    }
}
