import React, { useCallback } from 'react';
import { useReactFlow } from '@xyflow/react';

interface ContextMenuProps extends React.HTMLAttributes<HTMLDivElement> {
  id: string;
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
  onClose?: () => void;
}

// Export the id of the node with the open menu for highlighting
export let contextMenuNodeId: string | null = null;

const ContextMenu: React.FC<ContextMenuProps> = ({
  id,
  top,
  left,
  right,
  bottom,
  onClose,
  ...props
}) => {
  const { getNode, setNodes, addNodes, setEdges } = useReactFlow();

  // Set the global contextMenuNodeId for highlighting
  contextMenuNodeId = id;

  const duplicateNode = useCallback(() => {
    const node = getNode(id);
    if (!node) return;
    const position = {
      x: node.position.x + 48,
      y: node.position.y + 48,
    };
    addNodes({
      ...node,
      selected: false,
      dragging: false,
      id: `${node.id}-copy-${Math.floor(Math.random()*10000)}`,
      position,
    });
    if (onClose) onClose();
  }, [id, getNode, addNodes, onClose]);

  const deleteNode = useCallback(() => {
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
    setEdges((edges) => edges.filter((edge) => edge.source !== id && edge.target !== id));
    if (onClose) onClose();
  }, [id, setNodes, setEdges, onClose]);

  // Add a tiny offset so the menu doesn't overlap the cursor
  const offset = 1;
  const style: React.CSSProperties = {
    top: typeof top === 'number' ? top + offset : top,
    left: typeof left === 'number' ? left + offset : left,
    right,
    bottom,
    minWidth: 110,
    zIndex: 1000,
    position: 'absolute',
    borderRadius: 10,
    background: 'rgba(245,245,247,0.98)',
    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
    border: '1px solid #e5e7eb',
    padding: 0,
    overflow: 'hidden',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    ...props.style,
  };

  const buttonClass =
    'w-full text-left px-3 py-1 text-[13px] font-medium transition-colors duration-150 focus:outline-none bg-transparent hover:bg-[#e9e9ec] active:bg-[#e1e1e6]';
  const dangerClass =
    'w-full text-left px-3 py-1 text-[13px] font-medium text-red-500 transition-colors duration-150 focus:outline-none bg-transparent hover:bg-red-50 active:bg-red-100';
  const cancelClass =
    'w-full text-left px-3 py-1 text-[12px] text-gray-400 font-normal hover:bg-[#f5f5f7] active:bg-[#ececf0]';

  return (
    <div style={style} className="context-menu animate-fade-in shadow-xl" {...props}>
      {/* <div className="px-5 py-3 border-b border-gray-200 text-xs text-gray-500 select-none tracking-wide bg-transparent">
        Node: <span className="font-mono text-gray-700">{id}</span>
      </div> */}
      <button
        className={buttonClass}
        onClick={duplicateNode}
      >
        Duplicate
      </button>
      <button
        className={dangerClass}
        onClick={deleteNode}
      >
        Delete
      </button>
      <button
        className={cancelClass}
        onClick={onClose}
      >
        Cancel
      </button>
    </div>
  );
};

export default ContextMenu; 