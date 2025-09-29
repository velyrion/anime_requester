/*API VARIABLES*/
const apiKey = 'a98487f17emshf797434733b889cp124f03jsn461d3ecc651c';
const url = 'https://anime-db.p.rapidapi.com/anime?page=1';
const options = {
	method: 'GET',
	headers: {
		'x-rapidapi-key': apiKey,
		'x-rapidapi-host': 'anime-db.p.rapidapi.com'
	}
};
/*END OF API VARIABLES*/

/*HTML VARIABLES*/
const cards = document.getElementById("cards");
/*END OF HTML VARIABLES*/

/*FONCTIONS*/
function getUrl(search='', size='10', genre='', sortBy='', sortOrder='') {
    if (search != '') search = '&search='+search;
    if (size != '') size = '&size='+size;
    if (genre != '') genre = '&genres='+genre;
    if (sortBy != '') sortBy = '&sortBy='+sortBy;
    if (sortOrder != '') sortOrder = '&sortOrder='+sortOrder;
    return url+size+search+genre+sortBy+sortOrder;
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
            <p><span class="tagCard">Descriptif: </span>${anime.synopsis}</p>
            <p><span class="tagCard">Genres: </span>${genres}</p>
            <p><span class="tagCard">Classement: </span>${anime.ranking}</p>
            <p><span class="tagCard">Nombre d'épisodes: </span>${anime.episodes}</p>
        </div>
        `;
    });
}

/*END OF FONCTIONS*/

getAnime(getUrl()).then(animes => {
  addCards(animes);
});
