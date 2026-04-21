import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Download, Sparkles } from "lucide-react";
import { ProjectCard } from "../components/ProjectCard";
import { ProjectModal } from "../components/ProjectModal";
import { dbService } from "../services/dbService";
import { Project } from "../types";

export const Home: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    const fetchPublicProjects = async () => {
      try {
        const publicEntries = await dbService.getPublicProjects();
        setProjects(publicEntries);
      } catch (err) {
        console.error("Failed to fetch gallery:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPublicProjects();
  }, []);

  return (
    <div className="pt-32 md:pt-40">
      {/* Home Hero */}
      <section className="mb-32">
        <span className="block text-[10px] uppercase tracking-[0.4em] mb-8 font-bold opacity-40">Project Feed</span>
        <h1 className="text-[60px] sm:text-[100px] md:text-[140px] font-serif italic leading-[0.8] tracking-tighter mb-12">
          Dev <br/> Showcase.
        </h1>
        <p className="max-w-xl text-[18px] md:text-[20px] font-light opacity-60 leading-relaxed mb-12">
          Exploring production-grade builds from engineers across the network. A curated feed of systems, applications, and code architecture.
        </p>
      </section>

      {/* Gallery Grid */}
      <section className="border-t border-black pt-16 mb-40">
        <div className="flex justify-between items-baseline mb-20">
          <h2 className="text-[40px] md:text-[56px] font-serif italic tracking-tighter">Projects.</h2>
          <span className="text-[9px] md:text-[10px] uppercase tracking-[0.3em] opacity-40">{projects.length} Projects / Public</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
          {loading ? (
            <div className="col-span-full py-32 flex flex-col items-center justify-center italic opacity-30">
              <Sparkles className="w-8 h-8 animate-pulse mb-4" />
              <span className="text-[12px] uppercase tracking-widest font-bold">Loading Project Feed...</span>
            </div>
          ) : projects.length === 0 ? (
             <div className="col-span-full py-32 border-t border-b border-zinc-200 flex flex-col items-center justify-center text-center italic opacity-40">
                <span className="text-[12px] uppercase tracking-widest font-bold mb-4">No public projects yet</span>
                <p>No projects have been published yet.</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {projects.map((project, index) => (
                <ProjectCard 
                  key={project.id} 
                  project={project} 
                  index={index} 
                  onClick={setSelectedProject} 
                />
              ))}
            </AnimatePresence>
          )}
        </div>
      </section>

      <ProjectModal 
        project={selectedProject} 
        onClose={() => setSelectedProject(null)} 
      />
    </div>
  );
};
