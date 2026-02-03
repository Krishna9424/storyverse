import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db, auth } from "../firebase/config";
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  updateDoc,
  increment,
} from "firebase/firestore";
import "../Styles/Story.css";

export default function Story() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [story, setStory] = useState(null);
  const [page, setPage] = useState(0);
  const [liked, setLiked] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  /* ================= FETCH STORY ================= */
  useEffect(() => {
    const fetchStory = async () => {
      try {
        const ref = doc(db, "stories", id);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setStory(snap.data());
        } else {
          setStory(null);
        }
      } catch (err) {
        console.error(err);
        setStory(null);
      }
    };
    fetchStory();
  }, [id]);

  /* ================= LIKE STATE ================= */
  useEffect(() => {
    if (!auth.currentUser) return;

    const ref = doc(db, "likes", `${auth.currentUser.uid}_${id}`);
    getDoc(ref).then((snap) => setLiked(snap.exists()));
  }, [id]);

  /* ================= GUARD ================= */
  if (!story) {
    return <p style={{ padding: 40 }}>Loading story…</p>;
  }

  /* ================= CONTENT NORMALIZATION ================= */
  const rawContent =
    typeof story.content === "string"
      ? story.content
      : Array.isArray(story.pages)
      ? story.pages.map((p) => p.content || "").join("\n")
      : "";

  if (!rawContent.trim()) {
    return (
      <div style={{ padding: 40 }}>
        <p>This story has no readable content.</p>
        <button onClick={() => navigate("/stories")}>
          Back to stories
        </button>
      </div>
    );
  }

  /* ================= PAGE LOGIC ================= */
  const paragraphs = rawContent
    .split("\n")
    .filter((p) => p.trim());

  const PAGE_SIZE = 4;
  const pages = [];

  for (let i = 0; i < paragraphs.length; i += PAGE_SIZE) {
    pages.push(paragraphs.slice(i, i + PAGE_SIZE));
  }

  /* ================= LIKE TOGGLE ================= */
  const toggleLike = async () => {
    if (!auth.currentUser) return;

    const key = `${auth.currentUser.uid}_${id}`;
    const ref = doc(db, "likes", key);

    if (liked) {
      await deleteDoc(ref);
      await updateDoc(doc(db, "stories", id), {
        likesCount: increment(-1),
      });
    } else {
      await setDoc(ref, {
        userId: auth.currentUser.uid,
        storyId: id,
      });
      await updateDoc(doc(db, "stories", id), {
        likesCount: increment(1),
      });
    }

    setLiked(!liked);
    setMenuOpen(false);
  };

  /* ================= UI ================= */
  return (
    <div className="story-page">
      <button className="story-back" onClick={() => navigate("/stories")}>
        ← Back
      </button>

      <div className="story-content-page">
        {/* HEADER */}
        <div className="story-header">
          <h1 className="story-title">{story.title}</h1>

          <div className="story-meta-row">
            <div
              className="story-author"
              onClick={() => navigate(`/user/${story.authorId}`)}
            >
              ✍️ {story.authorName}
            </div>

            <div className="story-menu">
              <button
                className="menu-dots"
                onClick={() => setMenuOpen((p) => !p)}
              >
                ⋯
              </button>

              {menuOpen && (
                <div className="menu-dropdown">
                  <div onClick={toggleLike}>
                    {liked ? "❤️ Unlike" : "🤍 Like"}
                  </div>
                  <div>📌 Save</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* PAGE CONTENT */}
        <div className="story-page-view">
          {pages[page]?.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        {/* CONTROLS */}
        <div className="page-controls">
          <button
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
          >
            ← Prev
          </button>

          <span>
            Page {page + 1} / {pages.length}
          </span>

          <button
            disabled={page === pages.length - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
