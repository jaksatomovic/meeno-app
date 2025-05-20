import { useEffect, useState } from "react";

import SearchChat from "@/components/SearchChat";
import { useAppStore } from "@/stores/appStore";
import { useShortcutsStore } from "@/stores/shortcutsStore";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useModifierKeyPress } from "@/hooks/useModifierKeyPress";
import useEscape from "@/hooks/useEscape";
import { useViewportHeight } from "@/hooks/useViewportHeight";
import { useIconfontScript } from "@/hooks/useScript";

import "@/i18n";
import "@/web.css";

interface WebAppProps {
  headers?: Record<string, unknown>;
  serverUrl?: string;
  width?: number;
  height?: number;
  hasModules?: string[];
  defaultModule?: "search" | "chat";
  assistantIDs?: string[];
  hideCoco?: () => void;
  theme?: "auto" | "light" | "dark";
  searchPlaceholder?: string;
  chatPlaceholder?: string;
  showChatHistory?: boolean;
  setIsPinned?: (value: boolean) => void;
  onCancel?: () => void;
}

function WebApp({
  width = 680,
  height = 590,
  headers = {
    "X-API-TOKEN":
      "d0erda62a89cir2p1rdgbdkjynbtwxa93e86op8fwyujsht11ckbcugw2zlp1lrvb87cnalv90p22jqbam21",
    "APP-INTEGRATION-ID": "cvkm9hmhpcemufsg3vug",
  },
  // token = "cva1j5ehpcenic3ir7k0h8fb8qtv35iwtywze248oscrej8yoivhb5b1hyovp24xejjk27jy9ddt69ewfi3n",   // https://coco.infini.cloud
  // token = "cvqt6r02sdb2v3bkgip0x3ixv01f3r2lhnxoz1efbn160wm9og58wtv8t6wrv1ebvnvypuc23dx9pb33aemh",  // http://localhost:9000
  // token = "cv5djeb9om602jdvtnmg6kc1muyn2vcadr6te48j9t9pvt59ewrnwj7fwvxrw3va84j2a0lb5y8194fbr3jd",  // http://43.153.113.88:9000
  serverUrl = "",
  hideCoco = () => {},
  hasModules = ["search", "chat"],
  defaultModule = "search",
  assistantIDs = [],
  theme = "dark",
  searchPlaceholder = "",
  chatPlaceholder = "",
  showChatHistory = false,
  setIsPinned,
  onCancel,
}: WebAppProps) {
  const setIsTauri = useAppStore((state) => state.setIsTauri);
  const setEndpoint = useAppStore((state) => state.setEndpoint);
  const setModeSwitch = useShortcutsStore((state) => state.setModeSwitch);
  const setInternetSearch = useShortcutsStore((state) => {
    return state.setInternetSearch;
  });

  useEffect(() => {
    setIsTauri(false);
    setEndpoint(serverUrl);
    setModeSwitch("S");
    setInternetSearch("E");

    localStorage.setItem("headers", JSON.stringify(headers || {}));
  }, []);

  const isMobile = useIsMobile();

  const [isChatMode, setIsChatMode] = useState(false);

  useEscape();
  useModifierKeyPress();
  useViewportHeight();
  useIconfontScript();

  return (
    <div
      id="searchChat-container"
      className={`coco-container ${theme}`}
      data-theme={theme}
      style={{
        maxWidth: `${width}px`,
        width: `100vw`,
        height: isMobile ? "calc(var(--vh, 1vh) * 100)" : `${height}px`,
      }}
    >
      {isMobile && (
        <div
          className={`fixed ${
            isChatMode ? "top-1" : "top-3"
          } right-2 flex items-center justify-center w-8 h-8 rounded-full bg-black/10 dark:bg-white/10 cursor-pointer z-50`}
          onClick={onCancel}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M12 4L4 12M4 4L12 12"
              stroke="#FF4D4F"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      )}
      <SearchChat
        isTauri={false}
        hideCoco={hideCoco}
        hasModules={hasModules}
        defaultModule={defaultModule}
        theme={theme}
        searchPlaceholder={searchPlaceholder}
        chatPlaceholder={chatPlaceholder}
        showChatHistory={showChatHistory}
        setIsPinned={setIsPinned}
        onModeChange={setIsChatMode}
        isMobile={isMobile}
        assistantIDs={assistantIDs}
      />
    </div>
  );
}

export default WebApp;
