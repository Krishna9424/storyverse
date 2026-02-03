import { useEffect, useRef, useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase/config"; // adjust path
import { useNavigate } from "react-router-dom";
import "../Styles/classicEditor.css";

const MAX_CHARS = 900;

export default function ClassicEditor() {
  const textareaRef = useRef(null);
  const navigate = useNavigate();

  const [view, setView] = useState("write"); // write | preview
  const [pageView, setPageView] = useState("intro"); // intro | story
  const [pages, setPages] = useState([{ id: 1, content: "" }]);
  const [currentPage, setCurrentPage] = useState(0);

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [intro, setIntro] = useState("");

  const [textColor, setTextColor] = useState("#eaeaea");
  const [pageBg, setPageBg] = useState("#141418");
  const [bgImage, setBgImage] = useState("");

  /* ===== LOAD ===== */
  useEffect(() => {
    const d = JSON.parse(localStorage.getItem("book-editor-v3"));
    if (d) {
      setPages(d.pages || [{ id: 1, content: "" }]);
      setCurrentPage(d.currentPage || 0);
      setTitle(d.title || "");
      setSubtitle(d.subtitle || "");
      setIntro(d.intro || "");
      setTextColor(d.textColor || "#eaeaea");
      setPageBg(d.pageBg || "#141418");
      setBgImage(d.bgImage || "");
    }
  }, []);

  /* ===== SAVE ===== */
  useEffect(() => {
    localStorage.setItem(
      "book-editor-v3",
      JSON.stringify({
        pages,
        currentPage,
        title,
        subtitle,
        intro,
        textColor,
        pageBg,
        bgImage,
      })
    );
  }, [pages, currentPage, title, subtitle, intro, textColor, pageBg, bgImage]);

  /* ===== WRITE HANDLER ===== */
  const handleWrite = (value) => {
    const updated = [...pages];
    updated[currentPage].content = value;

    if (value.length > MAX_CHARS) {
      const overflow = value.slice(MAX_CHARS);
      updated[currentPage].content = value.slice(0, MAX_CHARS);

      if (!updated[currentPage + 1]) {
        updated.push({ id: updated.length + 1, content: overflow });
      }
      setPages(updated);
      setCurrentPage(currentPage + 1);
    } else {
      setPages(updated);
    }
  };

  /* ===== PAGE CONTROLS ===== */
  const addPage = () => {
    const updated = [...pages];
    updated.splice(currentPage + 1, 0, {
      id: updated.length + 1,
      content: "",
    });
    setPages(updated);
    setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  };

  const nextPage = () => {
    if (currentPage < pages.length - 1) setCurrentPage(currentPage + 1);
  };

  /* ===== PREVIEW ===== */
  const renderPreview = (text) => ({
    __html: text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/^> (.*)$/gm, "<blockquote>$1</blockquote>")
      .replace(/---/g, "<hr/>")
      .replace(/\n/g, "<br/>"),
  });
console.log("CURRENT USER:", auth.currentUser);

  /* ===== PUBLISH TO FIRESTORE ===== */
  const handlePublish = async () => {
    try {
      const user = auth.currentUser;

      if (!user) {
        alert("Login first bro 😅");
        return;
      }

      await addDoc(collection(db, "stories"), {
        uid: user.uid,
        authorId: user.uid,
        authorName: user.displayName || "Anonymous",
        title,
        subtitle,
        intro,
        pages,
        cover: "", // optional cover image
        isPublic: true, // 👈 required for Stories.jsx
        likes: 0,
        savedBy: [],
        createdAt: serverTimestamp(),
      });

      alert("Story published to Firebase 🚀🔥");
      navigate("/"); // redirect to homepage

    } catch (err) {
      console.error(err);
      alert("Publish failed 😭");
    }
  };

  return (
    <div className="editor-wrapper">
      {/* TOP BAR */}
      <div className="editor-top">
        <span>
          Page {currentPage + 1} / {pages.length}
        </span>

        <div className="top-actions">
          <button onClick={() => setView("write")}>Write</button>
          <button onClick={() => setView("preview")}>Preview</button>
        </div>
      </div>

      {/* TOOLS */}
      {pageView === "story" && view === "write" && (
        <div className="editor-tools">
          <label>
            Text
            <input
              type="color"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
            />
          </label>

          <label>
            Page
            <input
              type="color"
              value={pageBg}
              onChange={(e) => setPageBg(e.target.value)}
            />
          </label>

          <button onClick={addPage}>＋ Page</button>

          <button className="publish-top" onClick={handlePublish}>
           Publish
          </button>
        </div>
      )}

      {/* PAGE */}
     <div
  className="page"
  style={{
    backgroundColor: pageBg,
    backgroundImage: bgImage ? `url(${bgImage})` : undefined,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    color: textColor,
  }}
>

        {pageView === "intro" && (
          <>
            <input
              className="book-title"
              placeholder="Book Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <input
              className="book-subtitle"
              placeholder="Subtitle"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
            />
            <textarea
              className="book-intro"
              placeholder="Intro page"
              value={intro}
              onChange={(e) => setIntro(e.target.value)}
            />
            <button onClick={() => setPageView("story")}>
              Start Writing →
            </button>
          </>
        )}

        {pageView === "story" && view === "write" && (
          <textarea
            ref={textareaRef}
            className="book-content"
            value={pages[currentPage].content}
            onChange={(e) => handleWrite(e.target.value)}
            spellCheck={false}
          />
        )}

        {pageView === "story" && view === "preview" && (
          <div
            className="preview"
            dangerouslySetInnerHTML={renderPreview(
              pages[currentPage].content
            )}
          />
        )}
      </div>

      {pageView === "story" && (
        <div className="page-nav">
          <button onClick={prevPage}>← Previous</button>
          <button onClick={nextPage}>Next →</button>
        </div>
      )}
    </div>
  );
}
