import { Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/config";
import { useEffect, useState } from "react";

export default function ProtectedRoute({ children }) {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  if (user === undefined) {
    return <p style={{ color: "white" }}>Checking auth...</p>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
}
