import React from 'react';
import { Node } from '../utils/types';
import { Edit3, Mic, BookOpen, Clock, Hash } from 'lucide-react';

interface NodePageProps {
  node: Node;
}

export const NodePage = ({ node }: NodePageProps) => {
  return (
    <div className="h-full w-full bg-[#020617] text-white overflow-y-auto custom-scrollbar">
      <div className="max-w-5xl mx-auto p-8 pt-20">
        {/* Header Section */}
        <header className="mb-12 relative">
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold border border-indigo-500/20 uppercase tracking-wider flex items-center gap-2">
              <Hash className="w-3 h-3" />
              {node.category}
            </span>
            <span className="flex items-center gap-2 text-slate-500 text-xs font-medium">
              <Clock className="w-3 h-3" />
              Last updated just now
            </span>
          </div>

          <h1 className="text-6xl font-black text-white mb-8 tracking-tight leading-tight">
            {node.label}
          </h1>

          <div className="flex flex-wrap gap-4 mb-8">
            <button className="px-6 py-3 bg-white text-slate-900 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors flex items-center gap-2">
              <Edit3 className="w-4 h-4" />
              Start Writing
            </button>
            <button className="px-6 py-3 bg-slate-800 text-white rounded-xl font-bold text-sm border border-slate-700 hover:bg-slate-700 transition-colors flex items-center gap-2">
              <Mic className="w-4 h-4 text-emerald-400" />
              Voice Note
            </button>
          </div>

          <p className="text-xl text-slate-400 leading-relaxed max-w-3xl font-light border-l-4 border-indigo-500/30 pl-6">
            {node.description || "No description available for this node. Start by adding some notes or recording your thoughts to build your knowledge base."}
          </p>
        </header>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Editor Area */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden min-h-[600px] relative group">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/50 pointer-events-none" />
              
              <div className="p-8">
                <div className="flex items-center gap-3 mb-8 text-slate-500 border-b border-slate-800 pb-4">
                  <BookOpen className="w-5 h-5 text-indigo-400" />
                  <span className="font-medium">Knowledge Content</span>
                </div>
                
                <div className="prose prose-invert max-w-none">
                  <p className="text-slate-400 italic text-lg">
                    This page is currently empty. Click "Start Writing" to add content about <span className="text-indigo-400 font-medium">{node.label}</span>.
                  </p>
                  <div className="mt-8 space-y-4">
                    <div className="h-4 bg-slate-800/50 rounded w-3/4 animate-pulse" />
                    <div className="h-4 bg-slate-800/50 rounded w-full animate-pulse" />
                    <div className="h-4 bg-slate-800/50 rounded w-5/6 animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Side Widgets */}
          <div className="space-y-6">
            <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800">
              <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">Related Concepts</h3>
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 text-sm text-slate-300 hover:border-indigo-500/50 transition-colors cursor-pointer">
                  Concept A
                </div>
                <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 text-sm text-slate-300 hover:border-indigo-500/50 transition-colors cursor-pointer">
                  Concept B
                </div>
              </div>
            </div>

            <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800">
              <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 rounded-xl bg-slate-800/30">
                  <div className="text-2xl font-bold text-white mb-1">0</div>
                  <div className="text-xs text-slate-500">Notes</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-slate-800/30">
                  <div className="text-2xl font-bold text-white mb-1">0m</div>
                  <div className="text-xs text-slate-500">Time</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
