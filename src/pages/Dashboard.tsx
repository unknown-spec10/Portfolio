import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Plus, 
  Settings, 
  Eye, 
  EyeOff, 
  Trash2, 
  Edit3, 
  ExternalLink, 
  Github, 
  Check, 
  Loader2, 
  ChevronDown,
  ArrowUpRight,
  Sparkles,
  Upload,
  Download
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { dbService } from "../services/dbService";
import { Project, GitHubRepo } from "../types";
import { ProjectCard } from "../components/ProjectCard";
import { ProjectModal } from "../components/ProjectModal";
import { storage } from "../lib/firebase";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";

const README_FETCH_TIMEOUT_MS = 15000;
const AI_PARSE_TIMEOUT_MS = 35000;

export const Dashboard: React.FC = () => {
  const { user, profile, authProvider, githubToken, githubUsername, refreshProfile } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [availableRepos, setAvailableRepos] = useState<GitHubRepo[]>([]);
  const [selectedRepoName, setSelectedRepoName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingRepos, setIsFetchingRepos] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  // Profile Form States
  const [tagline, setTagline] = useState(profile?.tagline || "");
  const [philosophy, setPhilosophy] = useState(profile?.philosophy || "");
  const [githubUrl, setGithubUrl] = useState(profile?.githubUrl || "");
  const [linkedin, setLinkedin] = useState(profile?.socials?.linkedin || "linkedin.com/in/username");
  const [twitter, setTwitter] = useState(profile?.socials?.twitter || "twitter.com/username");
  const [email, setEmail] = useState(profile?.socials?.email || "hello@example.com");
  const [resumeUrl, setResumeUrl] = useState(profile?.resumeUrl || "");
  const [resumeFileName, setResumeFileName] = useState(profile?.resumeFileName || "");
  const [isUploadingResume, setIsUploadingResume] = useState(false);

  const isGitHubAuth = authProvider === "github" || profile?.authProvider === "github";

  useEffect(() => {
    if (user) {
      fetchUserProjects();
      fetchRepositories();
    }
  }, [user, profile?.githubUrl, githubToken, githubUsername, authProvider]);

  useEffect(() => {
    setResumeUrl(profile?.resumeUrl || "");
    setResumeFileName(profile?.resumeFileName || "");
  }, [profile?.resumeUrl, profile?.resumeFileName]);

  const fetchUserProjects = async () => {
    if (!user) return;
    const items = await dbService.getUserProjects(user.uid);
    setProjects(items);
  };

  const fetchRepositories = async () => {
    setIsFetchingRepos(true);

    const githubUrlUsername = profile?.githubUrl?.split("github.com/")[1]?.split("/")[0]?.trim();
    const fallbackUsername = githubUsername || profile?.githubUsername || githubUrlUsername;

    try {
      const query = fallbackUsername ? `?username=${encodeURIComponent(fallbackUsername)}` : "";
      const response = await fetch(`/api/github/repos${query}`, {
        headers: githubToken ? { "x-github-token": githubToken } : undefined,
      });

      if (!response.ok) throw new Error("Failed to fetch repositories");
      const data = await response.json();
      setAvailableRepos(data);
    } catch (error) {
      console.error("Fetch Repos Error:", error);
    } finally {
      setIsFetchingRepos(false);
    }
  };

  const handleAddProject = async (repoName: string) => {
    if (!repoName || !user || !profile) return;

    const repo = availableRepos.find(r => r.name === repoName);
    if (!repo) return;

    const projectId = docId();
    const placeholder: Project = {
      id: projectId,
      userId: user.uid,
      username: profile.username,
      name: repoName,
      description: "Analyzing architecture...",
      narrative: "Case study incoming...",
      role: "Architect",
      tags: ["AI", "Analyzing"],
      url: repo.html_url,
      status: "draft",
      isAiLoading: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setProjects(prev => [placeholder, ...prev]);
    setIsLoading(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), README_FETCH_TIMEOUT_MS);
      const response = await fetch(`/api/github/readme?owner=${repo.html_url.split("/")[3]}&repo=${repoName}`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error("README inaccessible");
      
      const { readme } = await response.json();
      const aiController = new AbortController();
      const aiTimeoutId = setTimeout(() => aiController.abort(), AI_PARSE_TIMEOUT_MS);
      const aiResponse = await fetch("/api/ai/parse-readme", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ readme }),
        signal: aiController.signal,
      });
      clearTimeout(aiTimeoutId);

      if (!aiResponse.ok) {
        const errPayload = await aiResponse.json().catch(() => ({ error: "AI parse failed" }));
        throw new Error(errPayload.error || "AI parse failed");
      }

      const info = await aiResponse.json();
      
      const finalProject: Project = {
        ...placeholder,
        ...info,
        status: "draft" as "draft" | "public",
        isAiLoading: false,
        updatedAt: new Date().toISOString()
      };

      await dbService.saveProject(finalProject);
      setProjects(prev => prev.map(p => p.id === projectId ? finalProject : p));
      setSelectedRepoName("");
      setStatusMsg("Project added as draft. Click the eye icon to publish it.");
      setTimeout(() => setStatusMsg(""), 5000);
    } catch (error: any) {
      setProjects(prev => prev.filter(p => p.id !== projectId));
      const message = error?.name === "AbortError"
        ? "Ingestion timed out while generating the AI card. Please retry."
        : `Ingestion failed: ${error.message}`;
      setStatusMsg(message);
      setTimeout(() => setStatusMsg(""), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleVisibility = async (project: Project) => {
    const newStatus = project.status === "public" ? "draft" : "public";
    const updated: Project = { ...project, status: newStatus as "draft" | "public" };
    setProjects(prev => prev.map(p => p.id === project.id ? updated : p));
    await dbService.saveProject(updated);
  };

  const deleteProject = async (projectId: string) => {
    if (!window.confirm("Permanently delete this project?")) return;
    setProjects(prev => prev.filter(p => p.id !== projectId));
    await dbService.deleteProject(projectId);
  };

  const saveProfileSettings = async () => {
    if (!profile) return;
    const updatedProfile = {
      ...profile,
      tagline,
      philosophy,
      githubUrl,
      socials: {
        linkedin,
        twitter,
        email
      }
    };
    await dbService.saveProfile(updatedProfile);
    await refreshProfile();
    setStatusMsg("Profile updated successfully.");
    setTimeout(() => setStatusMsg(""), 3000);
  };

  const handleResumeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || !user || !profile) return;

    if (file.type !== "application/pdf") {
      setStatusMsg("Only PDF files are allowed.");
      setTimeout(() => setStatusMsg(""), 3000);
      return;
    }

    const maxFileSizeBytes = 10 * 1024 * 1024;
    if (file.size > maxFileSizeBytes) {
      setStatusMsg("Resume must be 10MB or smaller.");
      setTimeout(() => setStatusMsg(""), 3000);
      return;
    }

    setIsUploadingResume(true);
    try {
      const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const storagePath = `resumes/${user.uid}/${Date.now()}-${safeFileName}`;
      const uploadRef = ref(storage, storagePath);

      await uploadBytes(uploadRef, file, { contentType: "application/pdf" });
      const publicUrl = await getDownloadURL(uploadRef);

      if (profile.resumeStoragePath) {
        deleteObject(ref(storage, profile.resumeStoragePath)).catch(() => {
          // Cleanup failure should not block profile update.
        });
      }

      const updatedProfile = {
        ...profile,
        resumeUrl: publicUrl,
        resumeFileName: file.name,
        resumeStoragePath: uploadRef.fullPath,
        resumeUploadedAt: new Date().toISOString(),
      };

      await dbService.saveProfile(updatedProfile);
      await refreshProfile();
      setResumeUrl(publicUrl);
      setResumeFileName(file.name);
      setStatusMsg("Resume uploaded successfully.");
      setTimeout(() => setStatusMsg(""), 3000);
    } catch (error) {
      console.error("Resume upload error:", error);
      setStatusMsg("Failed to upload resume. Check Firebase Storage rules.");
      setTimeout(() => setStatusMsg(""), 4000);
    } finally {
      setIsUploadingResume(false);
    }
  };

  const docId = () => Math.random().toString(36).substr(2, 9);

  return (
    <div className="pt-32 md:pt-40 pb-40">
      {/* Dashboard Header */}
      <section className="mb-24 flex flex-col md:flex-row justify-between items-start gap-12">
        <div className="max-w-2xl">
          <span className="block text-[10px] uppercase tracking-[0.4em] mb-8 font-bold opacity-40">Control Room / Workspace</span>
          <h1 className="text-[56px] md:text-[80px] font-serif italic leading-[0.9] tracking-tighter mb-8">
            Project <br/> Management.
          </h1>
          <p className="text-[18px] font-light opacity-60 leading-relaxed italic">
            You are currently managing the engineering profile of <span className="text-black font-bold border-b border-black">@{profile?.username}</span>.
          </p>
        </div>
        
        <div className="flex flex-col gap-6 w-full md:w-auto">
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="px-8 py-5 border border-zinc-200 text-[11px] uppercase tracking-[0.3em] font-bold hover:bg-black hover:text-white transition-all flex items-center justify-center gap-4"
          >
            <Settings className="w-4 h-4" />
            Profile Settings
          </button>
          <a 
            href={`/${profile?.username}`} 
            target="_blank" 
            rel="noreferrer"
            className="px-8 py-5 bg-zinc-50 text-[11px] uppercase tracking-[0.3em] font-bold hover:bg-zinc-100 transition-all flex items-center justify-center gap-4 border border-zinc-100"
          >
            <Eye className="w-4 h-4" />
            View Public Live
          </a>
        </div>
      </section>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.section 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mb-24 bg-white border border-zinc-100 p-8 md:p-12 overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
              <div className="space-y-8">
                <div>
                  <label className="block text-[9px] uppercase tracking-[0.4em] font-bold opacity-30 mb-4">Technical Tagline</label>
                  <input 
                    type="text" 
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    className="w-full bg-transparent border-b border-zinc-200 py-3 text-[14px] font-bold tracking-tight outline-none focus:border-black transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase tracking-[0.4em] font-bold opacity-30 mb-4">Engineering Summary</label>
                  <textarea 
                    value={philosophy}
                    onChange={(e) => setPhilosophy(e.target.value)}
                    rows={4}
                    className="w-full bg-transparent border border-zinc-100 p-4 text-[14px] font-light leading-relaxed outline-none focus:border-black transition-all"
                  />
                </div>
              </div>
              <div className="space-y-8">
                {!isGitHubAuth && (
                  <div>
                    <label className="block text-[9px] uppercase tracking-[0.4em] font-bold opacity-30 mb-4">GitHub Account URL</label>
                    <input 
                      type="text" 
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      className="w-full bg-transparent border-b border-zinc-200 py-3 text-[14px] font-mono opacity-60 outline-none focus:border-black transition-all mb-8"
                    />
                  </div>
                )}
                {isGitHubAuth && (
                  <div className="border border-zinc-100 bg-zinc-50/80 px-4 py-3 text-[11px] uppercase tracking-widest opacity-70">
                    GitHub connected. Repositories are synced automatically.
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-[9px] uppercase tracking-[0.4em] font-bold opacity-30 mb-4">LinkedIn</label>
                    <input 
                      type="text" 
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                      className="w-full bg-transparent border-b border-zinc-200 py-3 text-[12px] opacity-60 outline-none focus:border-black transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase tracking-[0.4em] font-bold opacity-30 mb-4">Twitter</label>
                    <input 
                      type="text" 
                      value={twitter}
                      onChange={(e) => setTwitter(e.target.value)}
                      className="w-full bg-transparent border-b border-zinc-200 py-3 text-[12px] opacity-60 outline-none focus:border-black transition-all"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[9px] uppercase tracking-[0.4em] font-bold opacity-30 mb-4">Public Email</label>
                    <input 
                      type="text" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-transparent border-b border-zinc-200 py-3 text-[12px] opacity-60 outline-none focus:border-black transition-all"
                    />
                  </div>
                </div>
                <div className="border border-zinc-100 p-5 md:p-6">
                  <span className="block text-[9px] uppercase tracking-[0.4em] font-bold opacity-30 mb-4">Resume (PDF)</span>
                  <div className="flex flex-wrap items-center gap-3 mb-5">
                    <label className="px-5 py-3 border border-zinc-200 text-[10px] uppercase tracking-[0.25em] font-bold hover:bg-black hover:text-white transition-all cursor-pointer inline-flex items-center gap-2">
                      {isUploadingResume ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                      {isUploadingResume ? "Uploading..." : "Upload Resume"}
                      <input
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        onChange={handleResumeUpload}
                        disabled={isUploadingResume}
                      />
                    </label>
                    {resumeUrl && (
                      <a
                        href={resumeUrl}
                        target="_blank"
                        rel="noreferrer"
                        download={resumeFileName || "resume.pdf"}
                        className="px-5 py-3 bg-black text-white text-[10px] uppercase tracking-[0.25em] font-bold hover:bg-zinc-800 transition-all inline-flex items-center gap-2"
                      >
                        <Download className="w-3 h-3" />
                        Download
                      </a>
                    )}
                  </div>

                  {resumeUrl ? (
                    <div>
                      <p className="text-[10px] uppercase tracking-widest opacity-40 mb-3">{resumeFileName || "resume.pdf"}</p>
                      <div className="border border-zinc-100 bg-zinc-50 h-[360px] overflow-hidden">
                        <iframe
                          src={`${resumeUrl}#toolbar=0&navpanes=0&scrollbar=1`}
                          title="Resume Preview"
                          className="w-full h-full"
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="text-[11px] opacity-50 italic">No resume uploaded yet.</p>
                  )}
                </div>
                <div className="pt-8">
                   <button 
                    onClick={saveProfileSettings}
                    className="px-10 py-4 bg-black text-white text-[11px] uppercase tracking-[0.25em] font-bold flex items-center gap-3 hover:bg-zinc-800 transition-all"
                  >
                    <Check className="w-4 h-4" />
                    Save Profile Settings
                  </button>
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Ingestion & List Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Left: Project List */}
        <div className="lg:col-span-8">
           <div className="flex justify-between items-center mb-12 border-b border-zinc-100 pb-8">
            <h2 className="text-[32px] font-serif italic tracking-tighter">Your Projects.</h2>
            <span className="text-[10px] uppercase tracking-widest opacity-40 font-bold">{projects.length} Entries</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {projects.map((project, index) => (
              <div key={project.id} className="relative group">
                <ProjectCard 
                  project={project} 
                  index={index} 
                  onClick={setSelectedProject} 
                />
                
                {/* Dashboard Controls Overlay */}
                <div className="absolute top-8 right-8 z-20 flex flex-col gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all">
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleVisibility(project); }}
                    className={`p-3 backdrop-blur-md border border-white/20 transition-all hover:scale-110 ${project.status === 'public' ? 'bg-green-500/80 text-white' : 'bg-black/80 text-white'}`}
                    title={project.status === 'public' ? "Make Private" : "Make Public"}
                  >
                    {project.status === 'public' ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteProject(project.id); }}
                    className="p-3 bg-red-500/80 backdrop-blur-md border border-white/20 text-white transition-all hover:scale-110"
                    title="Delete Permanently"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="absolute bottom-1 right-1 px-3 py-1 bg-white/90 backdrop-blur-sm text-[8px] uppercase tracking-widest font-bold z-10 border border-zinc-100">
                  {project.status === 'public' ? 'LIVE' : 'DRAFT'}
                </div>
              </div>
            ))}
            
            {projects.length === 0 && (
              <div className="col-span-full py-20 border border-dashed border-zinc-200 rounded-lg flex flex-col items-center justify-center text-center italic opacity-30">
                <p className="text-[14px]">No projects added yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Ingestion Tool */}
        <div className="lg:col-span-4 self-start sticky top-32">
          <div className="p-8 border border-zinc-200 bg-white">
             <span className="block text-[8px] uppercase tracking-[0.4em] font-bold mb-6 opacity-40">Repository Import Tool</span>
             <h4 className="text-[28px] font-serif italic mb-8 tracking-tighter leading-tight">Sync New Repository.</h4>
             
             <div className="space-y-6">
                <div className="relative group">
                  <div className="flex items-center justify-between border-b border-zinc-200 py-3 cursor-pointer group-hover:border-black transition-colors">
                    <select 
                      value={selectedRepoName}
                      onChange={(e) => setSelectedRepoName(e.target.value)}
                      className="w-full bg-transparent text-[11px] uppercase tracking-widest outline-none appearance-none cursor-pointer pr-10"
                    >
                      <option value="" disabled>{isFetchingRepos ? "FETCHING..." : "SELECT A REPOSITORY"}</option>
                      {availableRepos.map(repo => (
                        <option key={repo.name} value={repo.name}>{repo.name.toUpperCase()}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none opacity-40" />
                  </div>
                </div>

                <button 
                  onClick={() => handleAddProject(selectedRepoName)}
                  disabled={isLoading || !selectedRepoName}
                  className="w-full py-5 bg-black text-white text-[10px] uppercase tracking-[0.25em] font-bold disabled:opacity-30 flex items-center justify-center gap-3 hover:bg-zinc-800 transition-all mb-4"
                >
                  {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                  Ingest & Parse README
                </button>
                
                <p className="text-[10px] leading-relaxed opacity-40 italic">
                  Ingestion will automatically generate a technical summary using Gemini AI based on your project's codebase.
                </p>
                <p className="text-[10px] leading-relaxed opacity-40 italic">
                  New entries start as DRAFT. Use the eye button on a card to make it LIVE on your public page.
                </p>

                {statusMsg && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 text-[9px] uppercase tracking-widest font-bold text-zinc-500 pt-4"
                  >
                    {statusMsg}
                  </motion.div>
                )}
             </div>
          </div>
        </div>
      </div>

      <ProjectModal 
        project={selectedProject} 
        onClose={() => setSelectedProject(null)} 
      />
    </div>
  );
};
