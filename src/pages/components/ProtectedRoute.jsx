import { Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/config";
import { useEffect, useState } from "react";

export default function ProtectedRoute({ children }) {

  const [status, setStatus] = useState("checking");
  // checking | logged | loggedout

  useEffect(() => {

    let interval;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {

      if (!user) {
        setStatus("loggedout");
        return;
      }

      // 🔥 verify user exists on server
      try {
        await user.reload();
        setStatus("logged");
      } catch (err) {
        console.log("Account deleted → logout");
        await auth.signOut();
        setStatus("loggedout");
      }

      // 🔥 continuous verification (important)
      interval = setInterval(async () => {
        if (!auth.currentUser) return;

        try {
          await auth.currentUser.reload();
        } catch {
          await auth.signOut();
          setStatus("loggedout");
        }
      }, 5000); // every 5 sec

    });

    return () => {
      unsubscribe();
      clearInterval(interval);
    };

  }, []);

  if (status === "checking")
    return <div style={{color:"white"}}>Checking session...</div>;

  if (status === "loggedout")
    return <Navigate to="/login" replace />;

  return children;
}
