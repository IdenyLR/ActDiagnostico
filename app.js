const ACCESS_TOKEN = 'lcRe2-GiBEhSjhOVmJ-8Uxz1IL8M19WW4_tgtsMB5hT0T12lKtovlZd1BNder_sQ';
const baseUrl = 'https://api.genius.com';

//almacenar canciones
let songs = [];

// Letras manuales
const manualLyrics = {
    "Levitating": 
    `If you wanna run away with me, I know a galaxy
    And I can take you for a ride
    I had a premonition that we fell into a rhythm
    Where the music don't stop for life
    Glitter in the sky, glitter in my eyes
    Shining just the way I like
    If you're feeling like you need a little bit of company
    You met me at the perfect time
    You want me, I want you, baby
    My sugarboo, I'm levitating
    The Milky Way, we're renegading
    Yeah, yeah, yeah, yeah, yeah
    I got you, moonlight, you're my starlight
    I need you all night, come on, dance with me
    I'm levitating
    You, moonlight, you're my starlight (you're the moonlight)
    I need you all night, come on, dance with me
    I'm levitating`, 

    "New Rules": 
    `Talkin' in my sleep at night, makin' myself crazy
    Out of my mind, out of my mind
    Wrote it down and read it out, hopin' it would save me
    Too many times, too many times
    My love, he makes me feel like nobody else, nobody else
    But my love, he doesn't love me, so I tell myself, I tell myself
    One: don't pick up the phone
    You know he's only callin' 'cause he's drunk and alone
    Two: don't let him in
    You'll have to kick him out again
    Three: don't be his friend
    You know you're gonna wake up in his bed in the morning
    And if you're under him, you ain't gettin' over him
    I got new rules, I count 'em
    I got new rules, I count 'em
    I got new rules, I count 'em`,  

    "Be The One": `I see the moon, I see the moon, I see the moon
    Oh, when you're looking at the sun
    You're not a fool, not a fool, not a fool
    No, you're not fooling anyone
    Oh, but when you're gone, when you're gone, when you're gone
    Oh baby, all the lights go out
    Thinking now that maybe I was wrong, I was wrong, I was wrong
    Come back to me, baby, we can work this out
    Oh baby, come on, let me get to know you
    Just another chance so that I can show
    That I won't let you down and run
    No, I won't let you down and run
    'Cause I could be the one
    I could be the one
    I could be the one
    I could be the one
    I see in blue, I see in blue, I see in blue
    Oh, when you see everything in red
    There is nothing that I wouldn't do for you, do for you, do for you
    Oh, 'cause you got inside my head`,
    
};

// buscar canciones en la API
function searchSongs(query) {
    const url = `${baseUrl}/search?q=Dua%20Lipa%20${query}&access_token=${ACCESS_TOKEN}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            songs = data.response.hits
                .filter(hit => hit.result.primary_artist.name === 'Dua Lipa')
                .map(hit => hit.result);

            // mostrar resultados en la barra desplegable
            populateSongList(songs);
        })
        .catch(error => {
            console.error('Error searching songs:', error);
        });
}


function populateSongList(songs) {
    const songSelect = document.getElementById('song');
    songSelect.innerHTML = '';  //¿?

    // mostrar mensaje cuando aun no se selecciona alguna cancion
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = songs.length > 0 ? 'Selecciona una canción para ver su letra' : 'No se encontraron canciones';
    songSelect.appendChild(defaultOption);

    // canciones encontradas 
    songs.forEach(song => {
        const option = document.createElement('option');
        option.value = song.id;   
        option.textContent = song.title;   
        songSelect.appendChild(option);
    });
}

// Hacemos fetch para obtener la info de la api
function fetchSongLyrics() {
    const songSelect = document.getElementById('song');
    const songId = songSelect.value;
    const songTitle = songSelect.options[songSelect.selectedIndex].text;

    if (!songId) {
        return;
    }

    //?????
    // provicional (de las letras de las canciones q agregué manualmente)
    if (manualLyrics[songTitle]) {
        // Hacwr q cada palabra sea clickeable
        let lyrics = formatLyrics(manualLyrics[songTitle]);

        // Mostrar la letra de la canción manual y la imagen de la canción
        document.getElementById('lyrics-container').innerHTML = `
            <h3>${songTitle} - Dua Lipa</h3>
            <div>
                <img src="https://images.genius.com/8cfebf6fa6f8a0fba9d1d835fce0ebd7.1000x1000x1.jpg" alt="${songTitle}" class="song-image" />
            </div>
            <p>${lyrics}</p>
        `;
        return;
    }

    // Si no está en las letras manuales, intentamos obtenerla de Genius
    const url = `${baseUrl}/songs/${songId}?access_token=${ACCESS_TOKEN}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const song = data.response.song;
            let lyrics = song.lyrics_body || "Letra no disponible.";
            const imageUrl = song.song_art_image_url;

            // Si no tiene letra, mostrar solo el enlace hacia Genius
            if (lyrics === "Letra no disponible.") {
                document.getElementById('lyrics-container').innerHTML = `
                    <h3>${song.title} - ${song.primary_artist.name}</h3>
                    <div>
                        <img src="${imageUrl}" alt="${song.title}" class="song-image" />
                    </div>
                    <p><a href="https://genius.com/songs/${song.id}" target="_blank">Ver letra en Genius</a></p>
                `;
                return;
            }

            // Convertir la letra en HTML para que se le pueda dar clic a las palabras
            lyrics = formatLyrics(lyrics);

            // Mostrar la letra y la imagen de la canción
            document.getElementById('lyrics-container').innerHTML = `
                <h3>${song.title} - ${song.primary_artist.name}</h3>
                <div>
                    <img src="${imageUrl}" alt="${song.title}" class="song-image" />
                </div>
                <p>${lyrics}</p>
            `;
        })
        .catch(error => {
            console.error('Error fetching song lyrics:', error);
            document.getElementById('lyrics-container').innerHTML = `<p>Error al cargar la letra. Intenta nuevamente.</p>`;
        });
}

// TRaducir la palabra
function translateWord(word) {
    const encodedWord = encodeURIComponent(word);
    window.open(`https://translate.google.com/?sl=auto&tl=es&text=${encodedWord}&op=translate`, '_blank');
}

// "ordenar la canción"
function formatLyrics(lyrics) {
    const lines = lyrics.split('\n').map(line => {
        return line.trim().length > 0
            ? line.split(' ').map(word => {
                return `<span class="clickable-word" onclick="translateWord('${word}')">${word}</span>`;
            }).join(' ')
            : '';  // ???
    });

    return lines.join('<br/>');
}

// barra de búsqueda
document.getElementById('search').addEventListener('input', (event) => {
    const query = event.target.value.trim();
    if (query.length > 0) {
        searchSongs(query);  // 
    } else {
        populateSongList([]);  
    }
});
