import { Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/config";
import { useEffect, useState } from "react";

export default function ProtectedRoute({ children }) {

  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {

    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setChecking(false);
    });

    return () => unsub();

  }, []);

  if (checking) return null;

  return user ? children : <Navigate to="/login" replace />;
}
