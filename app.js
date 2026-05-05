const audio = new Audio();
const playBtn = document.getElementById('playBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const loopBtn = document.getElementById('loopBtn');
const playIcon = document.getElementById('playIcon');
const progressBar = document.getElementById('progressBar');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');
const trackTitle = document.getElementById('trackTitle');
const trackArtist = document.getElementById('trackArtist');
const albumArtContainer = document.querySelector('.album-art-container');
const audioUpload = document.getElementById('audioUpload');
const adminUploadBtn = document.getElementById('adminUploadBtn');
const playlistEl = document.getElementById('playlist');

// Playlist initiale avec les musiques WABA
let tracks = [
    { name: "L'Waba - Ana Ouiaha", url: "L'Waba - Ana Ouiaha (Video lyrics) - L'WABA.mp3", isFile: false },
    { name: "L'Waba - Derria Nabta", url: "L'Waba - Derria Nabta (Video lyrics) - L'WABA.mp3", isFile: false }
];
let currentTrackIndex = 0;
let isPlaying = false;
let isLooping = false;

function loadTrack(index) {
    if (tracks.length === 0) return;
    const track = tracks[index];
    audio.src = track.url;
    trackTitle.textContent = track.name; 
    trackArtist.textContent = "WABA";
    
    // Update active class in playlist
    const items = playlistEl.querySelectorAll('li');
    items.forEach((item, i) => {
        if (i === index) {
            item.classList.add('active');
            item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
            item.classList.remove('active');
        }
    });
}

function playSong() {
    if (tracks.length === 0) return;
    isPlaying = true;
    playIcon.innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
    albumArtContainer.classList.add('playing');
    audio.play().catch(e => console.error("Auto-play bloqué :", e));
}

function pauseSong() {
    isPlaying = false;
    playIcon.innerHTML = '<path d="M8 5v14l11-7z"/>';
    albumArtContainer.classList.remove('playing');
    audio.pause();
}

function prevSong() {
    if (tracks.length === 0) return;
    currentTrackIndex--;
    if (currentTrackIndex < 0) {
        currentTrackIndex = tracks.length - 1;
    }
    loadTrack(currentTrackIndex);
    if (isPlaying) playSong();
}

function nextSong() {
    if (tracks.length === 0) return;
    currentTrackIndex++;
    if (currentTrackIndex > tracks.length - 1) {
        currentTrackIndex = 0;
    }
    loadTrack(currentTrackIndex);
    if (isPlaying) playSong();
}

function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

// Event Listeners
playBtn.addEventListener('click', () => {
    if (tracks.length === 0) return;
    if (isPlaying) {
        pauseSong();
    } else {
        playSong();
    }
});

prevBtn.addEventListener('click', prevSong);
nextBtn.addEventListener('click', nextSong);

loopBtn.addEventListener('click', () => {
    isLooping = !isLooping;
    audio.loop = isLooping;
    if (isLooping) {
        loopBtn.classList.add('active');
    } else {
        loopBtn.classList.remove('active');
    }
});

audio.addEventListener('timeupdate', () => {
    if (audio.duration) {
        const progressPercent = (audio.currentTime / audio.duration) * 100;
        progressBar.value = progressPercent;
        currentTimeEl.textContent = formatTime(audio.currentTime);
    }
});

audio.addEventListener('loadedmetadata', () => {
    durationEl.textContent = formatTime(audio.duration);
});

audio.addEventListener('ended', nextSong);

progressBar.addEventListener('input', (e) => {
    if (tracks.length === 0) return;
    const seekTime = (e.target.value / 100) * audio.duration;
    audio.currentTime = seekTime;
});

function renderPlaylist() {
    if (tracks.length === 0) {
        playlistEl.innerHTML = '<li class="playlist-empty">Aucune musique chargée</li>';
        return;
    }
    
    playlistEl.innerHTML = '';
    tracks.forEach((track, index) => {
        const li = document.createElement('li');
        li.textContent = track.name;
        if (index === currentTrackIndex) li.classList.add('active');
        
        li.addEventListener('click', () => {
            currentTrackIndex = index;
            loadTrack(currentTrackIndex);
            playSong();
        });
        
        playlistEl.appendChild(li);
    });
}

// Admin Upload Logic
audioUpload.addEventListener('click', (e) => {
    const code = prompt("Code d'accès requis pour ajouter des musiques :");
    if (code !== "1213") {
        e.preventDefault(); // Bloque l'ouverture de la fenêtre
        if (code !== null) {
            alert("Code incorrect !");
        }
    }
});

// File Upload Handler
audioUpload.addEventListener('change', (e) => {
    const files = e.target.files;
    if (files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('audio/')) {
            const objectUrl = URL.createObjectURL(file);
            const fileName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
            tracks.push({
                name: fileName,
                url: objectUrl,
                isFile: true
            });
        }
    }
    
    renderPlaylist();
    
    // Si c'est le premier ajout
    if (tracks.length === files.length && tracks.length > 0) {
        currentTrackIndex = 0;
        loadTrack(currentTrackIndex);
    }
});

// Init (laisse la playlist vide au départ pour WABA)
renderPlaylist();
