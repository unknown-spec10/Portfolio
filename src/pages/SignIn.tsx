import React, { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Github, Loader2, LogIn, Mail } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const SignIn: React.FC = () => {
  const {
    user,
    profile,
    loading,
    authError,
    authLoading,
    loginWithGoogle,
    loginWithGitHub,
    loginWithEmail,
    registerWithEmail,
  } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailMode, setEmailMode] = useState<"signin" | "signup">("signin");

  if (!loading && user) {
    return <Navigate to={profile ? "/dashboard" : "/setup"} replace />;
  }

  return (
    <div className="pt-40 min-h-[80vh] flex flex-col items-center justify-center text-center px-6">
      <div className="max-w-md w-full border border-zinc-200 bg-white p-8 md:p-10">
        <span className="block text-[10px] uppercase tracking-[0.4em] mb-6 font-bold opacity-40">Authentication</span>
        <h1 className="text-[40px] md:text-[52px] font-serif italic leading-[0.85] tracking-tighter mb-10">
          Sign in <br/> to continue.
        </h1>

        <div className="space-y-3 mb-8">
          <button
            onClick={loginWithGoogle}
            disabled={authLoading}
            className="w-full py-4 border border-zinc-200 text-[11px] uppercase tracking-[0.25em] font-bold hover:bg-black hover:text-white transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {authLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
            Continue with Google
          </button>

          <button
            onClick={loginWithGitHub}
            disabled={authLoading}
            className="w-full py-4 border border-zinc-200 text-[11px] uppercase tracking-[0.25em] font-bold hover:bg-black hover:text-white transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {authLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Github className="w-4 h-4" />}
            Continue with GitHub
          </button>
        </div>

        <div className="border-t border-zinc-100 pt-6 mb-4">
          <span className="block text-[9px] uppercase tracking-widest opacity-40 mb-4">Email Authentication</span>

          <div className="space-y-3 mb-3">
            <input
              type="email"
              placeholder="EMAIL"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-zinc-200 px-4 py-3 text-[11px] uppercase tracking-[0.2em] outline-none focus:border-black transition-all"
            />
            <input
              type="password"
              placeholder="PASSWORD"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-zinc-200 px-4 py-3 text-[11px] uppercase tracking-[0.2em] outline-none focus:border-black transition-all"
            />
          </div>

          <button
            onClick={() =>
              emailMode === "signin"
                ? loginWithEmail(email.trim(), password)
                : registerWithEmail(email.trim(), password)
            }
            disabled={authLoading || !email.trim() || password.length < 6}
            className="w-full py-4 bg-black text-white text-[11px] uppercase tracking-[0.25em] font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-800 transition-all flex items-center justify-center gap-3"
          >
            {authLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
            {emailMode === "signin" ? "Sign in with Email" : "Create Email Account"}
          </button>

          <button
            onClick={() => setEmailMode((m) => (m === "signin" ? "signup" : "signin"))}
            className="mt-3 text-[10px] uppercase tracking-[0.2em] opacity-50 hover:opacity-100 transition-all"
          >
            {emailMode === "signin" ? "Need an account? Create one" : "Already have an account? Sign in"}
          </button>
        </div>

        {authError && (
          <p className="text-[10px] uppercase tracking-[0.18em] text-red-500 mt-4 break-words">{authError}</p>
        )}

        <p className="mt-8 text-[11px] opacity-40">
          Back to <Link to="/" className="underline underline-offset-4">home</Link>
        </p>
      </div>
    </div>
  );
};
