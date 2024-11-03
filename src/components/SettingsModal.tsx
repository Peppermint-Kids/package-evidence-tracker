import { useSettings } from "@/context/SettingsProvider";
import React from "react";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Settings } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

const SettingsModalContent: React.FC = () => {
  const { settings, updateSettings } = useSettings();
  const [devices, setDevices] = React.useState([]);

  const handleDevices = React.useCallback(
    (mediaDevices) => {
      setDevices(mediaDevices.filter(({ kind }) => kind === "videoinput"));
    },
    [setDevices]
  );

  React.useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then(handleDevices);
  }, [handleDevices]);

  return (
    <div className="flex gap-5">
      <div className="w-full">
        <Label htmlFor="camera">Camera</Label>
        <Select
          value={settings.deviceId}
          onValueChange={(val) => updateSettings("deviceId", val)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {devices.map(
              (device, key) =>
                device.deviceId && (
                  <SelectItem value={device.deviceId} key={key}>
                    {device.label || `Device ${key + 1}`}
                  </SelectItem>
                )
            )}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default SettingsModalContent;

export const SettingsModalButton = () => {
  const { setSettingsModalOpen } = useSettings();
  return (
    <div className="flex flex-row-reverse	mt-4">
      <Button
        className=""
        variant="outline"
        size="icon"
        onClick={() => setSettingsModalOpen(true)}
      >
        <Settings size={16} />
      </Button>
    </div>
  );
};
