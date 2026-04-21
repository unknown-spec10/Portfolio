import React from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { User, LogOut, LogIn } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const Navigation: React.FC = () => {
  const { user, profile, logout } = useAuth();

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#FCFCFC]/80 backdrop-blur-sm px-6 md:px-12 h-20 flex items-center justify-between border-b border-zinc-100 md:border-none">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 bg-black flex-shrink-0"></div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Link to="/" className="uppercase tracking-[0.3em] text-[9px] md:text-[10px] font-bold truncate max-w-[150px] md:max-w-none">
            Portfolio <span className="hidden sm:inline">/ Dev Stack Hub</span>
          </Link>
        </motion.div>
      </div>
      <div className="flex gap-6 md:gap-12 items-center">
        {user && !profile && (
          <Link to="/setup" className="text-[10px] md:text-[11px] uppercase tracking-widest border-b border-black pb-1">
            Complete Setup
          </Link>
        )}
        {user && profile && (
          <Link to="/dashboard" className="text-[10px] md:text-[11px] uppercase tracking-widest border-b border-black pb-1">Dashboard</Link>
        )}
        {user && profile && (
          <Link to={`/${encodeURIComponent(profile.username.trim().toLowerCase())}`} className="text-[10px] md:text-[11px] uppercase tracking-widest opacity-40 hover:opacity-100 transition-all">My Projects</Link>
        )}
        
        {user ? (
          <div className="flex items-center gap-4 md:gap-6">
            <div className="flex items-center gap-2">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || ""} className="w-5 h-5 rounded-full object-cover grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all" referrerPolicy="no-referrer" />
              ) : (
                <User className="w-4 h-4 opacity-40" />
              )}
              <span className="hidden sm:inline text-[10px] uppercase tracking-widest font-bold opacity-40">{user.displayName?.split(" ")[0]}</span>
            </div>
            <button 
              onClick={logout}
              className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] font-bold opacity-30 hover:opacity-100 transition-all flex items-center gap-2"
            >
              <LogOut className="w-3 h-3" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        ) : (
          <Link
            to="/signin"
            className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] font-bold border border-zinc-200 px-4 md:px-6 py-2 hover:bg-black hover:text-white transition-all flex items-center gap-2"
          >
            <LogIn className="w-3 h-3" />
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
};
