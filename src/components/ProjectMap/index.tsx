import React, { useState } from "react";
import { ReactFlow, Background, Controls } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import Footer from "@/components/Common/UI/Footer";
import { ChatHeader } from "@/components/Assistant/ChatHeader";

const initialNodes = [
  {
    id: "1",
    type: "default",
    data: { label: "knjiga.pdf" },
    position: { x: 250, y: 0 },
  },
  {
    id: "2",
    type: "default",
    data: { label: "slika za Poglavlje 2" },
    position: { x: 100, y: 100 },
  },
  {
    id: "3",
    type: "default",
    data: { label: "beta-verzija .docx" },
    position: { x: 400, y: 100 },
  },
  {
    id: "4",
    type: "default",
    data: { label: "koristi se u uvodu" },
    position: { x: 250, y: 80 },
  },
];

const initialEdges = [
  { id: "e1-4", source: "1", target: "4" },
  { id: "e2-4", source: "2", target: "4" },
  { id: "e3-4", source: "3", target: "4" },
];

interface ProjectMapProps {
  isTauri: boolean;
  hideCoco?: () => void;
  openSetting?: () => void;
  setWindowAlwaysOnTop?: (isPinned: boolean) => Promise<void>;
}

const ProjectMap = ({ isTauri, hideCoco, openSetting = () => {}, setWindowAlwaysOnTop = async () => {} }: ProjectMapProps) => {
  // Dummy state for ChatHeader
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(false);

  return (
    <div
      data-tauri-drag-region={isTauri}
      className="flex flex-col w-screen h-screen bg-white dark:bg-black overflow-hidden relative rounded-xl border border-[#E6E6E6] dark:border-[#272626]"
    >
      {/* ChatHeader na vrhu */}
      <ChatHeader
        onCreateNewChat={() => {}}
        onOpenChatAI={() => {}}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={() => setIsSidebarOpen((v) => !v)}
        activeChat={undefined}
        reconnect={() => {}}
        isLogin={isLogin}
        setIsLogin={setIsLogin}
        isChatPage={false}
        showChatHistory={true}
        assistantIDs={[]}
      />
      {/* Mapa */}
      <div className="flex-1 w-full overflow-hidden">
        <ReactFlow nodes={initialNodes} edges={initialEdges} fitView>
          <Background />
          <Controls />
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