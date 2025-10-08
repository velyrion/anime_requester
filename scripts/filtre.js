// Sélection des éléments
const sidebar = document.querySelector('.sidebar');
const toggleButton = document.getElementById('toggle-sidebar');

// Écouteur d'événement pour le bouton
toggleButton.addEventListener('click', () => {
    sidebar.classList.toggle('closed');
});