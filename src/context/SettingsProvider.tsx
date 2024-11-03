import React, { useContext, useEffect } from "react";

import { DialogNonTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import SettingsModalContent from "@/components/SettingsModal";

export type SettingsState = {
  deviceId?: string;
};

const DEFAULT_SETTINGS_STATE: SettingsState = {};

type SettingsContextProps = {
  settings: SettingsState;
  setSettings: React.Dispatch<React.SetStateAction<SettingsState>>;
  updateSettings: (
    field: keyof SettingsState,
    val: number | boolean | string
  ) => void;
  setSettingsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
};
const SettingsContext = React.createContext<SettingsContextProps | undefined>(
  undefined
);
const SettingsProvider: React.FC<{
  defaultSettings?: SettingsState;
  children?: React.ReactNode;
}> = ({ children, defaultSettings = DEFAULT_SETTINGS_STATE }) => {
  const [isSettingsModalOpen, setSettingsModalOpen] = React.useState(false);
  const [settings, setSettings] =
    React.useState<SettingsState>(defaultSettings);

  const { toast } = useToast();

  const updateSettings = (
    field: keyof SettingsState,
    val: number | boolean | string
  ) => {
    setSettings((prevVal) => {
      const finalSettings = {
        ...prevVal,
        [field]: val,
      };
      localStorage.setItem("settings", JSON.stringify(finalSettings));
      return finalSettings;
    });
  };

  useEffect(() => {
    const storedSettings = JSON.parse(localStorage.getItem("settings") ?? "{}");
    if (storedSettings) setSettings({ ...defaultSettings, ...storedSettings });
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        setSettingsModalOpen,
        settings,
        setSettings,
        updateSettings,
      }}
    >
      {children}
      {/* Settings Modal */}
      <DialogNonTrigger
        open={isSettingsModalOpen}
        content={<SettingsModalContent />}
        onCancel={() => setSettingsModalOpen(false)}
        title="Settings"
      />
    </SettingsContext.Provider>
  );
};
export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used inside SettingsProvider");
  }
  return context;
}

export default SettingsProvider;
