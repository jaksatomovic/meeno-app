import React, { useState, useCallback, useMemo } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  Position,
} from '@xyflow/react';
import "@xyflow/react/dist/style.css";
import Footer from "@/components/Common/UI/Footer";
import { ChatHeader } from "@/components/Assistant/ChatHeader";
import HistoryList from "@/components/Common/HistoryList";

// Custom node for files/documents
function FileNode({ data }) {
  return (
    <div className="rounded-lg border border-blue-400 bg-blue-50 p-3 min-w-[120px] shadow-md">
      <div className="font-semibold text-blue-700 truncate">{data.label}</div>
      <div className="text-xs text-blue-500">{data.comment || 'Dokument'}</div>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

// Custom node for tags
function TagNode({ data }) {
  return (
    <div className="rounded-full border border-green-400 bg-green-50 px-4 py-1 shadow text-green-700 text-xs font-medium">
      #{data.label}
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

const initialNodes = [
  {
    id: "1",
    type: "fileNode",
    data: { label: "knjiga.pdf", comment: "Glavni izvor" },
    position: { x: 250, y: 0 },
  },
  {
    id: "2",
    type: "fileNode",
    data: { label: "slika za Poglavlje 2", comment: "Slika za poglavlje" },
    position: { x: 100, y: 100 },
  },
  {
    id: "3",
    type: "fileNode",
    data: { label: "beta-verzija .docx", comment: "Beta verzija dokumenta" },
    position: { x: 400, y: 100 },
  },
  {
    id: "4",
    type: "tagNode",
    data: { label: "istorija" },
    position: { x: 250, y: 180 },
  },
  {
    id: "5",
    type: "tagNode",
    data: { label: "literatura" },
    position: { x: 100, y: 220 },
  },
];

const initialEdges = [
  { id: "e1-4", source: "1", target: "4" },
  { id: "e2-5", source: "2", target: "5" },
  { id: "e3-4", source: "3", target: "4" },
];

interface ProjectMapProps {
  isTauri: boolean;
  hideCoco?: () => void;
  openSetting?: () => void;
  setWindowAlwaysOnTop?: (isPinned: boolean) => Promise<void>;
}

const ProjectMap = ({ isTauri, hideCoco, openSetting = () => { }, setWindowAlwaysOnTop = async () => { } }: ProjectMapProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(false);

  // React Flow interakcija
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const onConnect = useCallback((params: any) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  // Memoizuj nodeTypes
  const nodeTypes = useMemo(() => ({ fileNode: FileNode, tagNode: TagNode }), []);

  const handleSearch = (keyword: string) => {
    console.log(keyword);
  };

  return (
    <div
      data-tauri-drag-region={isTauri}
      className="flex flex-col w-screen h-screen bg-white dark:bg-black overflow-hidden relative rounded-xl border border-[#E6E6E6] dark:border-[#272626]"
    >
      {/* Sidebar */}
      {isSidebarOpen ? (
        <div
          className={`fixed inset-y-0 left-0 z-50 w-64 transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            } transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:block bg-gray-100 dark:bg-gray-800`}
        >
          <HistoryList
            list={[]}
            active={undefined}
            onSearch={handleSearch}
            onRefresh={() => { }}
            onSelect={() => { }}
            onRename={() => { }}
            onRemove={() => { }}
          />
        </div>
      ) : null}
      {/* ChatHeader na vrhu */}
      <ChatHeader
        onCreateNewChat={() => { }}
        onOpenChatAI={() => { }}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={() => setIsSidebarOpen((v: boolean) => !v)}
        activeChat={undefined}
        reconnect={() => { }}
        isLogin={isLogin}
        setIsLogin={setIsLogin}
        isChatPage={false}
        showChatHistory={true}
        assistantIDs={[]}
      />
      {/* Mapa */}
      <div className="flex-1 w-full overflow-hidden">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
        >
          <MiniMap />
          <Controls />
          <Background />
        </ReactFlow>
      </div>
      {/* Footer na dnu */}
      <Footer
        isTauri={isTauri}
        openSetting={openSetting}
        setWindowAlwaysOnTop={setWindowAlwaysOnTop}
        absolute={false}
      />
    </div>
  );
};

export default ProjectMap; 