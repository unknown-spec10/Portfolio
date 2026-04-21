import React from "react";
import { 
  Code2, 
  Terminal, 
  Layers, 
  Cpu, 
  Sparkles, 
  Globe 
} from "lucide-react";

export const DEFAULT_SKILLS = [
  { name: "Python", icon: <Code2 className="w-4 h-4" /> },
  { name: "TypeScript", icon: <Code2 className="w-4 h-4" /> },
  { name: "React", icon: <Layers className="w-4 h-4" /> },
  { name: "Node.js", icon: <Terminal className="w-4 h-4" /> },
  { name: "Git Internals", icon: <Cpu className="w-4 h-4" /> },
  { name: "Linux", icon: <Terminal className="w-4 h-4" /> },
  { name: "MCP / AI Tooling", icon: <Sparkles className="w-4 h-4" /> },
  { name: "REST APIs", icon: <Globe className="w-4 h-4" /> },
];
