import React from "react";
import { motion } from "motion/react";
import { Loader2, Plus, ArrowUpRight } from "lucide-react";
import { Project } from "../types";

interface ProjectCardProps {
  project: Project;
  index: number;
  onClick: (project: Project) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, index, onClick }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={!project.isAiLoading ? { 
        y: -10,
        boxShadow: "0 30px 60px -20px rgba(0,0,0,0.15)"
      } : {}}
      transition={{ 
        delay: index * 0.1,
      }}
      onClick={() => !project.isAiLoading && onClick(project)}
      className={`group flex flex-col bg-white border border-transparent transition-all overflow-hidden p-6 hover:border-zinc-100 relative ${project.isAiLoading ? 'cursor-wait' : 'cursor-pointer'}`}
    >
      {project.isAiLoading && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex flex-col items-center justify-center pointer-events-none">
          <div className="flex flex-col items-center">
            <Loader2 className="w-8 h-8 animate-spin opacity-20 mb-4" />
            <span className="text-[9px] uppercase tracking-[0.4em] font-bold opacity-30 animate-pulse text-zinc-900">Archiving Entry</span>
          </div>
        </div>
      )}
      
      <div className={`w-full aspect-[4/5] bg-zinc-50 mb-8 relative overflow-hidden transition-all duration-700 bg-gradient-to-tr from-zinc-100 to-white ${project.isAiLoading ? 'grayscale' : ''}`}>
        {/* Decorative Background Text */}
        {!project.isAiLoading && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.02] select-none overflow-hidden">
            <span className="text-[140px] font-serif italic whitespace-nowrap rotate-[-15deg]">
              {project.name}
            </span>
          </div>
        )}

        {/* Top Info */}
        <div className="absolute top-8 left-8 right-8 flex justify-between items-start">
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-30">Entry {String(index + 1).padStart(2, '0')}</span>
          {!project.isAiLoading && (
            <div className="p-2 bg-white/50 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300">
              <Plus className="w-3 h-3" />
            </div>
          )}
        </div>

        {/* Center Content */}
        <div className={`absolute inset-0 flex flex-col items-center justify-center p-8 text-center transition-transform duration-700 ${!project.isAiLoading ? 'group-hover:scale-105' : ''}`}>
          <h3 className={`text-[36px] md:text-[44px] font-serif italic leading-[0.85] tracking-tighter mb-4 text-zinc-900 ${project.isAiLoading ? 'opacity-20 animate-pulse' : ''}`}>
            {project.name}
          </h3>
          <div className={`w-8 h-[1px] bg-black/20 transition-all duration-500 ${!project.isAiLoading ? 'group-hover:w-16' : ''}`}></div>
        </div>

        {/* Tags on Hover */}
        {!project.isAiLoading && (
          <div className="absolute inset-x-0 bottom-0 p-8 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
            <div className="flex flex-wrap gap-2">
              {project.tags.slice(0, 3).map(tag => (
                <span key={tag} className="text-[8px] uppercase tracking-widest bg-zinc-900 text-white px-2 py-1 font-bold">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex-grow">
        <p className={`text-[13px] leading-relaxed font-light mb-6 line-clamp-2 ${project.isAiLoading ? 'opacity-20 animate-pulse' : 'opacity-50'}`}>
          {project.description}
        </p>
        {!project.isAiLoading && (
          <div className="flex items-center justify-between group-hover:translate-x-2 transition-transform duration-500">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">View Narrative</span>
            <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-40 transition-all" />
          </div>
        )}
        {project.isAiLoading && (
          <div className="h-[10px] w-24 bg-zinc-100 animate-pulse"></div>
        )}
      </div>
    </motion.div>
  );
};
