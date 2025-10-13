// wait html load
document.addEventListener('DOMContentLoaded', () => {
  const ratingValue = document.getElementById('rating-input');
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

  /* Current filter state */
  const filterState = {
    searchTerm: '',
    genres: [],
    rating: '', // Will be set from input
    size: 9,
    sortBy: 'ranking',
    sortOrder: 'asc'
  };

  /* Helper to show/hide status messages */
  const toggleStatus = message => {
    statusLine.textContent = message || '';
    statusLine.hidden = !message;
  };

  /* Refresh anime list based on current filters */
  const refreshList = async () => {
    filterState.rating = ratingValue.value.trim();

    let requestUrl;
    let apiGenres = filterState.genres;

    // Si un classement précis est demandé
    if (filterState.rating !== '' && !isNaN(Number(filterState.rating))) {
      const rankingNum = Number(filterState.rating);
      const size = 1;
      const page = rankingNum;
      requestUrl = `https://anime-db.p.rapidapi.com/anime?page=${page}&size=${size}&sortBy=ranking&sortOrder=asc`;
      // add genres
      if (apiGenres.length) {
        requestUrl += `&genres=${apiGenres.join('%2C')}`;
      }
    } else {
      // getUrl 
      requestUrl = getUrl(
        filterState.searchTerm,
        String(filterState.size),
        apiGenres.join(','),
        filterState.sortBy,
        filterState.sortOrder
      );
    }

    toggleStatus('Loading animes...');
    cardsContainer.innerHTML = '';

    try {
      const animes = await getAnime(requestUrl) || [];
      let filtered = animes;

      // Si on a demandé un classement précis, on vérifie que l'anime existe
      if (filterState.rating !== '' && !isNaN(Number(filterState.rating))) {
        filtered = animes.filter(anime => Number(anime.ranking) === Number(filterState.rating));
      } else {
        // Sinon, on filtre par genres comme avant
        const selectedGenresLower = apiGenres.map(g => g.toLowerCase());
        filtered = animes.filter(anime => {
          const ranking = Number(anime.ranking);
          const matchesRating = filterState.rating === '' || (!isNaN(ranking) && ranking == filterState.rating);
          const matchesGenres = !selectedGenresLower.length || selectedGenresLower.every(
            genre => anime.genres.some(g => g.toLowerCase() === genre)
          );
          return matchesRating && matchesGenres;
        });
      }

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

  // Reset all filters on page load
  filterState.searchTerm = '';
  filterState.genres = [];
  filterState.rating = '';
  if (ratingValue) ratingValue.value = '';
  if (filterForm) {
    const genreCheckboxes = filterForm.querySelectorAll('input[name="genre"]');
    genreCheckboxes.forEach(cb => cb.checked = false);
  }
  if (navSearchForm) {
    const searchInput = navSearchForm.querySelector('input[type="search"]');
    if (searchInput) searchInput.value = '';
  }

  /* Initial load */
  refreshList();

  const resetButton = document.getElementById('reset-filters');
  if (resetButton) {
    resetButton.addEventListener('click', () => {
      // Reset genres checkboxes
      const genreCheckboxes = filterForm.querySelectorAll('input[name="genre"]');
      genreCheckboxes.forEach(cb => cb.checked = false);
      filterState.genres = [];

      // Reset rating input
      ratingValue.value = '';
      filterState.rating = '';

      // Reset search term
      if (navSearchForm) {
        const searchInput = navSearchForm.querySelector('input[type="search"]');
        if (searchInput) searchInput.value = '';
        filterState.searchTerm = '';
      }

      // Refresh the list
      refreshList();
    });
  }
});
