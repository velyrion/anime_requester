/* HTML Variables */
const slider = document.getElementById('rating-slider');
const ratingValue = document.getElementById('rating-value');

document.addEventListener('DOMContentLoaded', () => {
  const filterForm = document.getElementById('filter-form');
  const cardsContainer = document.getElementById('cards');
  const navSearchForm = document.querySelector('.nav-search');

  if (!filterForm || !cardsContainer) {
    console.warn('Filter form or cards container not found.');
    return;
  }

  if (typeof getUrl !== 'function' || typeof getAnime !== 'function' || typeof addCards !== 'function') {
    console.warn('API helper functions are not available.');
    return;
  }

  /* Status line element to show messages */
  const statusLine = document.createElement('p');
  statusLine.className = 'cards-status';
  statusLine.hidden = true;
  statusLine.textContent = 'Loading animes...';
  cardsContainer.parentElement.insertBefore(statusLine, cardsContainer);

  /* Map form genre values to API genre names */
  const apiGenreMap = {
    action: 'Action',
    comedy: 'Comedy',
    drama: 'Drama',
    fantasy: 'Fantasy',
    'sci-fi': 'Sci-Fi'
  };

  const toApiGenre = genreValue => {
    if (!genreValue) return '';
    const trimmed = genreValue.trim().toLowerCase();
    return apiGenreMap[trimmed] || trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  };

  /* Current filter state */
  const filterState = {
    searchTerm: '',
    genres: [],
    ratingMin: Number(slider.value),
    size: 40,
    sortBy: 'ranking',
    sortOrder: 'asc'
  };

  /* Update rating slider label */
  slider.addEventListener('input', () => {
    ratingValue.textContent = `≥ ${slider.value}`;
    filterState.ratingMin = Number(slider.value);
  });

  /* Helper to show/hide status messages */
  const toggleStatus = message => {
    statusLine.textContent = message || '';
    statusLine.hidden = !message;
  };

  /* Refresh anime list based on current filters */
  const refreshList = async () => {
    const apiGenres = filterState.genres.map(toApiGenre).filter(Boolean);
    const requestUrl = getUrl(
      filterState.searchTerm,
      String(filterState.size),
      apiGenres.join(','),
      filterState.sortBy,
      filterState.sortOrder
    );

    toggleStatus('Loading animes...');
    cardsContainer.innerHTML = '';

    try {
      const animes = await getAnime(requestUrl) || [];
      const selectedGenresLower = apiGenres.map(g => g.toLowerCase());

      /* Filter animes by slider rating and selected genres */
      const filtered = animes.filter(anime => {
        const ranking = Number(anime.ranking);
        const matchesRating = !isNaN(ranking) && ranking >= filterState.ratingMin;
        const matchesGenres = !selectedGenresLower.length || selectedGenresLower.every(
          genre => anime.genres.some(g => g.toLowerCase() === genre)
        );
        return matchesRating && matchesGenres;
      });

      if (!filtered.length) {
        toggleStatus('No animes match the selected filters.');
        return;
      }

      toggleStatus();
      addCards(filtered);
    } catch (err) {
      console.error('Error fetching animes:', err);
      toggleStatus('Unable to fetch animes at the moment.');
    }
  };

  /* Handle filter form submission */
  filterForm.addEventListener('submit', e => {
    e.preventDefault();
    const formData = new FormData(filterForm);
    filterState.genres = formData.getAll('genre');
    refreshList();
  });

  /* Handle navbar search submission */
  if (navSearchForm) {
    const searchInput = navSearchForm.querySelector('input[type="search"]');
    navSearchForm.addEventListener('submit', e => {
      e.preventDefault();
      filterState.searchTerm = searchInput ? searchInput.value.trim() : '';
      refreshList();
    });
  }

  /* Initial load */
  refreshList();
});

const resetButton = document.getElementById('reset-filters');

resetButton.addEventListener('click', () => {
  // Reset genres checkboxes
  const genreCheckboxes = filterForm.querySelectorAll('input[name="genre"]');
  genreCheckboxes.forEach(cb => cb.checked = false);
  filterState.genres = [];

  // Reset rating slider
  slider.value = 7; // ou la valeur par défaut que tu veux
  ratingValue.textContent = `≥ ${slider.value}`;
  filterState.ratingMin = Number(slider.value);

  // Reset search term
  if (navSearchForm) {
    const searchInput = navSearchForm.querySelector('input[type="search"]');
    if (searchInput) searchInput.value = '';
    filterState.searchTerm = '';
  }

  // Refresh the list
  refreshList();
});
