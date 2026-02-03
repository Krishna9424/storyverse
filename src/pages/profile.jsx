import { useEffect, useState } from "react";
import { auth, db } from "../firebase/config";
import { updateProfile } from "firebase/auth";
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "../Styles/profile.css";

export default function Profile() {
  const navigate = useNavigate();

  /* =====================
     STATE
  ===================== */
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [role, setRole] = useState("reader");
  const [saving, setSaving] = useState(false);

  const [myStories, setMyStories] = useState([]);
  const [showStories, setShowStories] = useState(false);
  const [loadingStories, setLoadingStories] = useState(true);

  /* =====================
     FETCH PROFILE
  ===================== */
  useEffect(() => {
    const fetchProfile = async () => {
      if (!auth.currentUser) return;

      try {
        const ref = doc(db, "users", auth.currentUser.uid);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data();
          setName(data.name || "");
          setBio(data.bio || "");
          setRole(data.role || "reader");
        }
      } catch (err) {
        console.error("Failed to load profile", err);
      }
    };

    fetchProfile();
  }, []);

  /* =====================
     FETCH USER STORIES
  ===================== */
  useEffect(() => {
    const fetchMyStories = async () => {
      if (!auth.currentUser) return;

      try {
        const q = query(
          collection(db, "stories"),
          where("authorId", "==", auth.currentUser.uid)
        );

        const snapshot = await getDocs(q);
        const stories = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        setMyStories(stories);
      } catch (err) {
        console.error("Failed to load stories", err);
      } finally {
        setLoadingStories(false);
      }
    };

    fetchMyStories();
  }, []);

  /* =====================
     SAVE PROFILE
     (SYNC AUTH + USER + STORIES)
  ===================== */
  const saveProfile = async () => {
    if (!auth.currentUser) return;

    setSaving(true);

    try {
      // 1️⃣ Update user profile
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, { name, bio, role });

      // 2️⃣ Update Firebase Auth display name
      await updateProfile(auth.currentUser, {
        displayName: name,
      });

      // 3️⃣ Update all stories authorName
      const q = query(
        collection(db, "stories"),
        where("authorId", "==", auth.currentUser.uid)
      );

      const snap = await getDocs(q);
      const updates = snap.docs.map((d) =>
        updateDoc(doc(db, "stories", d.id), {
          authorName: name,
        })
      );

      await Promise.all(updates);

      navigate("/");
    } catch (err) {
      console.error("Failed to save profile", err);
    } finally {
      setSaving(false);
    }
  };

  /* =====================
     DELETE STORY
  ===================== */
  const handleDelete = async (storyId) => {
    const ok = window.confirm("Delete this story permanently?");
    if (!ok) return;

    try {
      await deleteDoc(doc(db, "stories", storyId));
      setMyStories((prev) => prev.filter((s) => s.id !== storyId));
    } catch (err) {
      console.error("Failed to delete story", err);
    }
  };

  /* =====================
     EDIT STORY
  ===================== */
  const handleEdit = (storyId) => {
    navigate(`/write/editor?edit=${storyId}`);
  };

  /* =====================
     UI
  ===================== */
  return (
    <div className="profile-wrapper">
      <div className="profile-card">
        {/* HEADER */}
        <div className="profile-header">
          <h2>Your space</h2>
          <p>This is how the world sees you.</p>
        </div>

        {/* NAME */}
        <div className="profile-field">
          <label>Your name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />
        </div>

        {/* BIO */}
        <div className="profile-field">
          <label>Your bio</label>
          <textarea
            placeholder="Why do you write? Or read?"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </div>

        {/* ROLE */}
        <div className="profile-field">
          <label>You are a</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="reader">Reader</option>
            <option value="writer">Writer</option>
          </select>

          <div className="profile-role">
            {role === "writer"
              ? "Writers can publish stories publicly."
              : "Readers can keep private notes."}
          </div>
        </div>

        {/* ACTIONS */}
        <div className="profile-actions">
          <button onClick={() => navigate("/")}>Cancel</button>
          <button onClick={saveProfile} disabled={saving}>
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>

        {/* MY STORIES TOGGLE */}
        {!loadingStories && myStories.length > 0 && (
          <button
            className="my-stories-toggle"
            onClick={() => setShowStories((p) => !p)}
          >
            {showStories ? "Hide stories" : "My stories"}
          </button>
        )}

        {/* MY STORIES LIST */}
        {showStories && myStories.length > 0 && (
          <div className="my-stories">
            <h3>Your stories</h3>

            {myStories.map((story) => (
              <div key={story.id} className="story-item">
                <div className="story-title">
                  {story.title || "Untitled story"}
                </div>

                <p className="story-preview">
                  {(story.content || "")
                    .replace(/<[^>]+>/g, "")
                    .slice(0, 80)}
                  ...
                </p>

                <div className="story-actions">
                  <button onClick={() => handleEdit(story.id)}>Edit</button>
                  <button
                    className="danger"
                    onClick={() => handleDelete(story.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* NO STORIES */}
        {!loadingStories && myStories.length === 0 && (
          <p className="no-stories">You haven’t written any stories yet.</p>
        )}
      </div>
    </div>
  );
}
