/* HTML VARIABLES */
const slider = document.getElementById('rating-slider');
const ratingValue = document.getElementById('rating-value');

slider.addEventListener('input', () => {
    ratingValue.textContent = `≥ ${slider.value}`;
});