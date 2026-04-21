import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  Github, 
  Linkedin, 
  Mail, 
  ArrowRight, 
  Download, 
  Sparkles,
  Loader2
} from "lucide-react";
import { dbService } from "../services/dbService";
import { useAuth } from "../context/AuthContext";
import { UserProfile, Project } from "../types";
import { ProjectCard } from "../components/ProjectCard";
import { ProjectModal } from "../components/ProjectModal";
import { DEFAULT_SKILLS } from "../constants";

export const Profile: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const normalizedUsername = username ? decodeURIComponent(username).trim().toLowerCase() : "";
  const { user, profile: currentUserProfile } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    const fetchUserArchive = async () => {
      if (!normalizedUsername) return;
      setLoading(true);
      try {
        const userProfile = await dbService.getProfileByUsername(normalizedUsername);
        if (!userProfile) {
          setError(true);
          setLoading(false);
          return;
        }
        setProfile(userProfile);
        const userPublicProjects = await dbService.getPublicProjects(normalizedUsername);
        setProjects(userPublicProjects);
      } catch (err) {
        console.error("Profile fetch error:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchUserArchive();
  }, [normalizedUsername]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center italic opacity-30">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <span className="text-[12px] uppercase tracking-widest font-bold ml-4">Loading Profile...</span>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-[48px] font-serif italic tracking-tighter mb-8 leading-none">Profile not found.</h1>
        <p className="opacity-40 italic max-w-sm">The profile you are looking for does not exist or is private.</p>
      </div>
    );
  }

  return (
    <div className="pt-32 md:pt-40">
      <div className="mb-10 md:mb-14">
        <Link
          to={user ? "/dashboard" : "/"}
          className="inline-flex items-center gap-2 text-[10px] md:text-[11px] uppercase tracking-[0.28em] font-bold border border-zinc-200 px-5 py-3 hover:bg-black hover:text-white transition-all"
        >
          <ArrowRight className="w-3 h-3 rotate-180" />
          {user && currentUserProfile?.username === normalizedUsername ? "Back to Dashboard" : "Back to Home"}
        </Link>
      </div>

      {/* Profile Hero */}
      <section className="grid grid-cols-12 gap-8 mb-32">
        <motion.div 
          className="col-span-12 lg:col-span-9 flex flex-col justify-end"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <span className="block text-[9px] md:text-[10px] uppercase tracking-[0.4em] mb-6 md:mb-8 font-bold opacity-40 text-left">Profile v1.0 / Engineering</span>
          <h1 className="text-[60px] sm:text-[100px] md:text-[120px] lg:text-[140px] font-serif italic leading-[0.85] md:leading-[0.8] -ml-1 md:-ml-2 tracking-tighter mb-8 group">
            {profile.displayName.split(" ")[0]} <br/> {profile.displayName.split(" ").slice(1).join(" ")}
          </h1>
          <div className="max-w-xl">
            <p className="text-[16px] md:text-[20px] leading-relaxed font-light mb-10 opacity-80 italic">
              {profile.tagline || "Designer and Engineer focusing on high-fidelity digital systems."}
            </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-8">
              <button 
                onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full sm:w-auto px-8 md:px-10 py-4 md:py-5 bg-black text-white text-[10px] md:text-[11px] uppercase tracking-[0.25em] font-bold hover:bg-zinc-800 transition-all"
              >
                Explore Projects
              </button>
              {profile.githubUrl && (
                <a 
                  href={profile.githubUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[10px] md:text-[11px] uppercase tracking-[0.25em] border-b border-zinc-300 pb-1 font-bold hover:border-black transition-all"
                >
                  GitHub History
                </a>
              )}
            </div>
          </div>
        </motion.div>
        
        <div className="hidden lg:flex col-span-3 flex-col justify-between items-end text-right pt-6">
          <div className="border-t border-zinc-200 pt-6 w-full">
            <span className="block text-[9px] uppercase tracking-[0.3em] opacity-40 mb-3">Status</span>
            <p className="text-[14px] font-bold tracking-tight uppercase">Independent Engineer</p>
          </div>
        </div>
      </section>

      {/* Marquee Skills Row */}
      <div className="w-screen relative left-1/2 -translate-x-1/2 overflow-hidden py-8 border-t border-b border-zinc-100 mb-24 bg-white">
        <motion.div 
          className="flex w-fit gap-8"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
        >
          {[...DEFAULT_SKILLS, ...DEFAULT_SKILLS].map((skill, idx) => (
            <div key={idx} className="flex items-center gap-6 px-10 py-3 bg-[#F8F8F7] border border-zinc-50 text-[11px] uppercase tracking-[0.4em] font-bold text-zinc-800">
              <div className="opacity-30">{skill.icon}</div>
              {skill.name}
            </div>
          ))}
        </motion.div>
      </div>

      {/* Projects Grid */}
      <section id="projects" className="pt-16 border-t border-black mb-32">
        <div className="flex justify-between items-baseline mb-16 md:mb-20">
          <h2 className="text-[40px] md:text-[56px] font-serif italic tracking-tighter">Public Entries.</h2>
          <span className="text-[9px] md:text-[10px] uppercase tracking-[0.3em] opacity-40">{projects.length} Works</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
          {projects.map((project, index) => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              index={index} 
              onClick={setSelectedProject} 
            />
          ))}
          {projects.length === 0 && (
            <div className="col-span-full py-32 border border-dashed border-zinc-200 flex flex-center italic opacity-30 text-center">
              No public projects yet.
            </div>
          )}
        </div>
      </section>

      {/* About & Contact */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 mb-40">
        <section id="about" className="flex flex-col gap-8 md:gap-12">
          <div>
            <span className="block text-[8px] md:text-[9px] uppercase tracking-[0.4em] font-bold mb-6 md:mb-8 opacity-40 border-b border-zinc-100 pb-4">Engineering Summary</span>
            <p className="text-[20px] md:text-[24px] font-serif leading-relaxed italic opacity-80 mb-6 md:mb-8">
              {profile.philosophy}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 border-t border-zinc-100 pt-10 md:pt-12">
             <div>
                <span className="block text-[9px] md:text-[10px] font-bold uppercase tracking-widest opacity-30 mb-2">Intent</span>
                <p className="text-[11px] md:text-[12px] opacity-60">High-fidelity interfaces.</p>
             </div>
             <div>
                <span className="block text-[9px] md:text-[10px] font-bold uppercase tracking-widest opacity-30 mb-2">Method</span>
                <p className="text-[11px] md:text-[12px] opacity-60">Engineered elegance.</p>
             </div>
          </div>
        </section>

        <section id="contact">
          <span className="block text-[8px] md:text-[9px] uppercase tracking-[0.4em] font-bold mb-6 md:mb-8 opacity-40 border-b border-zinc-100 pb-4">Connect</span>
          <h3 className="text-[36px] md:text-[48px] font-serif tracking-tighter leading-none mb-10">Collaboration <br/> request.</h3>
          <div className="flex flex-col gap-6">
            {profile.socials?.email && (
              <a href={`mailto:${profile.socials.email}`} className="group flex items-end justify-between border-b border-zinc-200 pb-4 hover:border-black transition-all">
                <span className="text-[14px] font-bold uppercase tracking-tight">Email</span>
                <span className="text-[12px] opacity-40 group-hover:opacity-100 flex items-center gap-2 truncate max-w-[200px]">{profile.socials.email} <ArrowRight className="w-3 h-3"/></span>
              </a>
            )}
            {profile.socials?.linkedin && (
              <a href={profile.socials.linkedin.startsWith('http') ? profile.socials.linkedin : `https://${profile.socials.linkedin}`} target="_blank" rel="noreferrer" className="group flex items-end justify-between border-b border-zinc-200 pb-4 hover:border-black transition-all">
                <span className="text-[14px] font-bold uppercase tracking-tight">LinkedIn</span>
                <span className="text-[12px] opacity-40 group-hover:opacity-100 flex items-center gap-2">Explore <ArrowRight className="w-3 h-3"/></span>
              </a>
            )}
            {profile.socials?.twitter && (
              <a href={profile.socials.twitter.startsWith('http') ? profile.socials.twitter : `https://${profile.socials.twitter}`} target="_blank" rel="noreferrer" className="group flex items-end justify-between border-b border-zinc-200 pb-4 hover:border-black transition-all">
                <span className="text-[14px] font-bold uppercase tracking-tight">Twitter</span>
                <span className="text-[12px] opacity-40 group-hover:opacity-100 flex items-center gap-2">Follow <ArrowRight className="w-3 h-3"/></span>
              </a>
            )}
          </div>
        </section>
      </div>

      <ProjectModal 
        project={selectedProject} 
        onClose={() => setSelectedProject(null)} 
      />
    </div>
  );
};
