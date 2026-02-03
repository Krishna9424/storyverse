import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/WritingStudio-t.css";

export default function WritingStudio() {
  const navigate = useNavigate();
  const [selectedFormat, setSelectedFormat] = useState("book");

  const formats = [
    {
      key: "book",
      title: "Classic Book",
      desc: "Chapters. Pages. Silence.",
      icon: "📖",
    },
    {
      key: "dark",
      title: "Dark Cinematic",
      desc: "Let pauses speak louder than words.",
      icon: "🌙",
    },
    {
      key: "diary",
      title: "Diary / Notes",
      desc: "Thoughts that were never meant to be shared.",
      icon: "💬",
    },
    {
      key: "voice",
      title: "Voice Experience",
      desc: "Stories meant to be heard.",
      icon: "🎧",
    },
    {
      key: "experimental",
      title: "Experimental",
      desc: "When reality breaks between lines.",
      icon: "🧠",
    },
  ];

  return (
    <div className="studio-wrapper">
      {/* TOP BAR */}
      <div className="studio-top">
        <span className="back" onClick={() => navigate(-1)}>
          ← Back
        </span>
        <span className="draft">Draft ready</span>
      </div>

      {/* CENTER HERO */}
      <div className="studio-center">
        <h1>
          This is not a post. <br />
          This is a book in the making.
        </h1>
        <p>
          Write slowly. Write honestly. <br />
          Your words don’t need to rush.
        </p>
      </div>

      {/* FORMAT SELECTOR */}
      <div className="format-section">
        {formats.map((f) => (
          <div
            key={f.key}
            className={`format-card ${
              selectedFormat === f.key ? "active" : ""
            }`}
            onClick={() => setSelectedFormat(f.key)}
          >
            <div className="icon">{f.icon}</div>
            <h3>{f.title}</h3>
            <span>{f.desc}</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="studio-cta">
        <button
          onClick={() =>
            navigate(`/write/editor?format=${selectedFormat}`)
          }
        >
          Start Writing
        </button>
      </div>
    </div>
  );
}
