"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError("Invalid email or password");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", padding: "clamp(12px, 3vw, 20px)" }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel"
        style={{ padding: "clamp(24px, 6vw, 40px)", width: "100%", maxWidth: "420px" }}
      >
        <h2 className="text-gradient" style={{ textAlign: "center", marginBottom: "clamp(20px, 4vw, 32px)", fontSize: "clamp(1.5rem, 4vw, 2rem)" }}>Welcome Back</h2>
        
        {error && (
          <div style={{ color: "var(--error-color)", marginBottom: "16px", padding: "12px", background: "rgba(239, 68, 68, 0.1)", borderRadius: "var(--border-radius-sm)", textAlign: "center" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input 
              type="email" 
              className="form-input" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-input" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          <button type="submit" className="btn-primary" style={{ width: "100%", marginTop: "16px" }} disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "24px", color: "var(--text-secondary)" }}>
          Don't have an account? <Link href="/register" style={{ color: "var(--accent-primary)" }}>Sign up</Link>
        </p>
      </motion.div>
    </div>
  );
}
