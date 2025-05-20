import { useAppearanceStore } from "@/stores/appearanceStore";
import { useConnectStore } from "@/stores/connectStore";
import { useShortcutsStore } from "@/stores/shortcutsStore";
import { useStartupStore } from "@/stores/startupStore";
import platformAdapter from "@/utils/platformAdapter";
import { isNumber } from "lodash-es";
import { useEffect } from "react";

export const useSyncStore = () => {
  const setModifierKey = useShortcutsStore((state) => {
    return state.setModifierKey;
  });
  const setModeSwitch = useShortcutsStore((state) => {
    return state.setModeSwitch;
  });
  const setReturnToInput = useShortcutsStore((state) => {
    return state.setReturnToInput;
  });
  const setVoiceInput = useShortcutsStore((state) => {
    return state.setVoiceInput;
  });
  const setAddFile = useShortcutsStore((state) => {
    return state.setAddFile;
  });
  const setDefaultStartupWindow = useStartupStore((state) => {
    return state.setDefaultStartupWindow;
  });
  const setDefaultContentForSearchWindow = useStartupStore((state) => {
    return state.setDefaultContentForSearchWindow;
  });
  const setDefaultContentForChatWindow = useStartupStore((state) => {
    return state.setDefaultContentForChatWindow;
  });
  const setDeepThinking = useShortcutsStore((state) => {
    return state.setDeepThinking;
  });
  const setInternetSearch = useShortcutsStore((state) => {
    return state.setInternetSearch;
  });
  const setInternetSearchScope = useShortcutsStore((state) => {
    return state.setInternetSearchScope;
  });
  const setMcpSearch = useShortcutsStore((state) => {
    return state.setMcpSearch;
  });
  const setMcpSearchScope = useShortcutsStore((state) => {
    return state.setMcpSearchScope;
  });
  const setHistoricalRecords = useShortcutsStore((state) => {
    return state.setHistoricalRecords;
  });
  const setAiAssistant = useShortcutsStore((state) => {
    return state.setAiAssistant;
  });
  const setNewSession = useShortcutsStore((state) => {
    return state.setNewSession;
  });
  const setFixedWindow = useShortcutsStore((state) => {
    return state.setFixedWindow;
  });
  const setServiceList = useShortcutsStore((state) => {
    return state.setServiceList;
  });
  const setExternal = useShortcutsStore((state) => {
    return state.setExternal;
  });
  const fixedWindow = useShortcutsStore((state) => {
    return state.fixedWindow;
  });
  const resetFixedWindow = useShortcutsStore((state) => {
    return state.resetFixedWindow;
  });
  const setResetFixedWindow = useShortcutsStore((state) => {
    return state.setResetFixedWindow;
  });
  const setConnectionTimeout = useConnectStore((state) => {
    return state.setConnectionTimeout;
  });
  const setQueryTimeout = useConnectStore((state) => {
    return state.setQuerySourceTimeout;
  });
  const setOpacity = useAppearanceStore((state) => state.setOpacity);
  const setSnapshotUpdate = useAppearanceStore((state) => {
    return state.setSnapshotUpdate;
  });
  const setAllowSelfSignature = useConnectStore((state) => {
    return state.setAllowSelfSignature;
  });

  useEffect(() => {
    if (!resetFixedWindow) {
      if (fixedWindow === "F") {
        setFixedWindow("P");
      }

      setResetFixedWindow(true);
    }

    const unListeners = Promise.all([
      platformAdapter.listenEvent("change-shortcuts-store", ({ payload }) => {
        const {
          modifierKey,
          modeSwitch,
          returnToInput,
          voiceInput,
          addFile,
          deepThinking,
          internetSearch,
          internetSearchScope,
          mcpSearch,
          mcpSearchScope,
          historicalRecords,
          aiAssistant,
          newSession,
          fixedWindow,
          serviceList,
          external,
        } = payload;
        setModifierKey(modifierKey);
        setModeSwitch(modeSwitch);
        setReturnToInput(returnToInput);
        setVoiceInput(voiceInput);
        setAddFile(addFile);
        setDeepThinking(deepThinking);
        setInternetSearch(internetSearch);
        setInternetSearchScope(internetSearchScope);
        setMcpSearch(mcpSearch);
        setMcpSearchScope(mcpSearchScope);
        setHistoricalRecords(historicalRecords);
        setAiAssistant(aiAssistant);
        setNewSession(newSession);
        setFixedWindow(fixedWindow);
        setServiceList(serviceList);
        setExternal(external);
      }),

      platformAdapter.listenEvent("change-startup-store", ({ payload }) => {
        const {
          defaultStartupWindow,
          defaultContentForSearchWindow,
          defaultContentForChatWindow,
        } = payload;
        setDefaultStartupWindow(defaultStartupWindow);
        setDefaultContentForSearchWindow(defaultContentForSearchWindow);
        setDefaultContentForChatWindow(defaultContentForChatWindow);
      }),

      platformAdapter.listenEvent("change-connect-store", ({ payload }) => {
        const { connectionTimeout, querySourceTimeout, allowSelfSignature } =
          payload;
        if (isNumber(connectionTimeout)) {
          setConnectionTimeout(connectionTimeout);
        }
        if (isNumber(querySourceTimeout)) {
          setQueryTimeout(querySourceTimeout);
        }
        setAllowSelfSignature(allowSelfSignature);
      }),

      platformAdapter.listenEvent("change-appearance-store", ({ payload }) => {
        const { opacity, snapshotUpdate } = payload;

        if (isNumber(opacity)) {
          setOpacity(opacity);
        }
        setSnapshotUpdate(snapshotUpdate);
      }),
    ]);

    return () => {
      unListeners.then((fns) => {
        fns.forEach((fn) => fn());
      });
    };
  }, []);
};
