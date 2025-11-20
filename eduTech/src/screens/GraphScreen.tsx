import React from 'react';
import { FileText, Search, Plus, X, Mic, HelpCircle, ArrowLeft } from 'lucide-react';
import { ScreenState, GraphData, Node, FolderStructure } from '../../types';
import { ThreeGraph } from '../components/ThreeGraph';
import { FolderItem } from '../components/FolderItem';
import { BackButton } from '../components/BackButton';

interface GraphScreenProps {
  screen: ScreenState;
  setScreen: (screen: ScreenState) => void;
  folderData: FolderStructure[];
  toggleFolder: (id: string) => void;
  setSelectedNode: (node: Node | null) => void;
  renameFolder: (id: string, newName: string) => void;
  selectedNode: Node | null;
  toggleCategoryVisibility: (category: string) => void;
  hiddenCategories: string[];
  graphData: GraphData;
  startQuiz: () => void;
}

export const GraphScreen = ({ 
  screen, setScreen, folderData, toggleFolder, setSelectedNode, renameFolder, 
  selectedNode, toggleCategoryVisibility, hiddenCategories, graphData, startQuiz 
}: GraphScreenProps) => (
  <div className="h-screen bg-[#020617] relative overflow-hidden flex">
    <BackButton screen={screen} setScreen={setScreen} />
    
    {/* Sidebar with Folders */}
    <div className={`absolute left-0 top-0 h-full w-80 bg-slate-900/95 backdrop-blur-xl border-r border-slate-800 z-10 shadow-2xl flex flex-col transform transition-transform duration-500 ease-in-out ${screen === 'graph' ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="p-6 pt-20 border-b border-slate-800">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-400" /> 지식 보관함
        </h2>
        <div className="mt-4 relative group">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500 group-focus-within:text-white transition-colors duration-300" />
          <input type="text" placeholder="개념 검색..." className="w-full bg-slate-800/50 text-sm text-white rounded-lg pl-10 pr-4 py-2.5 border border-slate-700 focus:border-indigo-500 outline-none transition-all duration-300" />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
         {folderData.map(item => (
           <FolderItem 
             key={item.id} 
             item={item} 
             level={0} 
             toggleFolder={toggleFolder} 
             onNodeClick={(id: string) => setSelectedNode(graphData.nodes.find(n => n.id === id) || null)}
             onRename={renameFolder}
             selectedNodeId={selectedNode?.id}
             toggleCategoryVisibility={toggleCategoryVisibility}
             hiddenCategories={hiddenCategories}
           />
         ))}
      </div>

      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
         <div className="flex justify-between text-xs text-slate-500 font-bold mb-2">
           <span>MEMORY STATUS</span>
           <span>82%</span>
         </div>
         <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
           <div className="bg-indigo-500 h-full w-[82%] rounded-full" />
         </div>
      </div>
    </div>

    {/* 3D Graph Area */}
    <div className={`flex-1 relative transition-all duration-500 ease-in-out ${selectedNode ? 'pr-96' : ''}`}>
       <ThreeGraph 
          data={graphData} 
          onNodeClick={(id) => {
             if (id) {
               const node = graphData.nodes.find(n => n.id === id);
               setSelectedNode(node || null);
             } else {
               setSelectedNode(null);
             }
          }}
          selectedNodeId={selectedNode?.id}
          hiddenCategories={hiddenCategories}
       />
       
       {/* Add Button */}
       <button 
          onClick={() => setScreen('input')}
          className="absolute bottom-8 right-8 w-14 h-14 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-2xl shadow-indigo-500/40 flex items-center justify-center transition-all duration-300 hover:scale-105 hover:shadow-indigo-500/60 z-20"
       >
         <Plus className="w-6 h-6" />
       </button>
    </div>

    {/* Right Detail Panel */}
    {selectedNode && (
      <div className="absolute right-0 top-0 h-full w-96 bg-slate-900/95 backdrop-blur-xl border-l border-slate-800 z-20 shadow-2xl flex flex-col p-6 pt-20 animate-smooth-slide-left overflow-y-auto">
         <div className="flex justify-between items-start mb-6">
           <div>
             <span className="text-xs font-bold text-indigo-400 bg-indigo-900/30 border border-indigo-500/30 px-2 py-1 rounded uppercase tracking-wider">
               {selectedNode.category}
             </span>
             <h2 className="text-2xl font-bold text-white mt-3">{selectedNode.label}</h2>
           </div>
           <button onClick={() => setSelectedNode(null)} className="text-slate-500 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
         </div>

         <div className="space-y-3 mb-8">
           <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
              <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Description</h4>
              <p className="text-slate-300 text-sm leading-relaxed">
                {selectedNode.description || "설명이 없습니다."}
              </p>
           </div>
           
           <div className="grid grid-cols-2 gap-3">
             <button 
              onClick={() => setScreen('metacheck')}
              className="py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold text-sm border border-slate-700 transition-all duration-300 flex flex-col items-center justify-center gap-2 hover:border-slate-500"
             >
               <Mic className="w-4 h-4 text-emerald-400" /> 
               <span>말하기 (메타인지)</span>
             </button>
             <button 
              onClick={startQuiz}
              className="py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold text-sm border border-slate-700 transition-all duration-300 flex flex-col items-center justify-center gap-2 hover:border-slate-500"
             >
               <HelpCircle className="w-4 h-4 text-amber-400" /> 
               <span>퀴즈 풀기</span>
             </button>
           </div>
         </div>

         <div className="border-t border-slate-800 pt-6">
            <h4 className="text-xs font-bold text-slate-500 uppercase mb-4">Connections</h4>
            <div className="space-y-2">
              {graphData.links
                .filter(l => l.source === selectedNode.id || l.target === selectedNode.id)
                .map((l, i) => {
                   const targetId = l.source === selectedNode.id ? l.target : l.source;
                   const targetNode = graphData.nodes.find(n => n.id === targetId);
                   return targetNode ? (
                     <button 
                       key={i} 
                       onClick={() => setSelectedNode(targetNode)}
                       className="w-full text-left p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800 border border-slate-800 hover:border-slate-600 transition-all duration-300 flex items-center justify-between group"
                     >
                       <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{targetNode.label}</span>
                       <ArrowLeft className="w-3 h-3 rotate-180 text-slate-600 group-hover:text-indigo-400 transition-colors" />
                     </button>
                   ) : null;
                })
              }
            </div>
         </div>
      </div>
    )}
  </div>
);
