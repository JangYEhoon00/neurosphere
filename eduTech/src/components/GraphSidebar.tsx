import React from 'react';
import { FileText, Search } from 'lucide-react';
import { FolderStructure, GraphData, Node, ScreenState } from '../utils/types';
import { FolderItem } from './FolderItem';

interface GraphSidebarProps {
  screen: ScreenState;
  folderData: FolderStructure[];
  toggleFolder: (id: string) => void;
  graphData: GraphData;
  setSelectedNode: (node: Node | null) => void;
  renameFolder: (id: string, newName: string) => void;
  selectedNode: Node | null;
  toggleCategoryVisibility: (category: string) => void;
  hiddenCategories: string[];
}

export const GraphSidebar = ({
  screen,
  folderData,
  toggleFolder,
  graphData,
  setSelectedNode,
  renameFolder,
  selectedNode,
  toggleCategoryVisibility,
  hiddenCategories
}: GraphSidebarProps) => (
  <div className={`absolute left-0 top-0 h-full w-80 bg-slate-900/95 backdrop-blur-xl border-r border-slate-800 z-10 shadow-2xl flex flex-col transform transition-transform duration-500 ease-in-out ${screen === 'graph' ? 'translate-x-0' : '-translate-x-full'}`}>
    <div className="p-6 pt-20 border-b border-slate-800">
      <h2 className="text-xl font-bold text-white flex items-center gap-2">
        <FileText className="w-5 h-5 text-indigo-400" /> 지식 보관함
      </h2>
      <div className="mt-4 relative group">
        <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500 group-focus-within:text-white transition-colors duration-300" />
        <input 
          type="text" 
          placeholder="개념 검색..." 
          className="w-full bg-slate-800/50 text-sm text-white rounded-lg pl-10 pr-4 py-2.5 border border-slate-700 focus:border-indigo-500 outline-none transition-all duration-300" 
        />
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
);
