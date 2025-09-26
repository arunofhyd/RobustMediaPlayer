# 🎬 Robust Media Player  

A simple, single-file **HTML media player** designed for flexibility and local subtitle synchronization.  
This application allows you to load media from **direct file links**, **local files (via upload or drag-and-drop)**, or **external embed links**, while offering **automatic SRT-to-VTT conversion** for subtitles.  

---

## 🌟 Features  

- **Dual-Mode Playback**  
  - Automatically switches between the powerful HTML5 `<video>` element (for local and direct files) and an `<iframe>` (for external embed links like Streamtape).  

- **Local Subtitle Synchronization**  
  - Load local subtitle files (`.vtt` or `.srt`) and sync them with media played in HTML5 mode.  
  - Includes automatic **SRT → VTT conversion**.  

- **Drag-and-Drop Support**  
  - Drag and drop media or subtitle files directly onto the player area.  

- **Modern UI & Theme Toggle**  
  - Clean, professional, and fully responsive design.  
  - Seamless **Dark/Light Mode** switch.  

- **Robust Error Handling**  
  - Clear, color-coded alerts for:  
    - ✅ Success  
    - ⚠️ Warnings (e.g., cross-domain issues)  
    - ❌ Critical errors  

- **Memory Management**  
  - Efficient cleanup with `URL.revokeObjectURL()` for local files.  

- **Single-File Deployment**  
  - Everything (HTML, CSS, JavaScript) is contained in **one lightweight `index.html`** file.  

---

## 🚀 Usage  

1. **Download / Clone** this repository.  
2. Open `index.html` in your browser.  
3. Load media by:  
   - Dragging & dropping a video file  
   - Entering a direct media file URL  
   - Embedding an external link (e.g., Streamtape)  
4. Optionally load a subtitle file (`.vtt` or `.srt`).  

---

## 📂 Project Structure  

