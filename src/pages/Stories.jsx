import { useEffect, useState } from "react";
import { db, auth } from "../firebase/config";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  increment,
  getDoc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "../Styles/Stories.css";


export default function Stories() {
  const navigate = useNavigate();
 const handleBack = () => {
    navigate("/");
  };
  const [stories, setStories] = useState([]);
  const [activeMenu, setActiveMenu] = useState(null);
  const [tab, setTab] = useState("all"); // all | liked

  /* ================= FETCH STORIES ================= */
  useEffect(() => {
    const fetchStories = async () => {
      const q = query(
        collection(db, "stories"),
        where("isPublic", "==", true)
      );

      const snap = await getDocs(q);

      const data = await Promise.all(
        snap.docs.map(async (d) => {
          const story = { id: d.id, ...d.data(), likedByMe: false };

          if (auth.currentUser) {
            const likeRef = doc(
              db,
              "likes",
              `${auth.currentUser.uid}_${d.id}`
            );
            const likeSnap = await getDoc(likeRef);
            story.likedByMe = likeSnap.exists();
          }

          return story;
        })
      );

      setStories(data);
    };

    fetchStories();
  }, []);

  /* ================= LIKE STORY ================= */
  const likeStory = async (storyId) => {
    if (!auth.currentUser) return;

    const key = `${auth.currentUser.uid}_${storyId}`;
    const ref = doc(db, "likes", key);

    await setDoc(ref, {
      userId: auth.currentUser.uid,
      storyId,
    });

    await updateDoc(doc(db, "stories", storyId), {
      likesCount: increment(1),
    });

    setStories((prev) =>
      prev.map((s) =>
        s.id === storyId ? { ...s, likedByMe: true } : s
      )
    );

    setActiveMenu(null);
  };

  /* ================= FILTER ================= */
  const visibleStories =
    tab === "liked"
      ? stories.filter((s) => s.likedByMe)
      : stories;

  /* ================= UI ================= */
  return (
    <div className="stories-wrapper">
      {/* TOP TABS */}
      <div className="stories-tabs">
        <button
          className={tab === "all" ? "active" : ""}
          onClick={() => setTab("all")}
        >
          📚 All Stories
        </button>

        <button
          className={tab === "liked" ? "active" : ""}
          onClick={() => setTab("liked")}
        >
          ❤️ Liked
        </button>
      </div>

      {/* GRID */}
      <div className="stories-grid">
        {visibleStories.map((story) => (
          <div
            key={story.id}
            className="book-card"
            onClick={() => navigate(`/story/${story.id}`)}
          >
            {/* HEADER */}
            <div className="card-header">
              <div>
                <h4 className="card-title">{story.title}</h4>
                <span
                  className="card-author"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/user/${story.authorId}`);
                  }}
                >
                  by {story.authorName}
                </span>
              </div>

              <button
                className="menu-dots"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveMenu(
                    activeMenu === story.id ? null : story.id
                  );
                }}
              >
                ⋯
              </button>

              {activeMenu === story.id && (
                <div
                  className="menu-dropdown"
                  onClick={(e) => e.stopPropagation()}
                >
                  {!story.likedByMe && (
                    <div onClick={() => likeStory(story.id)}>
                      ❤️ Like
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* BOOK BODY */}
            <div className="book-cover" />
          </div>
        ))}
      </div>
    </div>
  );
}
