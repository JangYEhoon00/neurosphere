import React, { useState, useMemo, useEffect } from 'react';
import { analyzeConcept, generateQuiz, evaluateMetaCognition } from './services/geminiService';
import { INITIAL_NODES, INITIAL_LINKS } from './utils/constants';
import { Node, Link, GraphData, ScreenState, AnalysisResult, QuizData, MetaResult, FolderStructure } from './utils/types';
import { HomeScreen } from './src/screens/HomeScreen';
import { InputScreen } from './src/screens/InputScreen';
import { GraphScreen } from './src/screens/GraphScreen';
import { MetaCheckScreen } from './src/screens/MetaCheckScreen';
import { QuizScreen } from './src/screens/QuizScreen';

export default function App() {
  const [screen, setScreen] = useState<ScreenState>('onboarding');
  const [graphData, setGraphData] = useState<GraphData>({ nodes: INITIAL_NODES as any, links: INITIAL_LINKS });
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Input / Q&A Logic
  const [inputText, setInputText] = useState('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [editableConcepts, setEditableConcepts] = useState<any[]>([]);
  const [isSaved, setIsSaved] = useState(false); 

  // Save Modal State
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  // Quiz & Meta
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [userExplanation, setUserExplanation] = useState('');
  const [metaResult, setMetaResult] = useState<MetaResult | null>(null);

  // Sidebar Logic (Hierarchical & Filtering)
  const [folderData, setFolderData] = useState<FolderStructure[]>([]);
  const [hiddenCategories, setHiddenCategories] = useState<string[]>([]);

  // Unique categories for selection
  const uniqueCategories = useMemo(() => {
    return Array.from(new Set(graphData.nodes.map(n => n.category))).sort();
  }, [graphData.nodes]);

  // --- Logic to build academic hierarchy from nodes ---
  useEffect(() => {
    const buildTree = () => {
      const tree: FolderStructure[] = [
        { id: 'root_cs', name: 'Computer Science', type: 'folder', isOpen: true, children: [] },
        { id: 'root_math', name: 'Mathematics', type: 'folder', isOpen: false, children: [] },
        { id: 'root_other', name: 'General Knowledge', type: 'folder', isOpen: true, children: [] }
      ];

      const getParentFolder = (cat: string) => {
        const lower = cat.toLowerCase();
        if (['core', 'architecture', 'infrastructure', 'skill', 'training', 'ai', 'data'].some(k => lower.includes(k))) return tree[0]; // CS
        if (['math', 'concept', 'theory'].some(k => lower.includes(k))) return tree[1]; // Math
        return tree[2];
      };

      graphData.nodes.forEach(node => {
        const root = getParentFolder(node.category);
        
        // 2nd Level: Use Category as Subfolder
        let subFolder = root.children?.find(c => c.name === node.category);
        if (!subFolder) {
          subFolder = { 
            id: `sub_${node.category}`, 
            name: node.category, 
            type: 'folder', 
            isOpen: false, 
            children: [] 
          };
          root.children?.push(subFolder);
        }

        // 3rd Level: The Node itself
        subFolder.children?.push({
          id: `file_${node.id}`,
          name: node.label,
          type: 'file',
          nodeId: node.id
        });
      });

      return tree;
    };

    setFolderData(buildTree());
  }, [graphData.nodes]);

  // --- Handlers ---

  const handleAsk = async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    setIsSaved(false); 
    const result = await analyzeConcept(inputText);
    setIsLoading(false);
    if (result) {
      setAnalysisResult(result);
      // Initialize editable concepts state
      setEditableConcepts(result.concepts.map(c => ({...c})));
    }
  };

  // Open Save Modal
  const handleInitialSave = () => {
    if (!analysisResult || isSaved) return;
    setIsSaveModalOpen(true);
  };

  // Execute Save with Selected Directory/Category
  const handleFinalSave = (targetCategory: string) => {
    if (!analysisResult) return;

    const newNodes: Node[] = editableConcepts.map((c, i) => ({
      id: `new_${Date.now()}_${i}`,
      label: c.label,
      status: c.status as any,
      val: 25,
      category: targetCategory, // Overwrite with user selected folder/category
      description: c.description
    }));

    const newLinks: Link[] = [];
    // Find a node to link to in the same category, or root if none
    const sameCatNode = graphData.nodes.find(n => n.category === targetCategory);
    const targetId = sameCatNode ? sameCatNode.id : (graphData.nodes.length > 0 ? graphData.nodes[0].id : 'root');
    
    newNodes.forEach((n, i) => {
        newLinks.push({ source: targetId, target: n.id });
        if (i < newNodes.length - 1) {
            newLinks.push({ source: n.id, target: newNodes[i+1].id });
        }
    });

    setGraphData(prev => ({
      nodes: [...prev.nodes, ...newNodes],
      links: [...prev.links, ...newLinks]
    }));
    
    setIsSaved(true);
    setIsSaveModalOpen(false);
  };

  // Sidebar Folder Actions
  const toggleFolder = (id: string) => {
    const toggleRecursive = (items: FolderStructure[]): FolderStructure[] => {
      return items.map(item => {
        if (item.id === id) return { ...item, isOpen: !item.isOpen };
        if (item.children) return { ...item, children: toggleRecursive(item.children) };
        return item;
      });
    };
    setFolderData(prev => toggleRecursive(prev));
  };

  const renameFolder = (id: string, newName: string) => {
    const renameRecursive = (items: FolderStructure[]): FolderStructure[] => {
      return items.map(item => {
        if (item.id === id) return { ...item, name: newName };
        if (item.children) return { ...item, children: renameRecursive(item.children) };
        return item;
      });
    };
    setFolderData(prev => renameRecursive(prev));
  };

  const toggleCategoryVisibility = (categoryName: string) => {
    setHiddenCategories(prev => {
        if (prev.includes(categoryName)) {
            return prev.filter(c => c !== categoryName);
        } else {
            return [...prev, categoryName];
        }
    });
  };

  const startQuiz = async () => {
    if (!selectedNode) return;
    setIsLoading(true);
    const quiz = await generateQuiz(selectedNode.label);
    setIsLoading(false);
    if (quiz) {
      setQuizData(quiz);
      setScreen('quiz');
    }
  };

  const submitMetaCheck = async () => {
    if (!selectedNode) return;
    setIsLoading(true);
    const result = await evaluateMetaCognition(selectedNode.label, userExplanation);
    setIsLoading(false);
    if (result) {
      setMetaResult(result);
      setGraphData(prev => ({
        nodes: prev.nodes.map(n => n.id === selectedNode.id ? { ...n, status: result.status } : n),
        links: prev.links
      }));
    }
  };

  return (
    <>
      {screen === 'onboarding' && <HomeScreen setScreen={setScreen} />}
      
      {screen === 'input' && (
        <InputScreen 
          inputText={inputText}
          setInputText={setInputText}
          handleAsk={handleAsk}
          isLoading={isLoading}
          analysisResult={analysisResult}
          setAnalysisResult={setAnalysisResult}
          editableConcepts={editableConcepts}
          isSaved={isSaved}
          setIsSaved={setIsSaved}
          setScreen={setScreen}
          handleInitialSave={handleInitialSave}
          isSaveModalOpen={isSaveModalOpen}
          setIsSaveModalOpen={setIsSaveModalOpen}
          handleFinalSave={handleFinalSave}
          uniqueCategories={uniqueCategories}
        />
      )}

      {screen === 'graph' && (
        <GraphScreen 
          screen={screen}
          setScreen={setScreen}
          folderData={folderData}
          toggleFolder={toggleFolder}
          setSelectedNode={setSelectedNode}
          renameFolder={renameFolder}
          selectedNode={selectedNode}
          toggleCategoryVisibility={toggleCategoryVisibility}
          hiddenCategories={hiddenCategories}
          graphData={graphData}
          startQuiz={startQuiz}
        />
      )}

      {screen === 'metacheck' && (
        <MetaCheckScreen 
          setScreen={setScreen}
          metaResult={metaResult}
          selectedNode={selectedNode}
          userExplanation={userExplanation}
          setUserExplanation={setUserExplanation}
          submitMetaCheck={submitMetaCheck}
          isLoading={isLoading}
        />
      )}

      {screen === 'quiz' && (
        <QuizScreen 
          setScreen={setScreen}
          quizData={quizData}
        />
      )}
    </>
  );
}