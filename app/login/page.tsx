"use client";

import { useState } from "react";
import { login } from "@/services/authService";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const { user } = await login({ email, password });
      
      // Redirect based on role
      if (user.role_id === 1) {
        router.push("/super_admin/dashboard");
      } else if (user.role_id === 2) {
        router.push("/admin/dashboard");
      } else {
        router.push("/user_page/officer_list");
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#031b3e] to-[#0c326a] px-4">
      {/* Logo */}
      <div className="mb-8">
        <Image
          src="/sxc_logo.png"
          alt="Logo"
          width={180}
          height={90}
          className="mx-auto"
        />
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-[#d1d1d1] rounded-2xl shadow-md p-8">
        {/* Title */}
        <h1 className="text-2xl font-bold text-center text-[#0b2f63] mb-6">
          Sign In
        </h1>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="px-4 py-3 rounded-md border border-[#083577]/50 text-[#0b2f63] placeholder:text-[#0b2f63]/50 outline-none focus:ring-2 focus:ring-[#083577]"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="px-4 py-3 rounded-md border border-[#083577]/50 text-[#0b2f63] placeholder:text-[#0b2f63]/50 outline-none focus:ring-2 focus:ring-[#083577]"
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 py-3 rounded-xl bg-[#083577] text-white font-bold hover:bg-[#062a5e] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        {/* Forgot Password */}
        {/* <p className="text-sm text-center text-[#0a2d60] mt-4 cursor-pointer hover:underline">
          Forgot Password
        </p> */}
      </div>

      {/* Footer */}
      <p className="mt-8 text-sm text-white text-center">
        Learn, Share, Impact 🚀
      </p>
      <p className="text-xs mt-1 opacity-70">
        Project By TeCe Kece 😎
      </p>
      <p className="text-xs mt-1 opacity-70">
        Human Resources
      </p>
    </div>
  );
}
