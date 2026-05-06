const audio = document.getElementById('mainAudio');
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

const playSvg = '<path d="M8 5v14l11-7z"/>';
const pauseSvg = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';

// Playlist initiale avec les musiques WABA
let tracks = [
    { name: "L'Waba - Ana Ouiaha", url: "L'Waba - Ana Ouiaha (Video lyrics) - L'WABA.mp3", isFile: false },
    { name: "L'Waba - Derria Nabta", url: "L'Waba - Derria Nabta (Video lyrics) - L'WABA.mp3", isFile: false }
];
let currentTrackIndex = 0;
let isPlaying = false;
let isLooping = false;
let isSwapping = false;

function loadTrack(index) {
    if (tracks.length === 0) return;
    const track = tracks[index];
    
    isSwapping = true;
    audio.pause();
    
    if (audio.src !== track.url) {
        audio.src = track.url;
        audio.autoplay = isPlaying;
    }
    audio.load();
    
    trackTitle.textContent = track.name; 
    trackArtist.textContent = "WABA";
    
    updateMediaSession();
    
    // Update active class in playlist
    const items = playlistEl.querySelectorAll('li');
    items.forEach((item, i) => {
        if (i === index) {
            item.classList.add('active');
            if(item.scrollIntoView) item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
            item.classList.remove('active');
        }
    });

    if (isPlaying) {
        audio.play().catch(e => {
            console.log("Lecture auto bloquée, tentative de secours...");
            setTimeout(() => { if(isPlaying) audio.play(); }, 200);
        });
    }
}

function togglePlay() {
    if (tracks.length === 0) return;
    if (isPlaying) {
        audio.pause();
    } else {
        audio.play().catch(e => console.log("Play failed:", e));
    }
}

audio.addEventListener('play', () => {
    isSwapping = false;
    isPlaying = true;
    playIcon.innerHTML = pauseSvg;
    albumArtContainer.classList.add('playing');
    if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'playing';
    }
});

audio.addEventListener('pause', () => {
    if (isSwapping) return;
    isPlaying = false;
    playIcon.innerHTML = playSvg;
    albumArtContainer.classList.remove('playing');
    if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'paused';
    }
});

function prevSong() {
    if (tracks.length === 0) return;
    isPlaying = true;
    currentTrackIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    loadTrack(currentTrackIndex);
}

function nextSong(forcePlay = false) {
    if (tracks.length === 0) return;
    if (forcePlay) isPlaying = true;
    currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
    loadTrack(currentTrackIndex);
}

function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

// Event Listeners
playBtn.addEventListener('click', togglePlay);
prevBtn.addEventListener('click', prevSong);
nextBtn.addEventListener('click', () => nextSong(true));

loopBtn.addEventListener('click', () => {
    isLooping = !isLooping;
    loopBtn.classList.toggle('active', isLooping);
    loopBtn.style.opacity = isLooping ? '1' : '0.5';
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

audio.addEventListener('ended', () => {
    if (isLooping) {
        audio.currentTime = 0;
        audio.play().catch(e => console.log(e));
    } else {
        nextSong(true);
    }
});

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
            isPlaying = true;
            loadTrack(currentTrackIndex);
        });
        
        playlistEl.appendChild(li);
    });
}

// Admin Upload Logic
adminUploadBtn.addEventListener('click', (e) => {
    const code = prompt("Code d'accès requis pour ajouter des musiques :");
    if (code !== "1213") {
        e.preventDefault();
        if (code !== null) alert("Code incorrect !");
    }
});

audioUpload.addEventListener('change', (e) => {
    const files = e.target.files;
    if (files.length === 0) return;

    const newTracks = Array.from(files).filter(file => file.type.startsWith('audio/')).map(file => ({
        name: file.name.replace(/\.[^/.]+$/, ""),
        url: URL.createObjectURL(file),
        isFile: true
    }));
    
    tracks = [...tracks, ...newTracks];
    renderPlaylist();
    isPlaying = true;
    loadTrack(tracks.length - newTracks.length);
});

function updateMediaSession() {
    if ('mediaSession' in navigator) {
        const track = tracks[currentTrackIndex];
        navigator.mediaSession.metadata = new MediaMetadata({
            title: track.name,
            artist: "WABA Officiel",
            album: "WABA Collection",
            artwork: [{ src: 'bg.jpeg', sizes: '512x512', type: 'image/jpeg' }]
        });
        navigator.mediaSession.setActionHandler('play', () => togglePlay());
        navigator.mediaSession.setActionHandler('pause', () => togglePlay());
        navigator.mediaSession.setActionHandler('previoustrack', () => prevSong());
        navigator.mediaSession.setActionHandler('nexttrack', () => nextSong(true));
    }
}

// Init
renderPlaylist();
loadTrack(0);

// Autoplay au chargement
window.addEventListener('load', () => {
    setTimeout(() => {
        if (!isPlaying) {
            audio.play().then(() => { isPlaying = true; }).catch(() => {
                const start = () => {
                    isPlaying = true;
                    loadTrack(currentTrackIndex);
                    document.removeEventListener('click', start);
                    document.removeEventListener('touchstart', start);
                };
                document.addEventListener('click', start);
                document.addEventListener('touchstart', start);
            });
        }
    }, 2000);
});
