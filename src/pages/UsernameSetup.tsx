import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowRight, Sparkles, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { dbService } from "../services/dbService";
import { UserProfile } from "../types";

export const UsernameSetup: React.FC = () => {
  const { user, authProvider, githubUsername, refreshProfile } = useAuth();
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const guessedGitHubUsername =
    githubUsername ||
    (user?.providerData.find((p) => p.providerId === "github.com")?.displayName ?? null);

  const handleSetup = async () => {
    if (!user || username.length < 3) return;
    
    setLoading(true);
    setError("");

    try {
      // Check if username unique
      const existing = await dbService.getProfileByUsername(username.toLowerCase());
      if (existing) {
        setError("This username is already taken.");
        setLoading(false);
        return;
      }

      const newProfile: UserProfile = {
        uid: user.uid,
        username: username.toLowerCase(),
        displayName: user.displayName || "Anonymous",
        authProvider: authProvider ?? "google",
        photoURL: user.photoURL || "",
        tagline: "Systems Designer & Developer",
        philosophy: "I build resilient, scalable software systems.",
        githubUsername: authProvider === "github" ? guessedGitHubUsername ?? undefined : undefined,
        githubUrl: authProvider === "github" && guessedGitHubUsername ? `https://github.com/${guessedGitHubUsername}` : undefined,
        skills: [],
        socials: { 
          email: user.email || "hello@example.com",
          linkedin: "linkedin.com/in/username",
          twitter: "twitter.com/username"
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await dbService.saveProfile(newProfile);
      await refreshProfile();
      navigate("/dashboard");
    } catch (err) {
      console.error("Setup Error:", err);
      setError("Failed to initialize profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-40 min-h-[80vh] flex flex-col items-center justify-center text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full px-6"
      >
        <span className="block text-[10px] uppercase tracking-[0.4em] mb-8 font-bold opacity-40">Profile Initialization</span>
        <h1 className="text-[48px] md:text-[64px] font-serif italic leading-[0.8] tracking-tighter mb-12">
          Set your <br/> username.
        </h1>
        
        <div className="relative mb-12 group">
          <input 
            type="text" 
            placeholder="USERNAME"
            value={username}
            onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))}
            className="w-full bg-transparent border-b border-zinc-200 py-4 text-center text-[24px] uppercase tracking-[0.2em] font-bold outline-none focus:border-black transition-all"
            autoFocus
          />
          <div className="mt-4 flex justify-between items-center px-2">
            <span className="text-[9px] uppercase tracking-widest opacity-30 italic">min 3 chars / no spaces</span>
            {error && <span className="text-[9px] uppercase tracking-widest text-red-500 font-bold">{error}</span>}
          </div>
        </div>

        <button
          onClick={handleSetup}
          disabled={loading || username.length < 3}
          className="w-full py-5 bg-black text-white text-[11px] uppercase tracking-[0.3em] font-bold disabled:opacity-30 disabled:cursor-not-not-allowed hover:bg-zinc-800 transition-all flex items-center justify-center gap-4"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          Initialize Profile
        </button>

        <p className="mt-12 text-[12px] opacity-40 font-light leading-relaxed">
          This username will be used in your public URL (e.g., yourapp.com/{username || 'username'}). It is permanent and cannot be changed later.
        </p>
      </motion.div>
    </div>
  );
};
