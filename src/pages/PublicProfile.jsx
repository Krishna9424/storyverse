import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  onSnapshot,
  setDoc,
  deleteDoc,
  serverTimestamp,
  orderBy
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../firebase/config";
import "../Styles/publicProfile.css";

export default function PublicProfile() {

  const { uid } = useParams();
  const navigate = useNavigate();

  const [currentUser,setCurrentUser]=useState(null);
  const [user,setUser]=useState(null);
  const [stories,setStories]=useState([]);
  const [following,setFollowing]=useState(false);
  const [tab,setTab]=useState("stories");

  const [stats,setStats]=useState({
    followers:0,
    following:0,
    stories:0,
    reels:0
  });

  /* AUTH LISTENER */
  useEffect(()=>{
    const unsub=onAuthStateChanged(auth,user=>{
      setCurrentUser(user);
    });
    return ()=>unsub();
  },[]);

  /* LOAD USER */
  useEffect(()=>{
    const load=async()=>{
      const snap=await getDoc(doc(db,"users",uid));
      if(snap.exists()) setUser(snap.data());
    };
    load();
  },[uid]);

  /* USER STORIES */
  useEffect(()=>{
    if(!uid) return;

    const q=query(
      collection(db,"stories"),
      where("authorId","==",uid),
      where("isPublic","==",true),
      orderBy("createdAt","desc")
    );

    const unsub=onSnapshot(q,s=>{
      const list=s.docs.map(d=>({id:d.id,...d.data()}));
      setStories(list);
      setStats(prev=>({...prev,stories:list.length}));
    });

    return ()=>unsub();
  },[uid]);

  /* FOLLOWER COUNTS */
  useEffect(()=>{
    if(!uid) return;

    const followersQ=query(collection(db,"follows"),where("followingId","==",uid));
    const followingQ=query(collection(db,"follows"),where("followerId","==",uid));

    const unsub1=onSnapshot(followersQ,s=>{
      setStats(prev=>({...prev,followers:s.size}));
    });

    const unsub2=onSnapshot(followingQ,s=>{
      setStats(prev=>({...prev,following:s.size}));
    });

    return ()=>{unsub1();unsub2();}
  },[uid]);

  /* FOLLOW STATUS */
  useEffect(()=>{
    if(!currentUser || currentUser.uid===uid) return;

    const ref=doc(db,"follows",`${currentUser.uid}_${uid}`);
    return onSnapshot(ref,d=>setFollowing(d.exists()));
  },[currentUser,uid]);

  /* FOLLOW BUTTON */
  const toggleFollow=async()=>{
    if(!currentUser) return alert("Login first");

    const ref=doc(db,"follows",`${currentUser.uid}_${uid}`);

    if(following){
      await deleteDoc(ref);
    }else{
      await setDoc(ref,{
        followerId:currentUser.uid,
        followingId:uid,
        createdAt:serverTimestamp()
      });
    }
  };

  if(!user) return <div className="pp-loading">Entering space...</div>;

  const avatar = user.photoURL ||
  `https://ui-avatars.com/api/?name=${(user.name || "U")[0]}&background=111&color=fff&size=256`;

  return(
    <div className="author-space">

      {/* COVER */}
      <div className="cover">
        <button className="back" onClick={()=>navigate(-1)}>←</button>
      </div>

      {/* PROFILE */}
      <div className="identity">

        <img className="avatar" src={avatar} alt=""/>

        <h2>{user.name}</h2>
        <p>{user.bio || "A silent writer wandering between worlds..."}</p>

        {/* STATS */}
        <div className="stats">
          <div><b>{stats.followers}</b><span>Followers</span></div>
          <div><b>{stats.following}</b><span>Following</span></div>
          <div><b>{stats.stories}</b><span>Stories</span></div>
          <div><b>{stats.reels}</b><span>Reels</span></div>
        </div>

        {/* FOLLOW BUTTON */}
        {currentUser && currentUser.uid!==uid && (
          <button className={`follow ${following?"on":""}`} onClick={toggleFollow}>
            {following?"Following":"Follow"}
          </button>
        )}

        {/* TABS */}
        <div className="tabs">
          <span className={tab==="stories"?"active":""} onClick={()=>setTab("stories")}>Stories</span>
          <span className={tab==="reels"?"active":""} onClick={()=>setTab("reels")}>Reels</span>
          <span className={tab==="about"?"active":""} onClick={()=>setTab("about")}>About</span>
        </div>

      </div>

      {/* CONTENT */}
      <div className="space-content">

        {tab==="stories" && (
          <div className="story-grid">
            {stories.map(s=>(
              <div key={s.id} className="story-card" onClick={()=>navigate(`/story/${s.id}`)}>
                <div className="story-overlay"/>
                <span>{s.title}</span>
              </div>
            ))}
          </div>
        )}

        {tab==="about" && (
          <div className="about-box">
            <h3>About</h3>
            <p>{user.bio || "No words written yet."}</p>
          </div>
        )}

        {tab==="reels" && (
          <div className="reels-grid">
            <div className="reel-card">Reels coming soon 🎬</div>
          </div>
        )}

      </div>

    </div>
  );
}

