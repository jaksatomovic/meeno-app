import { useState } from "react";
import { useTranslation } from "react-i18next";
import { MessageSquare, Plus, RefreshCw } from "lucide-react";

import type { Chat } from "@/types/chat";

interface SidebarProps {
  chats: Chat[];
  activeChat: Chat | undefined;
  onNewChat: () => void;
  onSelectChat: (chat: Chat) => void;
  onDeleteChat: (chatId: string) => void;
  className?: string;
  fetchChatHistory: () => void;
}

export function Sidebar({
  chats,
  activeChat,
  onNewChat,
  onSelectChat,
  className = "",
  fetchChatHistory,
}: SidebarProps) {
  const { t } = useTranslation();

  const [isRefreshing, setIsRefreshing] = useState(false);

  return (
    <div className={`h-full flex flex-col ${className}`}>
      <div className="flex justify-between gap-1 p-4">
        <button
          onClick={onNewChat}
          className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all border border-[#E6E6E6] dark:border-[#272626] text-gray-700 hover:bg-gray-50/80 active:bg-gray-100/80 dark:text-white dark:hover:bg-gray-600/50 dark:active:bg-gray-500/50`}
        >
          <Plus className={`h-4 w-4 text-[#0072FF] dark:text-[#0072FF]`} />
          {t("assistant.sidebar.newChat")}
        </button>
        <button
          onClick={async () => {
            setIsRefreshing(true);
            fetchChatHistory();
            setTimeout(() => setIsRefreshing(false), 1000);
          }}
          className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
          disabled={isRefreshing}
        >
          <RefreshCw
            className={`h-4 w-4 text-[#0287FF] transition-transform duration-1000 ${
              isRefreshing ? "animate-spin" : ""
            }`}
          />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-2 custom-scrollbar">
        {chats.map((chat) => (
          <div
            key={chat._id}
            className={`group relative rounded-xl transition-all ${
              activeChat?._id === chat._id
                ? "bg-gray-100/80 dark:bg-gray-700/50"
                : "hover:bg-gray-50/80 dark:hover:bg-gray-600/30"
            }`}
          >
            <button
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left"
              onClick={() => onSelectChat(chat)}
            >
              <MessageSquare
                className={`h-4 w-4 flex-shrink-0 ${
                  activeChat?._id === chat._id
                    ? "text-[#0072FF] dark:text-[#0072FF]"
                    : "text-gray-400 dark:text-gray-500"
                }`}
              />
              <span
                className={`truncate ${
                  activeChat?._id === chat._id
                    ? "text-gray-900 dark:text-white font-medium"
                    : "text-gray-600 dark:text-gray-300"
                }`}
              >
                {chat?._source?.title || chat?._id}
              </span>
            </button>
            {activeChat?._id === chat._id && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-full bg-[#0072FF]" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
