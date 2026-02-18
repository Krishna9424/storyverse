import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase/config";
import { useNavigate, Link } from "react-router-dom";
import "../Styles/auth.css";

export default function Register() {

  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {

      /* 1️⃣ CREATE AUTH ACCOUNT */
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      /* 2️⃣ SET DISPLAY NAME IN AUTH (IMPORTANT) */
      await updateProfile(user, {
        displayName: name
      });

      /* 3️⃣ CREATE USER PROFILE IN FIRESTORE */
      await setDoc(doc(db, "users", user.uid), {
        name: name,
        email: email,
        photoURL: "",
        bio: "",
        followers: 0,
        following: 0,
        createdAt: serverTimestamp()
      });

      /* 4️⃣ GO HOME */
      navigate("/");

    } catch (err) {
      console.error(err);
      setError("Email already exists or invalid input.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <form className="auth-card" onSubmit={handleRegister}>

        <h2>Create account</h2>
        <p>Every story begins with a name.</p>

        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password (min 6 chars)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p style={{ color: "tomato" }}>{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Account"}
        </button>

        <div className="auth-link">
          Already inside? <Link to="/login">Login</Link>
        </div>

      </form>
    </div>
  );
}
