import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
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
  NodeProps,
  Node,
  useUpdateNodeInternals,
  useReactFlow,
  Connection,
} from '@xyflow/react';
import { getCurrentWebview } from '@tauri-apps/api/webview';
import "@xyflow/react/dist/style.css";
import { useDropzone, DropEvent } from 'react-dropzone';

// Custom Edge type to match your codebase
export interface CustomEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

// Tooltip komponenta
const Tooltip = ({ text }: { text: string }) => (
  <div className="absolute left-1/2 -translate-x-1/2 -top-8 bg-black/80 text-white text-xs rounded-xl px-3 py-1 z-50 shadow-lg whitespace-nowrap pointer-events-none opacity-90">
    {text}
  </div>
);

// Custom context menu
function NodeContextMenu({ x, y, onRename, onDelete, onClose, wrapperRef }: { x: number, y: number, onRename: () => void, onDelete: () => void, onClose: () => void, wrapperRef: React.RefObject<HTMLDivElement> }) {
  useEffect(() => {
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

interface FileNodeData {
  label: string;
  comment?: string;
  onDelete?: (id: string) => void;
  onRename?: (id: string) => void;
  icon?: React.ReactNode;
}

interface TagNodeData {
  label: string;
  onDelete?: (id: string) => void;
  onRename?: (id: string) => void;
}

// Custom node za fajlove/dokumente
function FileNode(props: NodeProps) {
  const { data, id, selected } = props;
  const fileData = data as unknown as FileNodeData;
  const [showTooltip, setShowTooltip] = useState(false);
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setMenu({ x: e.clientX, y: e.clientY });
  };
  const handleRename = () => {
    setMenu(null);
    if (typeof fileData.onRename === 'function') fileData.onRename(id);
  };
  const handleDelete = () => {
    setMenu(null);
    if (typeof fileData.onDelete === 'function') fileData.onDelete(id);
  };
  return (
    <div
      ref={wrapperRef}
      className={
        `relative rounded-2xl border border-gray-200 bg-white/80 dark:bg-zinc-900/80 p-4 min-w-[120px] shadow-md flex flex-col items-center group transition-all duration-200 ${selected ? 'ring-2 ring-blue-400' : 'hover:shadow-lg'}`
      }
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onContextMenu={handleContextMenu}
      style={{ fontFamily: 'SF Pro, Inter, sans-serif' }}
    >
      <div className="mb-1">{fileData.icon}</div>
      <div className="font-medium text-gray-900 dark:text-gray-100 truncate w-full text-center text-sm mb-0.5">{fileData.label}</div>
      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 w-full text-center">{fileData.comment || 'Dokument'}</div>
      {showTooltip && <Tooltip text={fileData.label} />}
      {menu && <NodeContextMenu x={menu.x} y={menu.y} onRename={handleRename} onDelete={handleDelete} onClose={() => setMenu(null)} wrapperRef={wrapperRef} />}
      <Handle type="target" position={Position.Top} id="main-in" />
      <Handle type="source" position={Position.Bottom} id="main-out" />
      <Handle type="source" position={Position.Right} id="tag-out" style={{ top: '50%', background: '#60a5fa' }} />
    </div>
  );
}

// Minimalistički, decentan tag node sa animacijom širine na hover
function TagNode(props: NodeProps) {
  const { data, id, selected } = props;
  const tagData = data as unknown as TagNodeData;
  const [showTooltip, setShowTooltip] = useState(false);
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setMenu({ x: e.clientX, y: e.clientY });
  };
  const handleRename = () => {
    setMenu(null);
    if (typeof tagData.onRename === 'function') tagData.onRename(id);
  };
  const handleDelete = () => {
    setMenu(null);
    if (typeof tagData.onDelete === 'function') tagData.onDelete(id);
  };
  return (
    <div
      ref={wrapperRef}
      className={
        `relative rounded-full border border-gray-200 bg-gray-50/80 dark:bg-zinc-800/80 px-4 py-1 shadow flex items-center group transition-all duration-200 text-xs font-medium ${selected ? 'ring-2 ring-green-400' : 'hover:shadow-lg'} group-hover:scale-x-110 group-hover:px-6`
      }
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onContextMenu={handleContextMenu}
      style={{ fontFamily: 'SF Pro, Inter, sans-serif', minWidth: 60, justifyContent: 'center' }}
    >
      <span className="font-medium text-gray-700 dark:text-gray-200">#{tagData.label}</span>
      {showTooltip && <Tooltip text={`Tag: ${tagData.label}`} />}
      {menu && <NodeContextMenu x={menu.x} y={menu.y} onRename={handleRename} onDelete={handleDelete} onClose={() => setMenu(null)} wrapperRef={wrapperRef} />}
      <Handle type="target" position={Position.Left} id="main-in" />
      <Handle type="source" position={Position.Right} id="main-out" />
    </div>
  );
}

interface CustomNode extends Node {
  id: string;
  type: 'fileNode' | 'tagNode';
  data: {
    label: string;
    comment?: string;
    onDelete?: (id: string) => void;
    onRename?: (id: string) => void;
    icon?: React.ReactNode;
  };
  position: { x: number; y: number };
}

interface FlowContentProps {
  isTauri: boolean;
}

const FlowContent: React.FC<FlowContentProps> = ({ isTauri }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dropError, setDropError] = useState<string | null>(null);
  const [lastDropPos, setLastDropPos] = useState<{ x: number, y: number } | null>(null);
  const unlistenRef = useRef<null | (() => void)>(null);
  const yPos = useRef(100); // Start y position for stacking nodes

  // React Flow state
  const [nodes, setNodes, onNodesChange] = useNodesState<CustomNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<CustomEdge>([]);
  const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);
  const nodeTypes = useMemo(() => ({
    fileNode: FileNode,
    tagNode: TagNode
  }), []);
  const updateNodeInternals = useUpdateNodeInternals();
  const reactFlowInstance = useReactFlow();

  // Validacija tipa fajla
  const isValidFileType = (filename: string) => {
    return filename.match(/\.(png|jpg|jpeg|gif|pdf|docx|doc|txt|md)$/i);
  };

  // Dinamično brisanje nodova
  const handleDeleteNode = useCallback((id: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== id));
    setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
  }, [setNodes, setEdges]);

  // Dinamično rename nodova
  const handleRenameNode = useCallback((id: string) => {
    const newName = window.prompt('Novo ime:');
    if (!newName) return;
    setNodes((nds) => nds.map((n) => n.id === id ? { ...n, data: { ...n.data, label: newName } } : n));
  }, [setNodes]);

  // Tauri v2 drag & drop: overlay, position, and node creation
  useEffect(() => {
    if (!isTauri) return;
    let isMounted = true;
    (async () => {
      const webview = await getCurrentWebview();
      const unlisten = await webview.onDragDropEvent((event: any) => {
        if (!isMounted) return;
        if (event.payload.type === 'over') {
          setIsDragging(true);
          setDropError(null);
          setLastDropPos(event.payload.position || null);
          console.log('User hovering', event.payload.position);
        } else if (event.payload.type === 'drop') {
          setIsDragging(false);
          setDropError(null);
          setLastDropPos(null);
          console.log('User dropped', event.payload.paths);
          // Add a file node for each dropped file
          if (Array.isArray(event.payload.paths)) {
            setNodes((nds) => {
              let newY = yPos.current;
              const newNodes = event.payload.paths.map((filePath: string, idx: number) => {
                const fileName = filePath.split(/[\\/]/).pop() || filePath;
                const node = {
                  id: `${Date.now()}-${Math.random()}`,
                  type: 'fileNode',
                  data: {
                    label: fileName,
                    comment: 'Dokument',
                    onDelete: handleDeleteNode,
                    onRename: handleRenameNode
                  },
                  position: { x: 100, y: newY + idx * 60 },
                };
                return node;
              });
              yPos.current += newNodes.length * 60;
              return [...nds, ...newNodes];
            });
          }
        } else {
          setIsDragging(false);
          setDropError(null);
          setLastDropPos(null);
          console.log('File drop cancelled');
        }
      });
      unlistenRef.current = unlisten;
    })();
    return () => {
      isMounted = false;
      if (unlistenRef.current) {
        unlistenRef.current();
        unlistenRef.current = null;
      }
    };
  }, [isTauri, handleDeleteNode, handleRenameNode]);

  // react-dropzone for browser
  const onDropAccepted = useCallback((acceptedFiles: File[], event: DropEvent) => {
    if (isTauri) return;
    setIsDragging(false);
    setDropError(null);
    if (!acceptedFiles || acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];
    if (!isValidFileType(file.name)) {
      setDropError('Nepodržan tip fajla. Podržani tipovi: PNG, JPG, GIF, PDF, DOCX, DOC, TXT, MD');
      return;
    }
    // Use event for coordinates if possible
    let position = { x: 100, y: 100 };
    if (event && 'clientX' in event && 'clientY' in event && reactFlowInstance && reactFlowInstance.screenToFlowPosition) {
      position = reactFlowInstance.screenToFlowPosition({ x: (event as any).clientX, y: (event as any).clientY });
    }
    const newNode: CustomNode = {
      id: `${Date.now()}`,
      type: 'fileNode',
      data: {
        label: file.name,
        comment: `Veličina: ${(file.size / 1024).toFixed(1)} KB`,
        onDelete: handleDeleteNode,
        onRename: handleRenameNode
      },
      position,
    };
    setNodes((nds) => [...nds, newNode]);
    setTimeout(() => updateNodeInternals(newNode.id), 0);
  }, [isTauri, setNodes, handleDeleteNode, handleRenameNode, updateNodeInternals, reactFlowInstance]);

  const onDropRejected = useCallback(() => {
    setDropError('Nepodržan tip fajla ili greška pri dropu.');
    setIsDragging(false);
  }, []);

  const {
    getRootProps,
    getInputProps,
    isDragActive: isDropzoneActive,
  } = useDropzone({
    onDropAccepted,
    onDropRejected,
    noClick: true,
    noKeyboard: true,
    multiple: false,
    disabled: isTauri,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc', '.docx'],
      'text/plain': ['.txt', '.md']
    }
  });

  // Dodavanje novog taga double click na prazno mesto
  const onPaneDoubleClick = useCallback((event: React.MouseEvent) => {
    const name = window.prompt('Unesi ime taga:');
    if (!name) return;
    const bounds = (event.target as HTMLDivElement).getBoundingClientRect();
    const position = { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
    const newNode: CustomNode = {
      id: `${Date.now()}`,
      type: 'tagNode',
      data: { label: name, onDelete: handleDeleteNode, onRename: handleRenameNode },
      position,
    };
    setNodes((nds) => [...nds, newNode]);
    setTimeout(() => updateNodeInternals(newNode.id), 0);
  }, [setNodes, handleDeleteNode, handleRenameNode, updateNodeInternals]);

  // Dodavanje novog taga klikom na prazno mesto (koristi contextmenu na pane)
  const onPaneContextMenu = useCallback((event: MouseEvent | React.MouseEvent<Element, MouseEvent>) => {
    event.preventDefault();
    const name = window.prompt('Unesi ime taga:');
    if (!name) return;
    const bounds = (event.target as HTMLDivElement).getBoundingClientRect();
    const position = { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
    const newNode: CustomNode = {
      id: `${Date.now()}`,
      type: 'tagNode',
      data: { label: name, onDelete: handleDeleteNode, onRename: handleRenameNode },
      position,
    };
    setNodes((nds) => [...nds, newNode]);
  }, [setNodes, handleDeleteNode, handleRenameNode]);

  // Dodavanje novog taga double click na prazno mesto (koristi onNodeDoubleClick)
  const onNodeDoubleClick = useCallback((event: React.MouseEvent, node: Node) => {
    handleRenameNode(node.id);
  }, [handleRenameNode]);

  return (
    <div className="h-full w-full relative" {...getRootProps()}>
      <input {...getInputProps()} />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        onNodeDoubleClick={onNodeDoubleClick}
        onPaneContextMenu={onPaneContextMenu}
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
      {/* Dropzone overlay for Tauri drag & drop */}
      {isTauri && isDragging && (
        <div className="absolute inset-0 z-[2000] bg-blue-100/60 border-2 border-blue-400 border-dashed flex items-center justify-center pointer-events-none select-none">
          <span className="text-blue-600 text-lg font-medium">Prevuci fajl ovde da ga dodaš</span>
        </div>
      )}
      {/* Error message */}
      {isTauri && dropError && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[2001] bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-lg shadow-lg">
          {dropError}
        </div>
      )}
      {/* Dropzone overlay for browser */}
      {!isTauri && (isDropzoneActive || isDragging) && (
        <div className="absolute inset-0 z-[2000] bg-blue-100/60 border-2 border-blue-400 border-dashed flex items-center justify-center pointer-events-none select-none">
          <span className="text-blue-600 text-lg font-medium">Prevuci fajl ovde da ga dodaš</span>
        </div>
      )}
      {/* Error message for browser */}
      {!isTauri && dropError && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[2001] bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-lg shadow-lg">
          {dropError}
        </div>
      )}
    </div>
  );
};

export default FlowContent;
