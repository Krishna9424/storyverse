import { signOut } from "firebase/auth";
import { auth } from "../firebase/config";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { useEffect, useState } from "react";
import "../Styles/home.css";

export default function Home() {
  const navigate = useNavigate();

  const [userName, setUserName] = useState("");
  const [role, setRole] = useState("reader");

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  useEffect(() => {
    const fetchUser = async () => {
      if (auth.currentUser) {
        const userRef = doc(db, "users", auth.currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setUserName(userSnap.data().name);
          setRole(userSnap.data().role || "reader");
        }
      }
    };

    fetchUser();
  }, []);

  return (
    <div className="home-wrapper">
      {/* TOP BAR */}
      <div className="home-top">
        <h2>StoryVerse</h2>

        <div style={{ display: "flex", gap: "12px" }}>
          <button onClick={() => navigate("/profile")}>Profile</button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>

      {/* CENTER CONTENT */}
      <div className="home-center">
        <p>Welcome back{userName && `, ${userName}`}</p>

        <h1>
          Every story waits <br />
          for the right moment.
        </h1>

        <div className="home-actions">
          {/* WRITER ONLY */}
          {role === "writer" && (
            <div className="action-card" onClick={() => navigate("/write")}>
              <h3>Write a story</h3>
              <span>Your words deserve a place.</span>
            </div>
          )}

          {/* READER ONLY */}
          {role === "reader" && (
            <div className="action-card">
              <h3>Your notes</h3>
              <span>Private thoughts, just for you.</span>
            </div>
          )}

          {/* EVERYONE */}
         <div
  className="action-card"
  onClick={() => navigate("/stories")}
>
  <h3>Read stories</h3>
  <span>Get lost in someone else’s world.</span>
</div>

        </div>
      </div>
    </div>
  );
}
