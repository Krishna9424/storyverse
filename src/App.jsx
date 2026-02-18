import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "./firebase/config";

/* ===== PAGES ===== */
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Profile from "./pages/profile";
import PublicProfile from "./pages/PublicProfile";
import Reels from "./pages/Reels";

/* ===== STORIES ===== */
import Stories from "./pages/components/stories/Stories";
import Story from "./pages/components/stories/Story";

/* ===== WRITING ===== */
import WritingStudio from "./pages/WritingStudio";
import DarkBookEditor from "./pages/DarkBookEditor";

/* ===== PROTECTION ===== */
import ProtectedRoute from "./components/ProtectedRoute";


function AppRoutes() {

  const navigate = useNavigate();

  // 🔥 track auth safely
  const [currentUser, setCurrentUser] = useState(null);

  /* ================= AUTH LISTENER ================= */
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return unsubscribeAuth;
  }, []);

  /* 🔥 REALTIME ACCOUNT EXISTENCE CHECK (SAFE) */
  useEffect(() => {

    if (!currentUser) return;

    const userRef = doc(db, "users", currentUser.uid);

    const unsubscribeDoc = onSnapshot(
      userRef,
      async (snap) => {

        if (!snap.exists()) {

          console.log("Account deleted → auto logout");

          await signOut(auth);

          window.location.href = "/login";
        }

      },
      (error) => {
        console.log("Firestore error:", error.message);
      }
    );

    return unsubscribeDoc;

  }, [currentUser]);


  return (
    <Routes>

      {/* PUBLIC ROUTES */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/reels" element={<Reels />} />
      <Route path="/user/:uid" element={<PublicProfile />} />

      {/* PROTECTED ROUTES */}
      <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/stories" element={<ProtectedRoute><Stories /></ProtectedRoute>} />
      <Route path="/story/:id" element={<ProtectedRoute><Story /></ProtectedRoute>} />
      <Route path="/write" element={<ProtectedRoute><WritingStudio /></ProtectedRoute>} />
      <Route path="/write/editor" element={<ProtectedRoute><DarkBookEditor /></ProtectedRoute>} />

    </Routes>
  );
}


export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
