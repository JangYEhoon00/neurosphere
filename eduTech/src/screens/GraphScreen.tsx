import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { ScreenState, GraphData, Node, FolderStructure, Link } from '../utils/types';
import { ThreeGraph } from '../components/ThreeGraph';
import { BackButton } from '../components/BackButton';
import { GraphSidebar } from '../components/GraphSidebar';
import { Plus } from 'lucide-react';
import { generateUUID } from '../utils/uuid';

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
  removeNode: (nodeId: string) => void;
  removeCategory: (category: string) => void;
  addNodesAndLinks: (nodes: Node[], links: Link[]) => void;
  onSignOut: () => void;
  onClearAllData: () => void;
}

export const GraphScreen = ({ 
  screen, setScreen, folderData, toggleFolder, setSelectedNode, renameFolder, 
  selectedNode, toggleCategoryVisibility, hiddenCategories, graphData, startQuiz,
  removeNode, removeCategory, addNodesAndLinks, onSignOut, onClearAllData
}: GraphScreenProps) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isAddingNode, setIsAddingNode] = useState(false);
  const [newNodeLabel, setNewNodeLabel] = useState('');
  const [newNodeCategory, setNewNodeCategory] = useState('');

  const handleAddNode = () => {
    if (!newNodeLabel.trim()) return;

    const category = newNodeCategory.trim() || '일반';
    const newNode: Node = {
      id: generateUUID(),
      label: newNodeLabel.trim(),
      status: 'new',
      val: 25,
      category,
      description: ''
    };

    const newLinks: Link[] = [];
    // Link to first existing node or no links if empty
    if (graphData.nodes.length > 0) {
      newLinks.push({ source: graphData.nodes[0].id, target: newNode.id });
    }

    addNodesAndLinks([newNode], newLinks);
    
    // Show success toast
    toast.success(`"${newNodeLabel.trim()}" 노드가 추가되었습니다! ✨`, {
      style: {
        background: '#1e293b',
        color: '#fff',
        border: '1px solid #6366f1',
      },
    });
    
    setNewNodeLabel('');
    setNewNodeCategory('');
    setIsAddingNode(false);
  };

  return (
    <div className="h-screen bg-[#020617] relative overflow-hidden flex">
      <BackButton screen={screen} setScreen={setScreen} />
      
      <GraphSidebar
        screen={screen}
        folderData={folderData}
        toggleFolder={toggleFolder}
        graphData={graphData}
        setSelectedNode={setSelectedNode}
        renameFolder={renameFolder}
        selectedNode={selectedNode}
        toggleCategoryVisibility={toggleCategoryVisibility}
        hiddenCategories={hiddenCategories}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        removeNode={removeNode}
        removeCategory={removeCategory}
        onSignOut={onSignOut}
        onClearAllData={onClearAllData}
      />

      {/* 3D Graph Area */}
      <div className="flex-1 relative">
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

        {/* Add Node Button */}
        <button
          onClick={() => setIsAddingNode(true)}
          className="absolute bottom-8 right-8 w-14 h-14 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 z-10"
          title="노드 추가"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* Add Node Modal */}
      {isAddingNode && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 w-full max-w-md mx-4 shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-6">새 노드 추가</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  노드 이름 *
                </label>
                <input
                  type="text"
                  value={newNodeLabel}
                  onChange={(e) => setNewNodeLabel(e.target.value)}
                  placeholder="예: 리액트, 데이터베이스, 알고리즘"
                  className="w-full bg-slate-800 text-white px-4 py-3 rounded-xl border border-slate-700 focus:border-indigo-500 outline-none transition-all"
                  autoFocus
                  onKeyPress={(e) => e.key === 'Enter' && handleAddNode()}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  카테고리 (선택사항)
                </label>
                <input
                  type="text"
                  value={newNodeCategory}
                  onChange={(e) => setNewNodeCategory(e.target.value)}
                  placeholder="예: 프로그래밍, 수학, 과학"
                  className="w-full bg-slate-800 text-white px-4 py-3 rounded-xl border border-slate-700 focus:border-indigo-500 outline-none transition-all"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddNode()}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setIsAddingNode(false);
                  setNewNodeLabel('');
                  setNewNodeCategory('');
                }}
                className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-all"
              >
                취소
              </button>
              <button
                onClick={handleAddNode}
                disabled={!newNodeLabel.trim()}
                className="flex-1 px-4 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                추가
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
