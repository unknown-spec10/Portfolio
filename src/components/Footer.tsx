import React from "react";

export const Footer: React.FC = () => {
  return (
    <footer className="px-6 md:px-12 py-12 border-t border-black flex flex-col md:flex-row justify-between items-center gap-12">
      <div className="flex flex-wrap justify-center md:justify-start gap-12 md:gap-24">
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <span className="text-[9px] uppercase tracking-widest opacity-40 mb-1">Scale</span>
          <span className="text-[11px] font-bold tracking-tight uppercase">Multi-User Dev Platform v1.0</span>
        </div>
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <span className="text-[9px] uppercase tracking-widest opacity-40 mb-1">Status</span>
          <span className="text-[11px] font-bold tracking-tight uppercase">Distributed Network</span>
        </div>
      </div>
      <div className="text-[10px] uppercase tracking-[0.4em] font-bold text-center md:text-right opacity-60 md:opacity-100">
        Engineering Platform &bull; {new Date().getFullYear()}
      </div>
    </footer>
  );
};
