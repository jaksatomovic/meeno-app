import React, { useState } from 'react';
import { FileText, Image as LucideImage } from 'lucide-react';
import Footer from "@/components/Common/UI/Footer";
import { ChatHeader } from "@/components/Assistant/ChatHeader";
import HistoryList from "@/components/Common/HistoryList";
import FlowContent from './FlowContent';
import { ReactFlowProvider } from '@xyflow/react';

// Helper za ikonicu po tipu fajla (koristi Lucide)
const getFileIcon = (filename: string) => {
  if (filename.match(/\.(png|jpg|jpeg|gif)$/i)) return <LucideImage className="w-4 h-4 text-blue-400" />;
  if (filename.endsWith('.pdf')) return <FileText className="w-4 h-4 text-red-400" />;
  if (filename.endsWith('.docx') || filename.endsWith('.doc')) return <FileText className="w-4 h-4 text-indigo-400" />;
  return <FileText className="w-4 h-4 text-gray-400" />;
};

// Tooltip komponenta
const Tooltip = ({ text }: { text: string }) => (
  <div className="absolute left-1/2 -translate-x-1/2 -top-8 bg-black/80 text-white text-xs rounded-xl px-3 py-1 z-50 shadow-lg whitespace-nowrap pointer-events-none opacity-90">
    {text}
  </div>
);

// Custom context menu
function NodeContextMenu({ x, y, onRename, onDelete, onClose, wrapperRef }: { x: number, y: number, onRename: () => void, onDelete: () => void, onClose: () => void, wrapperRef: React.RefObject<HTMLDivElement> }) {
  // Zatvori na klik van menija ili na Escape
  React.useEffect(() => {
    const handle = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent && e.key === 'Escape') onClose();
      if (e instanceof MouseEvent) {
        const menu = document.getElementById('node-context-menu');
        if (menu && (!(e.target instanceof HTMLElement) || !(e.target as HTMLElement).closest('#node-context-menu'))) onClose();
      }
    };
    document.addEventListener('mousedown', handle);
    document.addEventListener('keydown', handle);
    return () => {
      document.removeEventListener('mousedown', handle);
      document.removeEventListener('keydown', handle);
    };
  }, [onClose]);

  // Izračunaj poziciju relativno na wrapper
  let style: React.CSSProperties = { left: x, top: y };
  if (wrapperRef.current) {
    const bounds = wrapperRef.current.getBoundingClientRect();
    style = { left: x - bounds.left, top: y - bounds.top };
  }

  return (
    <div
      id="node-context-menu"
      className="absolute z-[1000] bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg shadow-lg py-1 px-2 min-w-[120px] text-sm"
      style={style}
      onContextMenu={e => e.preventDefault()}
    >
      <button className="block w-full text-left px-2 py-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded" onClick={onRename}>Rename</button>
      <button className="block w-full text-left px-2 py-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded text-red-500" onClick={onDelete}>Delete</button>
      <button className="block w-full text-left px-2 py-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded" onClick={onClose}>Close</button>
    </div>
  );
}

interface ProjectMapProps {
  isTauri: boolean;
  hideCoco?: () => void;
  openSetting?: () => void;
  setWindowAlwaysOnTop?: (isPinned: boolean) => Promise<void>;
}

const ProjectMap = ({ isTauri, hideCoco, openSetting = () => { }, setWindowAlwaysOnTop = async () => { } }: ProjectMapProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(false);

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
        <ReactFlowProvider>
          <FlowContent isTauri={isTauri} />
        </ReactFlowProvider>
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