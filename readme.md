Robust Media Player
A simple, single-file HTML media player designed for flexibility and local subtitle synchronization. This application allows users to load media either from direct file links, local files (via upload or drag-and-drop), or external embed links, while offering automatic SRT-to-VTT conversion for subtitles.

🌟 Key Features
Dual-Mode Playback: Automatically switches between the powerful HTML5 <video> element (for local and direct files) and an <iframe> (for external embed links like Streamtape).

Local Subtitle Synchronization: Easily load local subtitle files (.vtt or .srt) and synchronize them with media played in HTML5 mode. Includes automatic SRT-to-VTT conversion.

Drag-and-Drop Support: Quickly load media and subtitle files by simply dragging them onto the player area.

Modern UI & Theme Toggle: Features a clean, professional, and fully responsive design with a seamless Dark/Light Mode switch.

Robust Error Handling: Provides clear, color-coded alerts for successes, warnings (like cross-domain issues), and critical errors.

Memory Management: Implements efficient memory cleanup using URL.revokeObjectURL() for local files.

Single-File Deployment: Everything (HTML, CSS, JavaScript) is contained within one lightweight index.html file.
