"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/lib/api";


export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await loginUser({ email, password });
      console.log("Logged in:", result);
      router.push("/");
    } catch (err) {
      setError("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

    return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-2">
      {/* Left brand panel */}
      <div
        className="relative hidden flex-col justify-between overflow-hidden p-10 text-white md:flex"
        style={{ background: "linear-gradient(160deg, #1E3801, #507527)" }}
      >
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full opacity-20"
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

        <div className="relative z-10 flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-white/90" />
          <span className="text-lg font-medium">Workbench</span>
        </div>

        <div className="relative z-10">
          <p className="text-2xl font-semibold leading-snug">
            Every document, every model, inside our own infrastructure.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-sm">
          <h1 className="mb-1 text-2xl font-semibold text-zinc-900">
            Welcome back
          </h1>
          <p className="mb-6 text-sm text-zinc-500">
            Sign in with the account your admin set up for you.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm text-zinc-600">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-[#507527]"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm text-zinc-600">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-[#507527]"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-zinc-600">
                <input type="checkbox" className="accent-[#507527]" />
                Remember me
              </label>
              <a href="#" className="text-[#507527] hover:underline">
                Forgot password?
              </a>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 rounded-md py-2 text-sm font-medium text-white disabled:opacity-50"
              style={{ backgroundColor: "#507527" }}
            >
              {isLoading ? "Logging in..." : "Log in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );

}