import React, { useState } from 'react';
import { ScreenState, GraphData, Node, FolderStructure } from '../utils/types';
import { ThreeGraph } from '../components/ThreeGraph';
import { BackButton } from '../components/BackButton';
import { GraphSidebar } from '../components/GraphSidebar';


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
}

export const GraphScreen = ({ 
  screen, setScreen, folderData, toggleFolder, setSelectedNode, renameFolder, 
  selectedNode, toggleCategoryVisibility, hiddenCategories, graphData, startQuiz,
  removeNode, removeCategory
}: GraphScreenProps) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

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
      </div>


    </div>
  );
};

