/* GET THE API KEY */
const apiKeyInputs = document.querySelectorAll('input[name="api-key"]');

/*API VARIABLES*/
const url = 'https://anime-db.p.rapidapi.com/anime?page=1';
const options = {
	method: 'GET',
	headers: {
		'x-rapidapi-key': apiKeyInputs[0].value,
		'x-rapidapi-host': 'anime-db.p.rapidapi.com'
	}
};

// change input apiKey -> change real apiKey
apiKeyInputs.forEach(input => {
    input.addEventListener('change', () => {
        apiKey = input.value;
        options.method = 'GET';
        options.headers['x-rapidapi-key'] = apiKey;
    });
});
/*END OF GET THE API KEY*/

/*HTML VARIABLES*/
const cards = document.getElementById("cards");
/*END OF HTML VARIABLES*/

/*FONCTIONS*/

function getUrl(search='', size='10', genres='', sortBy='', sortOrder='') {
    if (search != '') search = '&search='+search;
    if (size != '') size = '&size='+size;
    if (genres != '') {
        // replace coma with %2C
        genres = '&genres='+genres.split(',').join('%2C');
    }
    if (sortBy != '') sortBy = '&sortBy='+sortBy;
    if (sortOrder != '') sortOrder = '&sortOrder='+sortOrder;
    return url+size+search+genres+sortBy+sortOrder;
}

async function getAnime(url) {
    try {
        const response = await fetch(url, options);
        const result = await response.json();
        return result.data;
    } catch (error) {
        console.error(error);
    }
}

function addCards(animes) {
    animes.forEach(anime => {
        let genres = anime.genres.join(" / ");

        cards.innerHTML += `
        <div class="card">
        <h3>${anime.title}</h3>
        <img src="${anime.image}" alt="${anime.title}" />
        
        <div class="overlay">
            <p><span class="tagCard">Descriptif: </span>${anime.synopsis}</p>
            <p><span class="tagCard">Genres: </span>${genres}</p>
            <p><span class="tagCard">Classement: </span>${anime.ranking}</p>
            <p><span class="tagCard">Nombre d'épisodes: </span>${anime.episodes}</p>
        </div>
        </div>
        `;
    });
}

/*END OF FONCTIONS*/

/*getAnime(getUrl()).then(animes => {
  addCards(animes);
});*/
