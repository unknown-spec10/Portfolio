import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ArrowUpRight } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Project } from "../types";

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ project, onClose }) => {
  return (
    <AnimatePresence>
      {project && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-12">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#FCFCFC]/90 backdrop-blur-md"
          />
          
          {/* Modal Content */}
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative w-full max-w-[1000px] h-full max-h-[85vh] md:max-h-[800px] bg-white border border-zinc-100 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col md:flex-row"
          >
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 md:top-8 md:right-8 z-50 p-3 bg-black text-white hover:bg-zinc-800 transition-all font-bold"
            >
              <X className="w-4 h-4 md:w-5 md:h-5" />
            </button>

            {/* Left: Key Visual */}
            <div className="w-full md:w-[45%] h-56 md:h-full bg-zinc-50 flex flex-col items-center justify-center p-8 md:p-12 relative overflow-hidden bg-gradient-to-br from-zinc-100 to-white">
              <div className="absolute inset-x-0 top-8 md:top-12 px-12 text-center pointer-events-none">
                <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-[0.6em] opacity-20">Volume 01 / Case Study</span>
              </div>
              
              <h2 className="text-[32px] md:text-[56px] font-serif italic text-center leading-[0.8] tracking-tighter mb-8 break-words max-w-full px-6 md:px-0">
                {project.name}
              </h2>
              
              <div className="w-12 h-[1px] bg-black/20"></div>

              <div className="absolute bottom-6 md:bottom-12 inset-x-0 px-8 md:px-12 flex justify-center flex-wrap gap-2">
                {project.tags?.map(tag => (
                  <span key={tag} className="text-[7px] md:text-[8px] uppercase tracking-widest border border-black/10 px-2 md:px-3 py-1 font-bold">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: Narrative Details */}
            <div className="flex-grow p-6 md:p-20 overflow-y-auto bg-white">
              <div className="max-w-xl">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-10 text-left">
                  <span className="block text-[9px] md:text-[10px] uppercase tracking-[0.4em] font-bold opacity-30">Full Project Narrative</span>
                  <span className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] px-3 md:px-4 py-2 bg-zinc-50 border border-zinc-100 font-bold italic">{project.role}</span>
                </div>
                
                <h3 className="text-[22px] md:text-[28px] font-serif tracking-tight mb-10 md:mb-12 leading-snug">
                  {project.name} — An exploration into refined software engineering and precise visual design.
                </h3>
                
                <div className="prose prose-zinc prose-sm mb-16 max-w-none">
                  <ReactMarkdown 
                    components={{
                      p: ({ children }) => <p className="text-[14px] md:text-[15px] leading-relaxed text-zinc-600 font-light mb-8">{children}</p>,
                      h1: ({ children }) => <h1 className="text-[18px] md:text-[20px] font-bold mb-4">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-[16px] md:text-[18px] font-bold mb-3">{children}</h2>,
                      ul: ({ children }) => <ul className="list-disc pl-5 mb-8 space-y-2 text-[13px] md:text-[14px] text-zinc-500 font-light">{children}</ul>,
                      li: ({ children }) => <li>{children}</li>,
                    }}
                  >
                    {project.narrative}
                  </ReactMarkdown>
                </div>

                <div className="grid grid-cols-2 gap-12 pt-12 border-t border-zinc-100">
                  <div>
                    <span className="block text-[9px] uppercase tracking-widest opacity-40 mb-4">Repository Access</span>
                    <a 
                      href={project.url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-widest hover:translate-x-2 transition-transform duration-300"
                    >
                      GitHub Files <ArrowUpRight className="w-4 h-4" />
                    </a>
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase tracking-widest opacity-40 mb-4">Project ID</span>
                    <span className="text-[11px] font-bold tracking-widest opacity-40">#{project.id?.toUpperCase()}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
