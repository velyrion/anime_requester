// wait html load
document.addEventListener('DOMContentLoaded', () => {
  const ratingValue = document.getElementById('rating-input');
  const idValue = document.getElementById('id-input');
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
    id: '', // will be set from input
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
    filterState.id = idValue.value.trim();

    let requestUrl;
    let apiGenres = filterState.genres;

    if (filterState.rating !== '' && !isNaN(Number(filterState.rating))) {
      // if filter by rating
      const rankingNum = Number(filterState.rating);
      const size = 1;
      const page = rankingNum;
      requestUrl = `https://anime-db.p.rapidapi.com/anime?page=${page}&size=${size}&sortBy=ranking&sortOrder=asc`;
    } else if (filterState.id !== '' && !isNaN(Number(filterState.id))) {
        // if filter by id
        requestUrl = `https://anime-db.p.rapidapi.com/anime/by-id/${filterState.id}`;
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
      toggleStatus();
      addCards(animes);
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
  filterState.id = '';
  if (ratingValue) ratingValue.value = '';
  if (idValue) idValue.value = '';
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
      idValue.value = '';
      filterState.id = '';

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
