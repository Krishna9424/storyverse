import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { db, auth } from "../firebase/config";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import "../Styles/editor.css";

export default function WriteEditor() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const format = params.get("format") || "book";

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const publishStory = async () => {
    if (!title.trim() || !content.trim()) {
      alert("Title and content required");
      return;
    }

    setLoading(true);

    try {
      await addDoc(collection(db, "stories"), {
        title: title.trim(),
        content: content.trim(), // ✅ ONLY STORY TEXT
        format,
        authorId: auth.currentUser.uid,
        authorName: auth.currentUser.displayName || "Unknown",
        isPublic: true,
        likesCount: 0,
        createdAt: serverTimestamp(),
      });

      navigate("/stories");
    } catch (err) {
      console.error("Publish failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <input
        placeholder="Story title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ width: "100%", padding: 12, marginBottom: 12 }}
      />

      <textarea
        placeholder="Start writing your story here..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        style={{ width: "100%", height: 300, padding: 12 }}
      />

      <button
        onClick={publishStory}
        disabled={loading}
        style={{ marginTop: 16 }}
      >
        {loading ? "Publishing..." : "Publish"}
      </button>
    </div>
  );
}
