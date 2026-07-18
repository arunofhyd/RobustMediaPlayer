// --- Initialization of Lucide Icons ---
        lucide.createIcons();

        // --- Core Application Logic ---
        const videoPlayer = document.getElementById('videoPlayer');
        const iframePlayer = document.getElementById('iframePlayer');
        const videoUrlInput = document.getElementById('videoUrl');
        const loadUrlBtn = document.getElementById('loadUrlBtn');
        const videoFileInput = document.getElementById('videoFile');
        const subtitleFileInput = document.getElementById('subtitleFile');
        // const statusMessage = document.getElementById('statusMessage'); // Removed
        const toastContainer = document.getElementById('toastContainer');
        const mainCard = document.getElementById('mainCard');
        const dragDropOverlay = document.getElementById('dragDropOverlay');
        const themeToggle = document.getElementById('themeToggle');
        const loopToggle = document.getElementById('loopToggle');
        const feedbackIndicator = document.getElementById('feedbackIndicator');
        const indicatorIconWrapper = document.getElementById('indicatorIconWrapper');

        const subtitleStyleSheet = document.getElementById('subtitle-style');

        // Settings DOM elements
        const settingsToggle = document.getElementById('settingsToggle');
        const settingsPanel = document.getElementById('settingsPanel');
        const pipToggle = document.getElementById('pipToggle');
        const fullscreenToggle = document.getElementById('fullscreenToggle');
        const screenshotBtn = document.getElementById('screenshotBtn');
        const resetSettingsBtn = document.getElementById('resetSettingsBtn');

        // Help Modal Elements
        const helpBtn = document.getElementById('helpBtn');
        const helpModal = document.getElementById('helpModal');
        const closeHelpBtn = document.getElementById('closeHelpBtn');
        const playlistToggleBtn = document.getElementById('playlistToggleBtn');

        // Audio Visualizer Elements
        const canvas = document.getElementById('audioVisualizer');
        const canvasCtx = canvas.getContext('2d');

        // Playlist Elements
        const playlistSidebar = document.getElementById('playlistSidebar');
        const playlistContainer = document.getElementById('playlistContainer');
        const playlistCount = document.getElementById('playlistCount');

        // Demo elements
        const subtitleDemo = document.getElementById('subtitleDemo');
        const demoText = document.getElementById('demoText');

        // Input elements
        const subFontColorInput = document.getElementById('subFontColor');
        const subFontSizeInput = document.getElementById('subFontSize');
        const subFontFamilyInput = document.getElementById('subFontFamily');
        const subOffsetInput = document.getElementById('subOffset');
        const syncSubStartBtn = document.getElementById('syncSubStartBtn');

        // Video Filter Inputs
        const videoBrightnessInput = document.getElementById('videoBrightness');
        const videoContrastInput = document.getElementById('videoContrast');
        const videoSaturationInput = document.getElementById('videoSaturation');
        const valBrightness = document.getElementById('valBrightness');
        const valContrast = document.getElementById('valContrast');
        const valSaturation = document.getElementById('valSaturation');

        const currentFontSizeSpan = document.getElementById('currentFontSize');
        const currentSubOffsetSpan = document.getElementById('currentSubOffset');

        // --- State Management ---
        let feedbackTimeout;
        let currentVideoBlobUrl = null;
        let currentMediaId = null; // For resume functionality
        let hls;
        let originalCues = [];
        let activeTrack = null;
        let playbackMode = 'normal'; // normal, loop-one, loop-all, shuffle
        const SUB_SETTINGS_KEY = 'subtitleSettings';
        const URL_HISTORY_KEY = 'urlHistory';

        // Audio Context State
        let audioCtx;
        let audioSource;
        let analyser;
        let isVisualizerRunning = false;
        let visualizerStyle = 'bars';
        let visualizerHue = 217; // Default Blue
        let visualizerSaturation = 80;
        let visualizerLightness = 60;
        let isAudioFile = false;

        // Playlist State
        let playlist = [];
        let currentPlaylistIndex = -1;

        // PiP State
        let pipVideo = null;

        // --- Theme Toggle Logic ---
        function setTheme(theme) {
            const root = document.documentElement;
            if (theme === 'light') {
                root.classList.remove('dark');
                localStorage.setItem('theme', 'light');
            } else {
                root.classList.add('dark');
                localStorage.setItem('theme', 'dark');
            }
        }

        themeToggle.addEventListener('click', () => {
            const isDark = document.documentElement.classList.contains('dark');
            setTheme(isDark ? 'light' : 'dark');
        });

        // Initialize theme
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme) {
            setTheme(storedTheme);
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            setTheme('light');
        } else {
            setTheme('dark');
        }

        // --- Loop/Shuffle Logic ---
        const playbackModes = ['normal', 'loop-one', 'loop-all', 'shuffle'];
        
        loopToggle.addEventListener('click', () => {
            const currentIndex = playbackModes.indexOf(playbackMode);
            const nextIndex = (currentIndex + 1) % playbackModes.length;
            playbackMode = playbackModes[nextIndex];
            updatePlaybackModeUI();
        });

        function updatePlaybackModeUI() {
            let iconName = 'arrow-right-circle';
            let title = 'Mode: Normal';
            let active = false;

            videoPlayer.loop = false; // Reset native loop

            switch(playbackMode) {
                case 'normal':
                    iconName = 'arrow-right-circle';
                    title = 'Mode: Normal';
                    active = false;
                    break;
                case 'loop-one':
                    iconName = 'repeat-1';
                    title = 'Mode: Loop One';
                    active = true;
                    videoPlayer.loop = true;
                    break;
                case 'loop-all':
                    iconName = 'repeat';
                    title = 'Mode: Loop All';
                    active = true;
                    break;
                case 'shuffle':
                    iconName = 'shuffle';
                    title = 'Mode: Shuffle';
                    active = true;
                    break;
            }

            // Update Icon
            loopToggle.innerHTML = `<i data-lucide="${iconName}" class="h-5 w-5 sm:h-6 sm:w-6"></i>`;
            lucide.createIcons({ root: loopToggle });
            loopToggle.title = title;

            // Update Style
            if (active) {
                loopToggle.classList.remove('bg-black/50', 'text-white');
                loopToggle.classList.add('bg-primary', 'text-primary-foreground');
            } else {
                loopToggle.classList.remove('bg-primary', 'text-primary-foreground');
                loopToggle.classList.add('bg-black/50', 'text-white');
            }
            
            showTemporaryAlert(title, 'info');
        }

        // --- Subtitle Logic ---
        function loadSubtitleSettings() {
            const savedSettings = localStorage.getItem(SUB_SETTINGS_KEY);
            const defaultSettings = {
                fontColor: '#ffffff',
                fontSize: '24px',
                fontFamily: "'Inter', sans-serif",
                subOffset: 0.0,
            };
            const settings = savedSettings ? JSON.parse(savedSettings) : defaultSettings;

            if (savedSettings && settings.bgColor) {
                delete settings.bgColor;
                delete settings.bgOpacity;
                localStorage.setItem(SUB_SETTINGS_KEY, JSON.stringify(settings));
            }

            subFontColorInput.value = settings.fontColor;
            const sizeInPixels = parseInt(settings.fontSize.replace('px', '')) || 24;
            subFontSizeInput.value = Math.max(2, Math.min(100, sizeInPixels));
            subOffsetInput.value = parseFloat(settings.subOffset) || 0.0;
            subFontFamilyInput.value = settings.fontFamily;

            applySubtitleStyles();
            applySubtitleOffset();
            demoText.textContent = "The quick brown fox jumps over the lazy dog";
        }

        function applySubtitleStyles() {
            const rawFontSize = subFontSizeInput.value;
            const rawOffset = parseFloat(subOffsetInput.value).toFixed(1);

            const settings = {
                fontColor: subFontColorInput.value,
                fontSize: rawFontSize + 'px',
                fontFamily: subFontFamilyInput.value,
                subOffset: rawOffset,
            };

            if(currentFontSizeSpan) currentFontSizeSpan.textContent = settings.fontSize;
            if(currentSubOffsetSpan) currentSubOffsetSpan.textContent = rawOffset;

            localStorage.setItem(SUB_SETTINGS_KEY, JSON.stringify(settings));

            const cssRule = `
                video::cue {
                    color: ${settings.fontColor} !important;
                    background-color: transparent !important;
                    font-size: ${settings.fontSize} !important;
                    font-family: ${settings.fontFamily} !important;
                    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
                    padding: 0 !important;
                    border-radius: 0 !important;
                }
            `;
            subtitleStyleSheet.textContent = cssRule;

            const proportionalSize = (parseInt(rawFontSize) / 100) * 5;
            const demoFontSize = Math.max(0.5, Math.min(6.0, proportionalSize));

            demoText.style.color = settings.fontColor;
            demoText.style.backgroundColor = 'transparent';
            demoText.style.fontSize = demoFontSize + 'vw';
            demoText.style.fontFamily = settings.fontFamily;
            demoText.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.8)';
            demoText.style.display = 'inline-block';
            demoText.style.padding = '0';
            demoText.style.borderRadius = '0';

            applySubtitleOffset();
        }

        function applySubtitleOffset() {
            const offset = parseFloat(subOffsetInput.value);
            currentSubOffsetSpan.textContent = offset.toFixed(1);

            const tracks = videoPlayer.textTracks;
            let currentTrack = null;

            for (let i = 0; i < tracks.length; i++) {
                if (tracks[i].mode === 'showing' || tracks[i].default) {
                    currentTrack = tracks[i];
                    break;
                }
            }

            if (!currentTrack) return;

            if (currentTrack !== activeTrack || originalCues.length === 0) {
                if (currentTrack.cues && currentTrack.cues.length > 0) {
                    originalCues = Array.from(currentTrack.cues).map(cue => ({
                        start: cue.startTime,
                        end: cue.endTime,
                        text: cue.text
                    }));
                    activeTrack = currentTrack;
                } else {
                    currentTrack.addEventListener('load', applySubtitleOffset, { once: true });
                    return;
                }
            }

            while(currentTrack.cues.length > 0) {
                currentTrack.removeCue(currentTrack.cues[0]);
            }

            originalCues.forEach(cueData => {
                const newStartTime = Math.max(0, cueData.start + offset);
                const newEndTime = Math.max(newStartTime, cueData.end + offset);
                const newCue = new VTTCue(newStartTime, newEndTime, cueData.text);
                currentTrack.addCue(newCue);
            });
            currentTrack.mode = 'showing';
            
            // Update Sync Button Text
            if (originalCues.length > 0) {
                const firstCue = originalCues[0];
                syncSubStartBtn.textContent = `Sync to: "${firstCue.text.substring(0, 15)}..."`;
                syncSubStartBtn.onclick = () => {
                    const currentVidTime = videoPlayer.currentTime;
                    // We want firstCue.start + offset = currentVidTime
                    // So offset = currentVidTime - firstCue.start
                    const newOffset = currentVidTime - firstCue.start;
                    subOffsetInput.value = newOffset.toFixed(1);
                    applySubtitleStyles();
                    showTemporaryAlert(`Synced to ${formatTime(currentVidTime)}`, 'success');
                };
            }
        }

        [subFontColorInput, subFontFamilyInput, subFontSizeInput, subOffsetInput].forEach(input => {
            const eventType = input.type === 'range' ? 'input' : 'change';
            input.addEventListener(eventType, applySubtitleStyles);
        });

        function formatTime(seconds) {
            const h = Math.floor(seconds / 3600);
            const m = Math.floor((seconds % 3600) / 60);
            const s = Math.floor(seconds % 60);
            if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
            return `${m}:${s.toString().padStart(2, '0')}`;
        }

        function toggleSettings() {
            const isHidden = settingsPanel.classList.toggle('hidden');

            // Re-render icon with rotation
            if (isHidden) {
                // Not rotated
                 settingsToggle.innerHTML = '<i data-lucide="settings-2" class="h-6 w-6 transition-transform duration-300"></i>';
            } else {
                // Rotated
                 settingsToggle.innerHTML = '<i data-lucide="settings-2" class="h-6 w-6 transition-transform duration-300 rotate-180"></i>';
            }
            lucide.createIcons();

            subtitleDemo.classList.toggle('hidden', isHidden);
            settingsToggle.setAttribute('aria-expanded', !isHidden);
        }

        settingsToggle.addEventListener('click', toggleSettings);

        // Picture-in-Picture
        if (document.pictureInPictureEnabled && pipToggle) {
             pipToggle.classList.remove('hidden');
             pipToggle.addEventListener('click', async () => {
                 try {
                     if (document.pictureInPictureElement) {
                         await document.exitPictureInPicture();
                         return;
                     }

                     if (isAudioFile) {
                         // Audio Visualizer PiP Logic
                         if (!pipVideo) {
                             pipVideo = document.createElement('video');
                             // Invisible but rendered element for PiP support
                             pipVideo.style.position = 'fixed';
                             pipVideo.style.top = '0';
                             pipVideo.style.left = '0';
                             pipVideo.style.width = '1px';
                             pipVideo.style.height = '1px';
                             pipVideo.style.opacity = '0';
                             pipVideo.style.pointerEvents = 'none';
                             pipVideo.style.zIndex = '-50';
                             pipVideo.muted = true;
                             pipVideo.playsInline = true;
                             document.body.appendChild(pipVideo);

                             // Sync Logic (PiP -> Main)
                             pipVideo.addEventListener('play', () => {
                                 if (videoPlayer.paused) videoPlayer.play();
                             });
                             pipVideo.addEventListener('pause', () => {
                                 if (!videoPlayer.paused && document.pictureInPictureElement === pipVideo) {
                                     videoPlayer.pause();
                                 }
                             });

                             // Sync Logic (Main -> PiP)
                             videoPlayer.addEventListener('play', () => {
                                 if (document.pictureInPictureElement === pipVideo && pipVideo.paused) pipVideo.play();
                             });
                             videoPlayer.addEventListener('pause', () => {
                                 if (document.pictureInPictureElement === pipVideo && !pipVideo.paused) pipVideo.pause();
                             });

                             pipVideo.addEventListener('leavepictureinpicture', () => {
                                 pipVideo.pause();
                                 // Stop tracks to save resources
                                 if (pipVideo.srcObject) {
                                     pipVideo.srcObject.getTracks().forEach(track => track.stop());
                                     pipVideo.srcObject = null;
                                 }
                             });
                         }

                         // Capture Stream from Canvas (30 FPS)
                         const stream = canvas.captureStream(30);
                         pipVideo.srcObject = stream;
                         await pipVideo.play();
                         await pipVideo.requestPictureInPicture();

                         // Sync initial state
                         if (videoPlayer.paused) pipVideo.pause();

                     } else {
                         // Standard Video PiP
                         await videoPlayer.requestPictureInPicture();
                     }
                 } catch (err) {
                     console.error('PiP Error:', err);
                     showTemporaryAlert('PiP failed: ' + err.message, 'error');
                 }
             });
        }

        // Fullscreen Logic
        fullscreenToggle.addEventListener('click', () => {
            const container = videoPlayer.parentElement;
            if (!document.fullscreenElement) {
                container.requestFullscreen().catch(err => {
                    showTemporaryAlert(`Error attempting to enable fullscreen: ${err.message} (${err.name})`, 'error');
                });
            } else {
                document.exitFullscreen();
            }
        });

        document.addEventListener('fullscreenchange', () => {
            if (document.fullscreenElement) {
                fullscreenToggle.innerHTML = '<i data-lucide="minimize" class="h-5 w-5 sm:h-6 sm:w-6"></i>';
                fullscreenToggle.title = "Exit Fullscreen";
            } else {
                fullscreenToggle.innerHTML = '<i data-lucide="maximize" class="h-5 w-5 sm:h-6 sm:w-6"></i>';
                fullscreenToggle.title = "Fullscreen";
            }
            lucide.createIcons({ root: fullscreenToggle });
        });

        // Screenshot Logic
        screenshotBtn.addEventListener('click', () => {
            if (videoPlayer.style.display === 'none' || !videoPlayer.src) {
                showTemporaryAlert('Load a video first.', 'error');
                return;
            }

            const canvas = document.createElement('canvas');
            canvas.width = videoPlayer.videoWidth;
            canvas.height = videoPlayer.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(videoPlayer, 0, 0, canvas.width, canvas.height);

            try {
                const dataUrl = canvas.toDataURL('image/png');
                const link = document.createElement('a');
                link.download = `screenshot_${Date.now()}.png`;
                link.href = dataUrl;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                showTemporaryAlert('Screenshot saved.', 'success');
            } catch (err) {
                showTemporaryAlert('Screenshot failed (CORS/Security).', 'error');
            }
        });


        // --- Helper Functions ---
        function showTemporaryAlert(message, type) {
            // Create a new toast element
            const toast = document.createElement('div');
            toast.className = 'flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg bg-background text-sm font-medium animate-in slide-in-from-right-full transition-all duration-300 pointer-events-auto';

            // Add border/text colors based on type
            let iconName = 'info';
            if (type === 'error') {
                toast.classList.add('border-destructive/50', 'text-destructive');
                iconName = 'alert-triangle';
            } else if (type === 'success') {
                toast.classList.add('border-green-500/50', 'text-green-600', 'dark:text-green-400');
                iconName = 'check-circle';
            } else {
                toast.classList.add('border-border', 'text-foreground');
                iconName = 'info';
            }

            // Inner HTML structure with Icon and Message
            toast.innerHTML = `
                <i data-lucide="${iconName}" class="h-4 w-4"></i>
                <span>${message}</span>
            `;

            // Append to container
            toastContainer.appendChild(toast);
            lucide.createIcons({ root: toast }); // Initialize icon in new element

            // Remove after 3 seconds
            setTimeout(() => {
                toast.classList.add('opacity-0', 'translate-x-full');
                setTimeout(() => {
                    toast.remove();
                }, 300); // Wait for transition
            }, 3000);
        }

        function clearTracks() {
            const tracks = videoPlayer.querySelectorAll('track');
            tracks.forEach(track => {
                if (track.src.startsWith('blob:')) URL.revokeObjectURL(track.src);
                track.remove();
            });
            originalCues = [];
            activeTrack = null;
        }

        function setPlayerMode(mode) {
            const overlayControls = document.getElementById('overlayControls');
            if (mode === 'video') {
                videoPlayer.style.display = 'block';
                iframePlayer.style.display = 'none';
                iframePlayer.src = '';
                dragDropOverlay.classList.remove('pointer-events-none');
                if (overlayControls) overlayControls.classList.remove('hidden');
            } else if (mode === 'iframe') {
                videoPlayer.style.display = 'none';
                videoPlayer.pause();
                videoPlayer.removeAttribute('src');
                videoPlayer.load();
                videoPlayer.poster = 'https://placehold.co/800x450/09090b/e4e4e7?text=External+Embed+Loaded';
                clearTracks();
                iframePlayer.style.display = 'block';
                dragDropOverlay.classList.add('pointer-events-none');
                if (overlayControls) overlayControls.classList.add('hidden');
                if (currentVideoBlobUrl) URL.revokeObjectURL(currentVideoBlobUrl);
                currentVideoBlobUrl = null;
            }
            if (!subtitleDemo.classList.contains('hidden')) subtitleDemo.classList.add('hidden');
        }

        function srtToVtt(srtText) {
            const vttBody = srtText.replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, '$1.$2');
            return 'WEBVTT\n\n' + vttBody;
        }

        function convertYouTubeLink(url) {
            // Match youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID
            const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
            const match = url.match(regExp);
            if (match && match[2].length === 11) {
                return `https://www.youtube.com/embed/${match[2]}?autoplay=1`;
            }
            return url;
        }

        function loadMediaSource(src, fileName = null) {
            src = src ? src.trim() : '';
            if (src && !src.startsWith('http') && !src.startsWith('blob:')) src = 'https://' + src;

            if (hls) {
                hls.destroy();
                hls = null;
            }

            // Helper to safely revoke old blob if not in playlist
            const safelyRevokeBlob = (blobUrl) => {
                if (blobUrl && blobUrl.startsWith('blob:')) {
                    const isInPlaylist = playlist.some(item => item.url === blobUrl);
                    if (!isInPlaylist) {
                        URL.revokeObjectURL(blobUrl);
                    }
                }
            };

            if (!src) {
                safelyRevokeBlob(currentVideoBlobUrl);
                setPlayerMode('video');
                videoPlayer.src = '';
                videoPlayer.poster = 'https://placehold.co/800x450/09090b/e4e4e7?text=No+Media+Loaded';
                showTemporaryAlert('Media source cleared.', 'info');
                videoPlayer.load();
                currentMediaId = null;
                return;
            }

            // Generate ID for Resume
            if (fileName) {
                currentMediaId = 'local_' + fileName;
            } else {
                currentMediaId = 'url_' + src;
            }

            const isBlobUrl = src.startsWith('blob:');
            const isTsFile = (fileName && fileName.toLowerCase().endsWith('.ts')) || src.toLowerCase().includes('.ts');
            const mediaExtensions = /\.(mp4|webm|ogg|mov|avi|m4v|flv|f4v|mkv|wmv|mp3|wav|flac|m4a)$/i;
            const urlWithoutQuery = src.split('?')[0];
            const isDirectMediaFile = mediaExtensions.test(urlWithoutQuery) || (isBlobUrl && !isTsFile);

            // Check for YouTube specifically or other external links
            const isYouTube = src.includes('youtube.com') || src.includes('youtu.be');
            const isExternalLink = src.startsWith('http');

            // Detect Audio File
            const audioExtensions = /\.(mp3|wav|flac|m4a|aac|ogg)$/i;
            isAudioFile = (fileName && audioExtensions.test(fileName)) || audioExtensions.test(urlWithoutQuery);
            
            // Toggle Visualizer Visibility
            if (isAudioFile) {
                canvas.classList.remove('hidden');
                canvas.classList.add('opacity-100');
                canvas.classList.remove('opacity-90');
                // Removed logo poster to show visualizer clearly on black background
                videoPlayer.poster = ''; 
                randomizeVisualizer();
            } else {
                canvas.classList.add('hidden');
                isVisualizerRunning = false;
            }

            if (isTsFile && typeof Hls !== 'undefined' && Hls.isSupported()) {
                setPlayerMode('video');
                if (currentVideoBlobUrl && currentVideoBlobUrl !== src) safelyRevokeBlob(currentVideoBlobUrl);
                currentVideoBlobUrl = isBlobUrl ? src : null;

                hls = new Hls();
                hls.loadSource(src);
                hls.attachMedia(videoPlayer);
                hls.on(Hls.Events.MANIFEST_PARSED, function() {
                    videoPlayer.play();
                });
                videoPlayer.poster = '';
                showTemporaryAlert('Loaded .ts file via HLS.js.', 'success');
            } else if (isDirectMediaFile) {
                setPlayerMode('video');
                if (currentVideoBlobUrl && currentVideoBlobUrl !== src) safelyRevokeBlob(currentVideoBlobUrl);
                currentVideoBlobUrl = isBlobUrl ? src : null;

                videoPlayer.removeAttribute('src');
                videoPlayer.src = src;
                videoPlayer.load();
                if (!isAudioFile) videoPlayer.poster = '';
                showTemporaryAlert('Media loaded successfully.', 'success');
            } else if (isYouTube) {
                // Special handling for YouTube
                safelyRevokeBlob(currentVideoBlobUrl);
                currentVideoBlobUrl = null;
                setPlayerMode('iframe');
                iframePlayer.src = convertYouTubeLink(src);
                currentMediaId = null; // Can't resume iframe
                showTemporaryAlert('YouTube video loaded.', 'success');
            } else if (isExternalLink) {
                safelyRevokeBlob(currentVideoBlobUrl);
                currentVideoBlobUrl = null;
                setPlayerMode('iframe');
                iframePlayer.src = src;
                currentMediaId = null; // Can't resume iframe
                showTemporaryAlert('External embed loaded.', 'info');
            } else {
                setPlayerMode('video');
                videoPlayer.src = '';
                videoPlayer.poster = 'https://placehold.co/800x450/cc3333/ffffff?text=Invalid+Input';
                videoPlayer.load();
                showTemporaryAlert('Error: Invalid URL or Format.', 'error');
                currentMediaId = null;
                return; // Don't save history for invalid
            }

            // Save to history if it's a URL
            if (!fileName && src) {
                saveUrlToHistory(src);
            }
        }

        function saveUrlToHistory(url) {
            let history = JSON.parse(localStorage.getItem(URL_HISTORY_KEY) || '[]');
            if (!history.includes(url)) {
                history.unshift(url);
                if (history.length > 10) history.pop();
                localStorage.setItem(URL_HISTORY_KEY, JSON.stringify(history));
                updateHistoryDatalist();
            }
        }

        function updateHistoryDatalist() {
            const history = JSON.parse(localStorage.getItem(URL_HISTORY_KEY) || '[]');
            const datalist = document.getElementById('urlHistory');
            datalist.innerHTML = '';
            history.forEach(url => {
                const option = document.createElement('option');
                option.value = url;
                datalist.appendChild(option);
            });
        }
        
        // Init History
        updateHistoryDatalist();

        function processSubtitleFile(file) {
            if (videoPlayer.style.display === 'none' || !videoPlayer.src) {
                showTemporaryAlert('Load a video first.', 'error');
                subtitleFileInput.value = null;
                return;
            }
            const fileName = file.name.toLowerCase();
            let mimeType = 'text/vtt';
            let fileType = '';

            if (fileName.endsWith('.vtt')) fileType = 'WebVTT';
            else if (fileName.endsWith('.srt')) fileType = 'SubRip';
            else {
                showTemporaryAlert('Only .vtt and .srt supported.', 'error');
                subtitleFileInput.value = null;
                return;
            }

            const reader = new FileReader();
            reader.onload = function(e) {
                let textContent = e.target.result;
                try {
                    if (fileType === 'SubRip') textContent = srtToVtt(textContent);
                    const subtitleBlob = new Blob([textContent], { type: mimeType });
                    const subtitleUrl = URL.createObjectURL(subtitleBlob);

                    clearTracks();
                    const track = document.createElement('track');
                    track.kind = 'subtitles';
                    track.label = `Local (${fileType})`;
                    track.srclang = 'en';
                    track.src = subtitleUrl;
                    track.default = true;
                    videoPlayer.appendChild(track);

                    track.addEventListener('load', () => {
                        showTemporaryAlert('Subtitle loaded.', 'success');
                        activeTrack = track.track;
                        applySubtitleOffset();
                    }, { once: true });
                } catch (error) {
                    showTemporaryAlert('Error processing subtitle.', 'error');
                }
                subtitleFileInput.value = null;
            };
            reader.readAsText(file);
        }

        // --- Event Listeners ---
        loadUrlBtn.addEventListener('click', () => {
            loadMediaSource(videoUrlInput.value.trim());
            videoFileInput.value = '';
        });

        videoFileInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                loadMediaSource(URL.createObjectURL(file), file.name);
                videoUrlInput.value = '';
            }
        });

        subtitleFileInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) processSubtitleFile(file);
        });

        videoPlayer.addEventListener('error', (e) => {
            // CORS Retry Logic
            if (videoPlayer.getAttribute('crossorigin') === 'anonymous') {
                console.warn("Video failed to load with CORS. Retrying without CORS (Visualizer/Screenshot disabled).");
                videoPlayer.removeAttribute('crossorigin');
                videoPlayer.load();
                // Prevent infinite loop if it fails again is handled by the browser not firing error again for same error state immediately or just failing hard
                // Ideally we'd remove this listener or add a flag, but for simple retry:
                return; 
            }
            videoPlayer.poster = 'https://placehold.co/800x450/cc3333/ffffff?text=Media+Loading+Failed';
            showTemporaryAlert('Media failed to load.', 'error');
        });

        videoPlayer.addEventListener('loadedmetadata', () => {
             // Reset visualizer state on new media
             isVisualizerRunning = false;
             
             if (currentMediaId) {
                 const savedTime = localStorage.getItem('resume_' + currentMediaId);
                 if (savedTime && parseFloat(savedTime) > 5) {
                     videoPlayer.currentTime = parseFloat(savedTime);
                     showTemporaryAlert('Resumed at ' + formatTime(savedTime), 'info');
                 }
             }
        });

        let lastSavedTime = 0;
        videoPlayer.addEventListener('timeupdate', () => {
            if (currentMediaId && !videoPlayer.paused) {
                 const currentTimeInt = Math.floor(videoPlayer.currentTime);
                 if (currentTimeInt !== lastSavedTime && currentTimeInt % 2 === 0) {
                      localStorage.setItem('resume_' + currentMediaId, videoPlayer.currentTime);
                      lastSavedTime = currentTimeInt;
                 }
            }
        });

        // --- Drag & Drop Helpers ---
        function handleDragOver(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        function handleFileDrop(files) {
            const fileList = Array.from(files);
            if (fileList.length === 0) return;

            const mediaFiles = fileList.filter(file => {
                const name = file.name.toLowerCase();
                return file.type.startsWith('video/') || file.type.startsWith('audio/') || 
                       name.match(/\.(mp4|webm|mkv|avi|mov|ts|wmv|mp3|wav|flac|m4a)$/i);
            });

            const subtitleFiles = fileList.filter(file => {
                return file.name.toLowerCase().endsWith('.vtt') || file.name.toLowerCase().endsWith('.srt');
            });

            // Handle Playlist Logic
            if (mediaFiles.length > 0) {
                if (mediaFiles.length > 1 || playlist.length > 0) {
                    // Add to playlist
                    mediaFiles.forEach(file => {
                        playlist.push({
                            file: file,
                            url: URL.createObjectURL(file),
                            name: file.name
                        });
                    });
                    renderPlaylist();
                    
                    // If playing nothing, start the first added one
                    if (currentPlaylistIndex === -1) {
                        playPlaylistItem(playlist.length - mediaFiles.length);
                    } else {
                        showTemporaryAlert(`Added ${mediaFiles.length} files to queue.`, 'success');
                    }
                    
                    // Show sidebar
                    playlistSidebar.classList.remove('hidden');
                    playlistSidebar.classList.add('flex');
                } else {
                    // Single file drop, direct play
                    loadMediaSource(URL.createObjectURL(mediaFiles[0]), mediaFiles[0].name);
                    videoUrlInput.value = '';
                }
            }

            if (subtitleFiles.length > 0) {
                processSubtitleFile(subtitleFiles[0]); 
            }
            
            if (mediaFiles.length === 0 && subtitleFiles.length === 0) {
                showTemporaryAlert('Unsupported file(s).', 'error');
            }
        }

        // --- Drag & Drop: Main Card ---
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            mainCard.addEventListener(eventName, handleDragOver, false);
        });

        mainCard.addEventListener('dragenter', (e) => {
            if (videoPlayer.style.display !== 'none' && e.dataTransfer.types.includes('Files')) {
                dragDropOverlay.style.display = 'flex';
            }
        }, false);

        mainCard.addEventListener('dragleave', (e) => {
            if (!mainCard.contains(e.relatedTarget)) {
                dragDropOverlay.style.display = 'none';
            }
        }, false);

        mainCard.addEventListener('drop', (e) => {
            dragDropOverlay.style.display = 'none';
            handleFileDrop(e.dataTransfer.files);
        }, false);

        // --- Drag & Drop: Playlist Sidebar ---
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            playlistSidebar.addEventListener(eventName, handleDragOver, false);
        });

        playlistSidebar.addEventListener('drop', (e) => {
            // Force playlist mode logic by ensuring playlist has items or treating drop as add
            // We can reuse handleFileDrop which adds to playlist if playlist.length > 0
            // But if empty, handleFileDrop plays directly. We want explicit add here.
            
            e.preventDefault();
            const files = Array.from(e.dataTransfer.files);
            const mediaFiles = files.filter(file => {
                const name = file.name.toLowerCase();
                return file.type.startsWith('video/') || file.type.startsWith('audio/') || 
                       name.match(/\.(mp4|webm|mkv|avi|mov|ts|wmv|mp3|wav|flac|m4a)$/i);
            });

            if (mediaFiles.length > 0) {
                mediaFiles.forEach(file => {
                    playlist.push({
                        file: file,
                        url: URL.createObjectURL(file),
                        name: file.name
                    });
                });
                renderPlaylist();
                showTemporaryAlert(`Added ${mediaFiles.length} files to queue.`, 'success');
                
                // If nothing playing, play first
                if (currentPlaylistIndex === -1) {
                    playPlaylistItem(0);
                }
            }
        }, false);

        // --- Playlist Logic ---
        playlistToggleBtn.addEventListener('click', () => {
            const isHidden = playlistSidebar.classList.contains('hidden');
            if (isHidden) {
                playlistSidebar.classList.remove('hidden');
                playlistSidebar.classList.add('flex');
            } else {
                playlistSidebar.classList.add('hidden');
                playlistSidebar.classList.remove('flex');
            }
        });

        function renderPlaylist() {
            playlistContainer.innerHTML = '';
            playlistCount.textContent = playlist.length;

            if (playlist.length === 0) {
                playlistContainer.innerHTML = `
                    <div class="text-center p-8 text-muted-foreground text-sm">
                        <i data-lucide="ghost" class="h-8 w-8 mx-auto mb-2 opacity-50"></i>
                        <p>Drop multiple files to create a queue</p>
                    </div>`;
                return;
            }

            playlist.forEach((item, index) => {
                const el = document.createElement('div');
                el.className = `flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors text-sm group ${index === currentPlaylistIndex ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-secondary'}`;
                
                // Securely create elements
                const iconDiv = document.createElement('div');
                iconDiv.className = 'shrink-0';
                iconDiv.innerHTML = index === currentPlaylistIndex 
                    ? '<i data-lucide="play" class="h-4 w-4 fill-current"></i>' 
                    : `<span class="text-muted-foreground text-xs w-4 inline-block text-center">${index + 1}</span>`;
                
                const nameDiv = document.createElement('div');
                nameDiv.className = 'min-w-0 flex-1';
                const nameP = document.createElement('p');
                nameP.className = 'truncate';
                nameP.textContent = item.name; // Secure Text Content
                nameDiv.appendChild(nameP);
                
                const delBtn = document.createElement('button');
                delBtn.className = 'opacity-0 group-hover:opacity-100 hover:text-destructive p-1';
                delBtn.innerHTML = '<i data-lucide="x" class="h-3 w-3"></i>';
                delBtn.onclick = (e) => window.removeFromPlaylist(e, index);
                
                el.appendChild(iconDiv);
                el.appendChild(nameDiv);
                el.appendChild(delBtn);

                el.onclick = (e) => {
                    if(!e.target.closest('button')) playPlaylistItem(index);
                };
                playlistContainer.appendChild(el);
            });
            lucide.createIcons({ root: playlistContainer });
        }

        function playPlaylistItem(index) {
            if (index < 0 || index >= playlist.length) return;
            currentPlaylistIndex = index;
            const item = playlist[index];
            loadMediaSource(item.url, item.name);
            // Explicitly play after loading source from playlist
            videoPlayer.play().catch(e => console.log('Autoplay blocked', e));
            renderPlaylist();
        }

        window.removeFromPlaylist = (e, index) => {
            e.stopPropagation();
            URL.revokeObjectURL(playlist[index].url);
            playlist.splice(index, 1);
            
            if (index === currentPlaylistIndex) {
                currentPlaylistIndex = -1; // Current playing removed
            } else if (index < currentPlaylistIndex) {
                currentPlaylistIndex--; // Shift index
            }
            renderPlaylist();
        };

        // Auto-play next logic based on Mode
        videoPlayer.addEventListener('ended', () => {
            if (playlist.length === 0) return;

            if (playbackMode === 'loop-one') {
                // Handled natively by video.loop = true, but strictly ensuring:
                videoPlayer.play(); 
            } else if (playbackMode === 'loop-all') {
                const nextIndex = (currentPlaylistIndex + 1) % playlist.length;
                playPlaylistItem(nextIndex);
            } else if (playbackMode === 'shuffle') {
                const randomIndex = Math.floor(Math.random() * playlist.length);
                playPlaylistItem(randomIndex);
            } else {
                // Normal
                if (currentPlaylistIndex < playlist.length - 1) {
                    playPlaylistItem(currentPlaylistIndex + 1);
                }
            }
        });

        // --- Keyboard Shortcuts & Feedback ---
        function showFeedback(iconName) {
            try {
                if (feedbackTimeout) clearTimeout(feedbackTimeout);

                // Map FA icons to Lucide
                const iconMap = {
                    'fa-play': 'play',
                    'fa-pause': 'pause',
                    'fa-backward': 'rewind',
                    'fa-forward': 'fast-forward',
                    'fa-volume-up': 'volume-2',
                    'fa-volume-down': 'volume-1',
                    'fa-volume-mute': 'volume-x'
                };

                const lucideName = iconMap[iconName] || 'activity';

                // Manually render SVG for performance/simplicity in this context
                // We use lucide.icons[Name].toSvg()
                // Convert kebab-case to PascalCase for the key
                const camelName = lucideName.split('-').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('');
                // Special cases
                let lucideKey = camelName;
                if (lucideName === 'volume-2') lucideKey = 'Volume2';
                if (lucideName === 'volume-1') lucideKey = 'Volume1';
                if (lucideName === 'volume-x') lucideKey = 'VolumeX';
                if (lucideName === 'fast-forward') lucideKey = 'FastForward';

                // Fallback
                if (!lucide.icons[lucideKey]) lucideKey = 'Play';

                // Safe check for API
                if (lucide.icons[lucideKey] && typeof lucide.icons[lucideKey].toSvg === 'function') {
                    indicatorIconWrapper.innerHTML = lucide.icons[lucideKey].toSvg({ class: "h-10 w-10 text-foreground" });
                    feedbackIndicator.style.opacity = '1';

                    feedbackTimeout = setTimeout(() => {
                        feedbackIndicator.style.opacity = '0';
                    }, 800);
                }
            } catch (err) {
                console.warn('Feedback Error:', err);
            }
        }

        function handleKeydown(e) {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
            if (videoPlayer.style.display === 'none') return;
            let handled = true;

            switch (e.key) {
                case ' ':
                    if (e.repeat) return;
                    videoPlayer.paused ? videoPlayer.play() : videoPlayer.pause();
                    break;
                case 'ArrowLeft':
                    videoPlayer.currentTime = Math.max(0, videoPlayer.currentTime - 5);
                    showFeedback('fa-backward');
                    break;
                case 'ArrowRight':
                    videoPlayer.currentTime = Math.min(videoPlayer.duration, videoPlayer.currentTime + 5);
                    showFeedback('fa-forward');
                    break;
                case 'ArrowUp':
                    videoPlayer.volume = Math.min(1, videoPlayer.volume + 0.1);
                    showFeedback('fa-volume-up');
                    break;
                case 'ArrowDown':
                    videoPlayer.volume = Math.max(0, videoPlayer.volume - 0.1);
                    showFeedback('fa-volume-down');
                    break;
                case 'm': case 'M':
                    if (e.repeat) return;
                    videoPlayer.muted = !videoPlayer.muted;
                    showFeedback(videoPlayer.muted ? 'fa-volume-mute' : 'fa-volume-up');
                    break;
                case 'f': case 'F':
                    if (e.repeat) return;
                    const container = videoPlayer.parentElement;
                    if (!document.fullscreenElement) container.requestFullscreen();
                    else document.exitFullscreen();
                    break;
                default: handled = false;
            }
            if (handled) e.preventDefault();
        }

        document.addEventListener('keydown', handleKeydown);
        videoPlayer.addEventListener('play', () => {
            initAudioVisualizer();
            showFeedback('fa-play');
        });
        videoPlayer.addEventListener('pause', () => showFeedback('fa-pause'));

        // --- Audio Visualizer Logic ---
        let dataArray;
        let bufferLength;

        function randomizeVisualizer() {
            const styles = ['bars', 'mirror', 'wave'];
            visualizerStyle = styles[Math.floor(Math.random() * styles.length)];
            visualizerHue = Math.floor(Math.random() * 360);
            visualizerSaturation = Math.floor(Math.random() * 40) + 60; // 60-100%
            visualizerLightness = Math.floor(Math.random() * 30) + 40; // 40-70%
            console.log(`Visualizer Mode: ${visualizerStyle}, Hue: ${visualizerHue}, Sat: ${visualizerSaturation}%, Light: ${visualizerLightness}%`);
        }

        function drawVisualizer() {
            if (videoPlayer.paused || videoPlayer.ended) {
                isVisualizerRunning = false;
                canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
                return;
            }
            requestAnimationFrame(drawVisualizer);
            isVisualizerRunning = true;

            if (analyser && dataArray) {
                if (visualizerStyle === 'wave') {
                    analyser.getByteTimeDomainData(dataArray);
                } else {
                    analyser.getByteFrequencyData(dataArray);
                }

                canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
                const width = canvas.width;
                const height = canvas.height;

                if (visualizerStyle === 'bars') {
                    const barWidth = (width / bufferLength) * 2.5;
                    let barHeight;
                    let x = 0;
                    for(let i = 0; i < bufferLength; i++) {
                        barHeight = (dataArray[i] / 255) * height;
                        canvasCtx.fillStyle = `hsla(${visualizerHue}, ${visualizerSaturation}%, ${visualizerLightness}%, ${(barHeight/height) + 0.2})`;
                        canvasCtx.fillRect(x, height - barHeight, barWidth, barHeight);
                        x += barWidth + 1;
                    }
                } else if (visualizerStyle === 'mirror') {
                    const barWidth = (width / bufferLength) * 2;
                    let barHeight;
                    let x = width / 2; // Start center
                    for(let i = 0; i < bufferLength; i++) {
                        barHeight = (dataArray[i] / 255) * (height / 1.5);
                        canvasCtx.fillStyle = `hsla(${visualizerHue}, ${visualizerSaturation}%, ${visualizerLightness}%, ${(barHeight/height) + 0.3})`;
                        
                        // Right side
                        canvasCtx.fillRect(width/2 + (i * barWidth), (height - barHeight)/2, barWidth, barHeight);
                        // Left side
                        canvasCtx.fillRect(width/2 - (i * barWidth) - barWidth, (height - barHeight)/2, barWidth, barHeight);
                    }
                } else if (visualizerStyle === 'wave') {
                    canvasCtx.lineWidth = 2;
                    canvasCtx.strokeStyle = `hsla(${visualizerHue}, ${visualizerSaturation}%, ${visualizerLightness}%, 0.8)`;
                    canvasCtx.beginPath();
                    const sliceWidth = width * 1.0 / bufferLength;
                    let x = 0;
                    for(let i = 0; i < bufferLength; i++) {
                        const v = dataArray[i] / 128.0;
                        const y = v * height / 2;
                        if(i === 0) canvasCtx.moveTo(x, y);
                        else canvasCtx.lineTo(x, y);
                        x += sliceWidth;
                    }
                    canvasCtx.lineTo(canvas.width, canvas.height/2);
                    canvasCtx.stroke();
                }
            }
        }

        function initAudioVisualizer() {
            // Only run if audio file
            if (!isAudioFile) return;

            if (!audioCtx) {
                try {
                    const AudioContext = window.AudioContext || window.webkitAudioContext;
                    audioCtx = new AudioContext();
                    analyser = audioCtx.createAnalyser();
                    audioSource = audioCtx.createMediaElementSource(videoPlayer);
                    audioSource.connect(analyser);
                    analyser.connect(audioCtx.destination);
                    
                    analyser.fftSize = 256;
                    bufferLength = analyser.frequencyBinCount;
                    dataArray = new Uint8Array(bufferLength);
                    
                    canvas.width = canvas.offsetWidth;
                    canvas.height = canvas.offsetHeight;
                } catch (e) {
                    console.warn("Audio Context init failed:", e);
                    return;
                }
            }

            // Resume context if suspended (Autoplay Policy)
            if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            }
            
            // Restart loop if not running
            if (!isVisualizerRunning && !videoPlayer.paused) {
                drawVisualizer();
            }
        }
        
        // Handle Resize for Canvas
        window.addEventListener('resize', () => {
             if(canvas) {
                 canvas.width = canvas.offsetWidth;
                 canvas.height = canvas.offsetHeight;
             }
        });

        // --- Video Filter Logic ---
        function applyVideoFilters() {
            const b = videoBrightnessInput.value;
            const c = videoContrastInput.value;
            const s = videoSaturationInput.value;

            videoPlayer.style.filter = `brightness(${b}%) contrast(${c}%) saturate(${s}%)`;
            
            valBrightness.textContent = b + '%';
            valContrast.textContent = c + '%';
            valSaturation.textContent = s + '%';
        }

        [videoBrightnessInput, videoContrastInput, videoSaturationInput].forEach(input => {
            input.addEventListener('input', applyVideoFilters);
        });

        // --- Reset Settings Logic ---
        resetSettingsBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to reset all settings?')) {
                localStorage.removeItem(SUB_SETTINGS_KEY);
                loadSubtitleSettings(); // Reloads defaults
                
                // Reset Video Filters
                videoBrightnessInput.value = 100;
                videoContrastInput.value = 100;
                videoSaturationInput.value = 100;
                applyVideoFilters();

                showTemporaryAlert('Settings reset to defaults.', 'success');
            }
        });

        // --- Help Modal Logic ---
        function toggleHelpModal() {
            const isHidden = helpModal.classList.contains('hidden');
            if (isHidden) {
                helpModal.classList.remove('hidden');
                helpModal.classList.add('flex');
            } else {
                helpModal.classList.add('hidden');
                helpModal.classList.remove('flex');
            }
        }

        helpBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleHelpModal();
        });

        closeHelpBtn.addEventListener('click', toggleHelpModal);

        // Close modal when clicking outside
        helpModal.addEventListener('click', (e) => {
            if (e.target === helpModal) {
                toggleHelpModal();
            }
        });

        loadSubtitleSettings();
        setPlayerMode('video');

        // Show welcome toast
        setTimeout(() => {
            showTemporaryAlert('Ready to load content. Drag and drop a file!', 'info');
        }, 500);

        // --- Service Worker Registration ---
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js').then(registration => {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                }, err => {
                    console.log('ServiceWorker registration failed: ', err);
                });
            });
        }