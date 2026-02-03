import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/config";
import { useNavigate, Link } from "react-router-dom";
import "../Styles/auth.css";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (err) {
      setError("Wrong email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <form className="auth-card" onSubmit={handleLogin}>
        <h2>Welcome back</h2>
        <p>Some doors remember who opened them last.</p>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p style={{ color: "tomato" }}>{error}</p>}

        <p style={{ opacity: 0.4, fontSize: 13 }}>
          Enter carefully. This place remembers stories.
        </p>

        <button type="submit" disabled={loading}>
          {loading ? "Entering..." : "Login"}
        </button>

        <div className="auth-link">
          New here? <Link to="/register">Create account</Link>
        </div>
      </form>
    </div>
  );
}
