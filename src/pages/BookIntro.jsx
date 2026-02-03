import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase/config";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

const GENRES = [
  "Love",
  "Dark Romance",
  "Thriller",
  "Psychological",
  "Horror",
  "Motivation",
  "Poetry",
  "Sci-Fi",
];

export default function BookIntro() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [genre, setGenre] = useState("Love");
  const [intro, setIntro] = useState("");

  const handleContinue = async () => {
    const bookRef = doc(db, "books", crypto.randomUUID());

    await setDoc(bookRef, {
      title,
      subtitle,
      genre,
      intro,
      authorId: auth.currentUser.uid,
      authorName: auth.currentUser.displayName || "Unknown",
      status: "draft",
      createdAt: serverTimestamp(),
    });

    navigate(`/write/editor?bookId=${bookRef.id}`);
  };

  return (
    <div className="intro-wrapper">
      <h1>Book Details</h1>

      <input
        placeholder="Book Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <input
        placeholder="Subtitle / Tagline"
        value={subtitle}
        onChange={(e) => setSubtitle(e.target.value)}
      />

      <select value={genre} onChange={(e) => setGenre(e.target.value)}>
        {GENRES.map((g) => (
          <option key={g}>{g}</option>
        ))}
      </select>

      <textarea
        placeholder="Short introduction for readers..."
        value={intro}
        onChange={(e) => setIntro(e.target.value)}
      />

      <button onClick={handleContinue}>Continue Writing</button>
    </div>
  );
}
