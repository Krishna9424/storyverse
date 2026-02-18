import { useEffect, useState, useRef, useCallback } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  runTransaction,
  orderBy,
  limit,
  startAfter
} from "firebase/firestore";
import { db, auth } from "../../../firebase/config";
import { useNavigate } from "react-router-dom";

import StoriesPage from "./StoriesPage";
import "../../../Styles/Stories.css";

export default function Stories() {

  const navigate = useNavigate();

  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [liking, setLiking] = useState({});

  const observer = useRef();

  /* ================= FETCH STORIES ================= */

  const fetchStories = async (initial = false) => {

    if (loading) return;
    setLoading(true);

    try {
      let q;

      if (initial) {
        q = query(
          collection(db, "stories"),
          where("isPublic", "==", true),
          orderBy("createdAt", "desc"),
          limit(6)
        );
      } else {
        if (!lastDoc) {
          setLoading(false);
          return;
        }

        q = query(
          collection(db, "stories"),
          where("isPublic", "==", true),
          orderBy("createdAt", "desc"),
          startAfter(lastDoc),
          limit(6)
        );
      }

      const snap = await getDocs(q);

      if (snap.empty) {
        setHasMore(false);
        setLoading(false);
        return;
      }

      const docs = snap.docs;
      setLastDoc(docs[docs.length - 1]);

      /* ===== CHECK LIKES ===== */

      let likedMap = {};

      if (auth.currentUser) {
        const likesSnap = await getDocs(
          query(collection(db, "likes"), where("userId", "==", auth.currentUser.uid))
        );

        likesSnap.docs.forEach(d => {
          likedMap[d.data().storyId] = true;
        });
      }

      /* ===== IMPORTANT FILTER (REAL STORIES ONLY) ===== */

      const newStories = docs
        .map(d => ({ id: d.id, ...d.data() }))

        // 🔥 only valid stories allowed
        .filter(s =>
          s.title &&
          typeof s.title === "string" &&
          s.pages &&
          Array.isArray(s.pages) &&
          s.pages.length > 0
        )

        .map(s => ({
          ...s,
          likedByMe: likedMap[s.id] || false
        }));

      /* ===== REMOVE DUPLICATES ===== */

      setStories(prev => {
        const map = new Map();
        [...prev, ...newStories].forEach(story => {
          map.set(story.id, story);
        });
        return Array.from(map.values());
      });

    } catch (err) {
      console.error("Fetch Stories Error:", err);
    }

    setLoading(false);
  };

  /* ================= INITIAL LOAD ================= */

  useEffect(() => {
    fetchStories(true);
  }, []);

  /* ================= INFINITE SCROLL ================= */

  const lastElementRef = useCallback(node => {

    if (loading) return;

    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        fetchStories(false);
      }
    });

    if (node) observer.current.observe(node);

  }, [loading, hasMore]);

  /* ================= LIKE SYSTEM ================= */

  const likeStory = async (storyId) => {

    if (!auth.currentUser) {
      alert("Login first");
      return;
    }

    if (liking[storyId]) return;

    setLiking(prev => ({ ...prev, [storyId]: true }));

    const uid = auth.currentUser.uid;
    const likeRef = doc(db, "likes", `${uid}_${storyId}`);
    const storyRef = doc(db, "stories", storyId);

    try {
      await runTransaction(db, async (transaction) => {

        const likeDoc = await transaction.get(likeRef);
        const storyDoc = await transaction.get(storyRef);

        if (!storyDoc.exists()) return;

        let count = storyDoc.data().likesCount || 0;
        let likedNow = false;

        if (likeDoc.exists()) {
          transaction.delete(likeRef);
          count = Math.max(count - 1, 0);
        } else {
          transaction.set(likeRef, {
            userId: uid,
            storyId,
            createdAt: Date.now()
          });
          count++;
          likedNow = true;
        }

        transaction.update(storyRef, { likesCount: count });

        setStories(prev =>
          prev.map(s =>
            s.id === storyId
              ? { ...s, likedByMe: likedNow, likesCount: count }
              : s
          )
        );
      });

    } catch (e) {
      console.error("Like Error:", e);
    }

    setLiking(prev => ({ ...prev, [storyId]: false }));
  };

  /* ================= RETURN UI ================= */

  return (
    <StoriesPage
      stories={stories}
      loading={loading}
      lastElementRef={lastElementRef}
      onLike={likeStory}
      navigateToStory={(id) => navigate(`/story/${id}`)}
      navigateToUser={(uid) => navigate(`/user/${uid}`)}
    />
  );
}
