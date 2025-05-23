import React from 'react';
import { X } from 'lucide-react';

interface NodeDetailsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  nodeData?: {
    id: string;
    type: string;
    data: any;
  };
}

const NodeDetailsSidebar: React.FC<NodeDetailsSidebarProps> = ({ isOpen, onClose, nodeData }) => {
  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-y-0 right-0 z-50 w-80 transform ${
        isOpen ? "translate-x-0" : "translate-x-full"
      } transition-transform duration-300 ease-in-out bg-white dark:bg-zinc-900 border-l border-gray-200 dark:border-zinc-700`}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-700">
          <h2 className="text-lg font-semibold">Node Details</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {nodeData ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Node ID</h3>
                <p className="mt-1">{nodeData.id}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Type</h3>
                <p className="mt-1">{nodeData.type}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Data</h3>
                <pre className="mt-1 p-2 bg-gray-50 dark:bg-zinc-800 rounded text-sm overflow-x-auto">
                  {JSON.stringify(nodeData.data, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400">
              No node selected
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NodeDetailsSidebar; 