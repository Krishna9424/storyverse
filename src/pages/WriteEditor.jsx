import { useEffect, useRef, useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase/config";
import { useNavigate } from "react-router-dom";
import "../Styles/editor.css";

const MAX_CHARS = 900;

export default function ClassicEditor() {
  const textareaRef = useRef(null);
  const navigate = useNavigate();

  const [mode, setMode] = useState("write"); // write | preview
  const [pages, setPages] = useState([{ id: 1, content: "" }]);
  const [currentPage, setCurrentPage] = useState(0);

  const [title, setTitle] = useState("");
  const [intro, setIntro] = useState("");
  const [textColor, setTextColor] = useState("#eaeaea");
  const [pageBg, setPageBg] = useState("#141418");

  /* ===== WRITE ===== */
  const handleWrite = (value) => {
    const updated = [...pages];
    updated[currentPage].content = value;
    setPages(updated);
  };

  /* ===== PAGE ===== */
  const addPage = () => {
    setPages([...pages, { id: Date.now(), content: "" }]);
    setCurrentPage(pages.length);
  };

  const wrap = (before, after = before) => {
    const ta = textareaRef.current;
    if (!ta) return;

    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    if (start === end) return;

    const text = ta.value;
    const selected = text.slice(start, end);

    const updated =
      text.slice(0, start) +
      before +
      selected +
      after +
      text.slice(end);

    handleWrite(updated);

    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(
        start + before.length,
        end + before.length
      );
    }, 0);
  };

  /* ===== PREVIEW ===== */
  const renderPreview = (text) => ({
    __html: text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/^# (.*)$/gm, "<h1>$1</h1>")
      .replace(/^> (.*)$/gm, "<blockquote>$1</blockquote>")
      .replace(/\n/g, "<br/>"),
  });

  return (
    <div className="editor-root">
      {/* TOP */}
      <div className="editor-top">
        <button onClick={() => setMode("write")}>Write</button>
        <button onClick={() => setMode("preview")}>Preview</button>
      </div>

      {/* TOOLS */}
      <div className="editor-tools">
        <button onClick={() => wrap("**")}>Bold</button>
        <button onClick={() => wrap("*")}>Italic</button>
        <button onClick={() => wrap("\n# ", "\n")}>H1</button>
        <button onClick={() => wrap("\n> ", "\n")}>Quote</button>

        <input
          type="color"
          value={textColor}
          onChange={(e) => setTextColor(e.target.value)}
        />
        <input
          type="color"
          value={pageBg}
          onChange={(e) => setPageBg(e.target.value)}
        />
      </div>

      {/* PAGE */}
      <div
        className="editor-page"
        style={{ backgroundColor: pageBg, color: textColor }}
      >
        <input
          className="editor-title"
          placeholder="Story title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {mode === "write" && (
          <textarea
            ref={textareaRef}
            className="editor-textarea"
            value={pages[currentPage].content}
            onChange={(e) => handleWrite(e.target.value)}
          />
        )}

        {mode === "preview" && (
          <div
            className="editor-preview"
            dangerouslySetInnerHTML={renderPreview(
              pages[currentPage].content
            )}
          />
        )}
      </div>

      {/* NAV */}
      <div className="editor-nav">
        <button
          disabled={currentPage === 0}
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          ← Prev
        </button>
        <button onClick={addPage}>＋ Page</button>
        <button
          disabled={currentPage === pages.length - 1}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          Next →
        </button>
      </div>
    </div>
  );
}
