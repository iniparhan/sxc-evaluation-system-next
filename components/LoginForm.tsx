"use client";

import { useState } from "react";
import { login } from "@/services/authService";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    await fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    router.push("/dashboard");
  } catch {
    setError("Login gagal");
  }
};

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input
        type="email"
        placeholder="Your Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="px-4 py-3 border rounded-md"
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="px-4 py-3 border rounded-md"
      />

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button className="py-3 bg-blue-700 text-white rounded-xl">
        Sign In
      </button>
    </form>
  );
}