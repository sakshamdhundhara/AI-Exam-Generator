"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { registerUser } from "@/lib/actions/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);

    try {
      const res = await registerUser(formData);
      
      if (res.error) {
        setError(res.error);
      } else {
        router.push("/login");
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
        <h2 className="text-gradient" style={{ textAlign: "center", marginBottom: "clamp(20px, 4vw, 32px)", fontSize: "clamp(1.5rem, 4vw, 2rem)" }}>Create Account</h2>
        
        {error && (
          <div style={{ color: "var(--error-color)", marginBottom: "16px", padding: "12px", background: "rgba(239, 68, 68, 0.1)", borderRadius: "var(--border-radius-sm)", textAlign: "center" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input 
              type="text" 
              className="form-input" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required 
            />
          </div>
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
              minLength={6}
            />
          </div>
          <button type="submit" className="btn-primary" style={{ width: "100%", marginTop: "16px" }} disabled={isLoading}>
            {isLoading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "24px", color: "var(--text-secondary)" }}>
          Already have an account? <Link href="/login" style={{ color: "var(--accent-primary)" }}>Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
