import "../Styles/reels.css";


export default function Reels() {
  return (
    <div className="reel-screen">

      {/* TOP BAR */}
      <div className="top-bar">
        <button className="back-btn">←</button>

        <div className="theme-switch">
          <select>
            <option>Dark</option>
            <option>Romantic</option>
            <option>Pain</option>
            <option>Philosophy</option>
            <option>Motivation</option>
            <option>Midnight</option>
          </select>
        </div>
      </div>

      {/* AUTHOR */}
      <div className="author-box">
        <div className="author-name">
          Aarav <span className="verify">✔</span>
        </div>
        <div className="followers">12.4K followers</div>
      </div>

      {/* CENTER CONTENT */}
      <div className="content-area">
        <p className="quote">
          Some nights the silence talks more than people ever did.
        </p>
      </div>

      {/* RIGHT ACTION BAR */}
      <div className="action-bar">
        <button>♥</button>
        <button>💬</button>
        <button>🔖</button>
        <button>↗</button>
      </div>

      {/* BOTTOM REACTIONS */}
      <div className="reaction-bar">
        <span>Relatable</span>
        <span>Deep</span>
        <span>Hurt</span>
        <span>Healing</span>
      </div>

      {/* COMMENT INPUT */}
      <div className="comment-box">
        <input placeholder="Write what you felt..." />
      </div>

    </div>
  );
}
