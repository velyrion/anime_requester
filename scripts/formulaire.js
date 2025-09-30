/* HTML VARIABLES */
const slider = document.getElementById('rating-slider');
const ratingValue = document.getElementById('rating-value');

slider.addEventListener('input', () => {
    ratingValue.textContent = `≥ ${slider.value}`;

document.addEventListener('DOMContentLoaded', () => {
  const filterForm = document.getElementById('filter-form');
  const cardsContainer = document.getElementById('cards');
  const navSearchForm = document.querySelector('.nav-search');

  if (!filterForm || !cardsContainer) {
    console.warn('[formulaire.js] Impossible de trouver le formulaire ou la zone des cartes.');
    return;
  }

  if (typeof getUrl !== 'function' || typeof getAnime !== 'function' || typeof addCards !== 'function') {
    console.warn('[formulaire.js] Les helpers API ne sont pas disponibles.');
    return;
  }

  const statusLine = document.createElement('p');
  statusLine.className = 'cards-status';
  statusLine.hidden = true;
  statusLine.textContent = 'Chargement des animes...';
  cardsContainer.parentElement.insertBefore(statusLine, cardsContainer);

  const apiGenreMap = {
    action: 'Action',
    comedy: 'Comedy',
    drama: 'Drama',
    fantasy: 'Fantasy',
    'sci-fi': 'Sci-Fi'
  };

  const toApiGenre = genreValue => {
    if (typeof genreValue !== 'string') {
      return '';
    }
    const trimmedValue = genreValue.trim().toLowerCase();
    return apiGenreMap[trimmedValue] || trimmedValue.charAt(0).toUpperCase() + trimmedValue.slice(1);
  };

  const filterState = {
    searchTerm: '',
    genres: [],
    ratingMin: null,
    size: 40,
    sortBy: 'ranking',
    sortOrder: 'asc'
  };

  const toggleStatus = (message = '') => {
    statusLine.textContent = message;
    statusLine.hidden = message === '';
  };

  const refreshList = async () => {
    const apiGenres = filterState.genres
      .map(toApiGenre)
      .filter(Boolean);

    const requestUrl = getUrl(
      filterState.searchTerm,
      String(filterState.size),
      apiGenres.join(','),
      filterState.sortBy,
      filterState.sortOrder
    );

    toggleStatus('Chargement des animes...');
    cardsContainer.innerHTML = '';

    try {
      const animes = await getAnime(requestUrl) || [];
      const normalizedSelectedGenres = apiGenres.map(genre => genre.toLowerCase());

      const filteredAnimes = animes.filter(anime => {
        const rankingValue = typeof anime.ranking === 'number' ? anime.ranking : Number(anime.ranking);
        const matchesRating = filterState.ratingMin === null || (Number.isFinite(rankingValue) && rankingValue >= filterState.ratingMin);

        const matchesGenres = !normalizedSelectedGenres.length || normalizedSelectedGenres.every(selectedGenre =>
          Array.isArray(anime.genres) && anime.genres.some(animeGenre => String(animeGenre).toLowerCase() === selectedGenre)
        );

        return matchesRating && matchesGenres;
      });

      if (!filteredAnimes.length) {
        toggleStatus('Aucun anime ne correspond aux filtres selectionnes.');
        return;
      }

      toggleStatus();
      addCards(filteredAnimes);
    } catch (error) {
      console.error('Erreur lors de la recuperation des animes', error);
      toggleStatus('Impossible de recuperer les animes pour le moment.');
    }
  };

  filterForm.addEventListener('submit', event => {
    event.preventDefault();
    const formData = new FormData(filterForm);

    filterState.genres = formData.getAll('genre');

    const ratingChoices = formData.getAll('rating')
      .map(value => Number(value))
      .filter(value => Number.isFinite(value));

    filterState.ratingMin = ratingChoices.length ? Math.max(...ratingChoices) : null;

    refreshList();
  });

  if (navSearchForm) {
    const searchInput = navSearchForm.querySelector('input[type="search"]');

    navSearchForm.addEventListener('submit', event => {
      event.preventDefault();
      filterState.searchTerm = searchInput ? searchInput.value.trim() : '';
      refreshList();
    });
  }

  refreshList();
});