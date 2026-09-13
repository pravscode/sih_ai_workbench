import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../lib/api";
import "./login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await loginUser({ email, password });
      console.log("Logged in:", result);
      navigate("/");
    } catch {
      setError("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-brand-panel">
        <svg
          className="login-brand-pattern"
          viewBox="0 0 400 600"
          fill="none"
        >
          <circle cx="60" cy="80" r="3" fill="white" />
          <circle cx="180" cy="140" r="3" fill="white" />
          <circle cx="120" cy="260" r="3" fill="white" />
          <circle cx="300" cy="200" r="3" fill="white" />
          <circle cx="260" cy="380" r="3" fill="white" />
          <circle cx="100" cy="460" r="3" fill="white" />
          <circle cx="320" cy="500" r="3" fill="white" />
          <line x1="60" y1="80" x2="180" y2="140" stroke="white" strokeWidth="1" />
          <line x1="180" y1="140" x2="300" y2="200" stroke="white" strokeWidth="1" />
          <line x1="180" y1="140" x2="120" y2="260" stroke="white" strokeWidth="1" />
          <line x1="120" y1="260" x2="260" y2="380" stroke="white" strokeWidth="1" />
          <line x1="260" y1="380" x2="100" y2="460" stroke="white" strokeWidth="1" />
          <line x1="260" y1="380" x2="320" y2="500" stroke="white" strokeWidth="1" />
        </svg>

        <div className="login-brand-logo">
          <div className="login-brand-mark" />
          <span>AI Workbench</span>
        </div>

        <p className="login-brand-quote">
          Every document, every model, inside our own infrastructure.
        </p>
      </div>

      <div className="login-form-panel">
        <div className="login-card">
          <h1>Welcome back</h1>
          <p>Sign in with the account your admin set up for you.</p>

          <form onSubmit={handleSubmit}>
            <div className="login-field">
              <label>Email</label>
              <input
                type="email"
                required
                placeholder="example@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="login-field">
              <label>Password</label>
              <input
                type="password"
                required
                placeholder="enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="login-row">
              <label className="login-remember">
                <input type="checkbox" />
                Remember me
              </label>
              <a href="#" className="login-link">
                Forgot password?
              </a>
            </div>

            {error && <p className="login-error">{error}</p>}

            <button type="submit" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Log in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}