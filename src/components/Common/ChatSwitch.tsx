import React, { useEffect, useCallback } from "react";
import { Bot, Search } from "lucide-react";

import { useShortcutsStore } from "@/stores/shortcutsStore";

interface ChatSwitchProps {
  isChatMode: boolean;
  onChange: (isChatMode: boolean) => void;
}

const ChatSwitch: React.FC<ChatSwitchProps> = ({ isChatMode, onChange }) => {
  const modifierKeyPressed = useShortcutsStore((state) => {
    return state.modifierKeyPressed;
  });
  const modeSwitch = useShortcutsStore((state) => {
    return state.modeSwitch;
  });

  const handleToggle = useCallback(() => {
    onChange?.(!isChatMode);
  }, [onChange, isChatMode]);

  const handleKeydown = useCallback(
    (event: KeyboardEvent) => {
      if (modifierKeyPressed && event.key === modeSwitch.toLowerCase()) {
        event.preventDefault();
        // console.log("Switch mode triggered");
        handleToggle();
      }
    },
    [handleToggle, modifierKeyPressed, modeSwitch]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeydown);

    return () => {
      window.removeEventListener("keydown", handleKeydown);
    };
  }, [handleKeydown]);

  return (
    <div
      role="switch"
      aria-checked={isChatMode}
      className={`relative flex items-center justify-between w-10 h-[18px] rounded-full cursor-pointer transition-colors duration-300 ${
        isChatMode ? "bg-[#0072ff]" : "bg-[var(--coco-primary-color)]"
      }`}
      onClick={handleToggle}
    >
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none flex items-center justify-between px-1">
        {isChatMode ? <Bot className="w-4 h-4 text-white" /> : <div></div>}
        {!isChatMode ? <Search className="w-4 h-4 text-white" /> : <div></div>}
      </div>
      <div
        className={`absolute top-[1px] h-4 w-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
          isChatMode ? "translate-x-6" : "translate-x-0"
        }`}
      ></div>
    </div>
  );
};

export default ChatSwitch;
