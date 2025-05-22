import { useCallback, useEffect } from "react";

import platformAdapter from "@/utils/platformAdapter";
import { useAppStore } from "@/stores/appStore";
import { useSyncStore } from "@/hooks/useSyncStore";
import UpdateApp from "@/components/UpdateApp";
import { useAppearanceStore } from "@/stores/appearanceStore";
import ProjectMap from "@/components/ProjectMap";

function MainApp() {
  const addError = useAppStore((state) => state.addError);

  const setIsTauri = useAppStore((state) => state.setIsTauri);
  useEffect(() => {
    setIsTauri(true);
  }, []);

  const hideCoco = useCallback(() => {
    return platformAdapter.hideWindow();
  }, []);

  useSyncStore();

  const snapshotUpdate = useAppearanceStore((state) => state.snapshotUpdate);

  const checkUpdate = useCallback(async () => {
    return platformAdapter.checkUpdate();
  }, []);

  const relaunchApp = useCallback(async () => {
    return platformAdapter.relaunchApp();
  }, []);

  useEffect(() => {
    if (!snapshotUpdate) return;

    checkUpdate().catch((error) => {
      addError("Update failed:" + error, "error");
    });
  }, [snapshotUpdate]);

  return (
    <>
      <ProjectMap isTauri={true} hideCoco={hideCoco} />
      <UpdateApp checkUpdate={checkUpdate} relaunchApp={relaunchApp} />
    </>
  );
}

export default MainApp;
