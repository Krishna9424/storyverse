import { useRef, useState, useEffect } from "react";
import {
  addDoc,
  collection,
  serverTimestamp,
  onSnapshot,
  query,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { auth, db, storage } from "../firebase/config";
import { useNavigate } from "react-router-dom";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import "../Styles/darkBookEditor.css";

const MAX_CHARS = 900;

export default function DarkBookEditor() {
  const navigate = useNavigate();

  const textareaRef = useRef(null);
  const musicRef = useRef(new Audio());
  const panelRef = useRef(null);

  const [pages, setPages] = useState([{ id: 1, content: "" }]);
  const [page, setPage] = useState(0);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");

  const [panel, setPanel] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [musicOn, setMusicOn] = useState(false);
  const [theme, setTheme] = useState("classic");
useEffect(() => {
  document.body.style.background = "#05060a";
  document.body.style.overflow = "hidden";

  return () => {
    document.body.style.overflow = "auto";
  };
}, []);


  /* ================= WRITE ================= */

  const handleWrite = (text) => {
    setPages(prev => {
      const updated = [...prev];

      if (text.length > MAX_CHARS) {
        const overflow = text.slice(MAX_CHARS);
        updated[page] = { ...updated[page], content: text.slice(0, MAX_CHARS) };

        if (!updated[page + 1]) {
          updated.push({ id: Date.now(), content: overflow });
        } else {
          updated[page + 1] = {
            ...updated[page + 1],
            content: overflow + updated[page + 1].content,
          };
        }

        setTimeout(() => setPage(p => p + 1), 0);
      } else {
        updated[page] = { ...updated[page], content: text };
      }

      return updated;
    });
  };

  /* ================= ADD PAGE ================= */

  const addPage = () => {
    setPages(prev => {
      const updated = [...prev];
      updated.splice(page + 1, 0, { id: Date.now(), content: "" });
      return updated;
    });
    setPage(p => p + 1);
  };

  /* ================= FIRESTORE MUSIC ================= */

  useEffect(() => {
    const q = query(collection(db, "music"));
    const unsub = onSnapshot(q, snap => {
      setTracks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const uploadMusic = async (file) => {
    if (!file) return;

    const path = `music/${Date.now()}_${file.name}`;
    const fileRef = ref(storage, path);

    await uploadBytes(fileRef, file);
    const url = await getDownloadURL(fileRef);

    await addDoc(collection(db, "music"), {
      name: file.name,
      url,
      path,
      createdAt: serverTimestamp(),
    });
  };

  /* ================= MUSIC PLAYER ================= */

  const playTrack = (track) => {
    const audio = musicRef.current;

    if (audio.src !== track.url) {
      audio.pause();
      audio.src = track.url;
      audio.load();
    }

    audio.play().catch(() => {});
    setCurrentTrack(track.id);
    setMusicOn(true);
  };

  const toggleMusic = () => {
    const audio = musicRef.current;
    if (!audio.src) return alert("Select a track first");

    if (audio.paused) {
      audio.play().catch(() => {});
      setMusicOn(true);
    } else {
      audio.pause();
      setMusicOn(false);
    }
  };

  const deleteTrack = async (track) => {
    try {
      const audio = musicRef.current;

      if (currentTrack === track.id) {
        audio.pause();
        audio.src = "";
        setCurrentTrack(null);
        setMusicOn(false);
      }

      await deleteObject(ref(storage, track.path));
      await deleteDoc(doc(db, "music", track.id));
    } catch {
      alert("Delete failed");
    }
  };

  /* ================= AUTO FOCUS ================= */

  useEffect(() => {
    textareaRef.current?.focus();
  }, [page]);

  /* ================= CLOSE PANEL OUTSIDE CLICK ================= */

  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setPanel(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ================= PUBLISH ================= */

const publish = async () => {

  if (!auth.currentUser) return alert("Login first");
  if (!title.trim()) return alert("Enter story title");

  // 🔥 GET REAL USER PROFILE
  const userSnap = await getDoc(doc(db,"users",auth.currentUser.uid));
  const userData = userSnap.exists() ? userSnap.data() : {};

  await addDoc(collection(db, "stories"), {
    title: title.trim(),
    pages: pages ?? [],
    likesCount: 0,

    authorId: auth.currentUser.uid,
    authorName: userData?.name || "User",
    authorPhoto: userData?.photoURL || "",

    isPublic: true,
    createdAt: serverTimestamp(),
  });

  alert("Story published ✨");
  navigate("/stories");
};




  /* ================= UI ================= */

  return (
    <div className="editor-shell">

      <div className="editor-top">
        <span className="back" onClick={() => navigate("/")}>← Home</span>
        <span className="page-count">Page {page + 1} / {pages.length}</span>
        <button className="publish" onClick={publish}>Publish</button>
      </div>

      <input
        className="title-input"
        placeholder="Story title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <div className={`book ${theme}`}>
        <textarea
          ref={textareaRef}
          value={pages[page].content}
          onChange={(e) => handleWrite(e.target.value)}
          spellCheck={false}
        />
      </div>

      <div className="editor-controls">
        <div className="nav-arrows">
          <div className={`arrow ${page===0?"disabled":""}`} onClick={()=>page>0&&setPage(p=>p-1)}>←</div>
          <div className={`arrow ${page===pages.length-1?"disabled":""}`} onClick={()=>page<pages.length-1&&setPage(p=>p+1)}>→</div>
        </div>

        <button onClick={addPage}>＋ Page</button>
        <button onClick={()=>setPanel(panel==="notes"?null:"notes")}>📝</button>
        <button onClick={()=>setPanel(panel==="music"?null:"music")}>🎵</button>
        <button onClick={()=>setPanel(panel==="theme"?null:"theme")}>🎨</button>
      </div>

      {panel==="notes" && (
        <div className="floating-panel notes-panel" ref={panelRef}>
          <textarea
            placeholder="Write your thoughts..."
            value={notes}
            onChange={(e)=>setNotes(e.target.value)}
          />
        </div>
      )}

      {panel==="theme" && (
        <div className="floating-panel theme-panel" ref={panelRef}>
          {["classic","vintage","night","fantasy","horror"].map(t=>(
            <div key={t} className={`theme-card ${t} ${theme===t?"selected":""}`} onClick={()=>setTheme(t)}>
              <span>{t}</span>
            </div>
          ))}
        </div>
      )}

      {panel==="music" && (
        <div className="floating-panel music-panel" ref={panelRef}>
          <div className="music-header">
            <span>Background Music</span>
            <button onClick={toggleMusic}>{musicOn?"Pause":"Play"}</button>
          </div>

          <input type="file" accept="audio/*" onChange={(e)=>uploadMusic(e.target.files[0])}/>

          <div className="music-list">
            {tracks.map(track=>(
              <div key={track.id} className={`track ${currentTrack===track.id?"playing":""}`}>
                <span onClick={()=>playTrack(track)}>{track.name}</span>
                <button onClick={()=>deleteTrack(track)}>✕</button>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
  
}
