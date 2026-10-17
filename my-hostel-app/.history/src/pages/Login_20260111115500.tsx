import { useState } from "react";
import { login } from "../lib/api";
import { setToken } from "../lib/auth";
import "./Login.scss";

export default function Login({ onSuccess }: { onSuccess?: () => void }) {
  const [email, setEmail] = useState("landlord@example.com");
  const [password, setPassword] = useState("password");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const data = await login(email, password);
      setToken(data.token);
      setError(null);
      onSuccess && onSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.error || "Login failed");
    }
  }

  return (
    <div className="login-card card">
      <h2 className="page-title">Login</h2>
      <form onSubmit={submit}>
        <div>
          <label>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <div style={{ color: "red" }}>{error}</div>}
        <div style={{ marginTop: "0.5rem" }}>
          <button type="submit">Sign in</button>
        </div>
      </form>
    </div>
  );
}
