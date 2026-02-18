import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  runTransaction,
  onSnapshot,
  collection,
  query,
  where,
  orderBy,
  addDoc,
  serverTimestamp
} from "firebase/firestore";
import { db, auth } from "../../../firebase/config";

import "../../../Styles/darkBookEditor.css";
import "../../../Styles/story.css";
import { deleteDoc } from "firebase/firestore";
import { goToProfile } from "../../../utils/profileNav";

import StoryPlayer from "../../../engine/StoryPlayer";

export default function Story() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [story, setStory] = useState(null);
  const [page, setPage] = useState(0);
  const [readMode, setReadMode] = useState(false);

  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);

  const [comments, setComments] = useState([]);
  const [input, setInput] = useState("");
const [showComments, setShowComments] = useState(false);

  /* LOAD STORY */
  useEffect(() => {
    const load = async () => {
      const snap = await getDoc(doc(db, "stories", id));
      if (snap.exists()) setStory(snap.data());
    };
    load();
  }, [id]);

  /* LIVE LIKE COUNT */
  useEffect(() => {
    if (!id) return;
    return onSnapshot(doc(db, "stories", id), snap => {
      if (snap.exists()) setLikes(snap.data().likesCount || 0);
    });
  }, [id]);

  /* CHECK USER LIKE */
  useEffect(() => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    return onSnapshot(doc(db, "likes", `${uid}_${id}`), d => {
      setLiked(d.exists());
    });
  }, [id]);

  /* LIVE COMMENTS */
  useEffect(() => {
    if (!id) return;
    const q = query(
      collection(db, "comments"),
      where("storyId", "==", id),
      orderBy("createdAt", "asc")
    );
    return onSnapshot(q, snap => {
     setComments(snap.docs.map(d => ({
  id: d.id,
  ...d.data()
})));

    });
  }, [id]);

  /* LIKE */
  const toggleLike = async () => {
    if (!auth.currentUser) return alert("Login first");

    const uid = auth.currentUser.uid;
    const likeRef = doc(db, "likes", `${uid}_${id}`);
    const storyRef = doc(db, "stories", id);

    await runTransaction(db, async (tx) => {
      const likeDoc = await tx.get(likeRef);
      const storyDoc = await tx.get(storyRef);

      let count = storyDoc.data().likesCount || 0;

      if (likeDoc.exists()) {
        tx.delete(likeRef);
        count--;
      } else {
        tx.set(likeRef, { userId: uid, storyId: id });
        count++;
      }

      tx.update(storyRef, { likesCount: count });
    });
  };

  /* COMMENT */
 const sendComment = async (e) => {
  e.stopPropagation();
  if (!input.trim()) return;
  if (!auth.currentUser) return alert("Login first");

  // 🔥 get real profile from users collection
  const userSnap = await getDoc(doc(db, "users", auth.currentUser.uid));
  const userData = userSnap.exists() ? userSnap.data() : {};

  await addDoc(collection(db, "comments"), {
    storyId: id,
    userId: auth.currentUser.uid,
    userName: userData?.name || "User",
    userPhoto: userData?.photoURL || "",
    text: input,
    createdAt: serverTimestamp()
  });

  setInput("");
 

};
 const deleteComment = async (commentId, userId) => {
  if (!auth.currentUser) return;

  if (auth.currentUser.uid !== userId) {
    alert("You can delete only your comment");
    return;
  }

  await deleteDoc(doc(db, "comments", commentId));
};



  if (!story) return <div className="reader-loading">Loading...</div>;

  /* fallback avatar */
 const Avatar = ({ name = "User", photo = "" }) => {

  const letter = name.charAt(0).toUpperCase();

  // agar photo hai
  if (photo && photo.length > 5) {
    return <img className="avatar-img" src={photo} alt={name} />;
  }

  // fallback letter avatar
  return (
    <div className="avatar-fallback">
      {letter}
    </div>
  );
};


  return (
    <div className={`reader-shell ${readMode ? "read-mode":""}`}>

      {/* TOP BAR */}
      {!readMode && (
        <div className="reader-topbar">
  <button className="back-btn" onClick={()=>navigate(-1)}>←</button>

 <div className="author clickable"
  onClick={()=>goToProfile(navigate, story.authorId)}>
  <Avatar name={story.authorName} photo={story.authorPhoto}/>
  <span>{story.authorName}</span>
</div>


  <button className="mode-btn" onClick={()=>setReadMode(true)}>
    Read
  </button>
</div>

      )}

      {/* BOOK */}
      <div className={`book ${story.theme}`}>
        <StoryPlayer text={story.pages[page]?.content || ""}/>
      </div>

      {/* PAGE ARROWS ALWAYS */}
      <div className="reader-arrows">
        <button disabled={page===0} onClick={()=>setPage(p=>p-1)}>←</button>
        <span>{page+1}/{story.pages.length}</span>
        <button disabled={page===story.pages.length-1} onClick={()=>setPage(p=>p+1)}>→</button>
      </div>

      {/* SOCIAL MODE */}
      {!readMode && (
        <div className="social-panel">

          <div className="actions">
            <button onClick={toggleLike}>
              {liked ? "♥" : "♡"} {likes}
            </button>
          </div>

         <div className="comments">

  {/* OPEN BUTTON */}
  <div className="open-comments" onClick={()=>setShowComments(v=>!v)}>
    💬 Comments ({comments.length})
  </div>

  {showComments && (
    <div className="comments-box">

      {comments.map((c)=>(
        <div key={c.id} className="comment">

          <Avatar name={c.userName} photo={c.userPhoto}/>

          <div className="comment-body">
            <b>{c.userName}</b>
            <p>{c.text}</p>
          </div>

          {auth.currentUser?.uid === c.userId && (
            <button
              className="delete-comment"
              onClick={()=>deleteComment(c.id,c.userId)}
            >
              ✕
            </button>
          )}

        </div>
      ))}

      <div className="comment-input">
        <input
          value={input}
          onChange={(e)=>setInput(e.target.value)}
          placeholder="Write a thought..."
        />
        <button onClick={sendComment}>Send</button>
      </div>

    </div>
  )}
</div>


        </div>
      )}

      {/* EXIT READ MODE */}
      {readMode && (
        <button className="exit-read" onClick={()=>setReadMode(false)}>
          Exit
        </button>
      )}

    </div>
  );
}

