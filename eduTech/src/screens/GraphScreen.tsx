import React from 'react';
import { ScreenState, GraphData, Node, FolderStructure } from '../utils/types';
import { ThreeGraph } from '../components/ThreeGraph';
import { BackButton } from '../components/BackButton';
import { GraphSidebar } from '../components/GraphSidebar';
import { NodeDetailPanel } from '../components/NodeDetailPanel';

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
    />

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
    </div>

    {/* Right Detail Panel */}
    {selectedNode && (
      <NodeDetailPanel
        selectedNode={selectedNode}
        setSelectedNode={setSelectedNode}
        setScreen={setScreen}
        graphData={graphData}
        startQuiz={startQuiz}
      />
    )}
  </div>
);
