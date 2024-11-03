import "./App.css";
import Main from "./components/Main";
import { SettingsModalButton } from "./components/SettingsModal";
import { Toaster } from "./components/ui/toaster";
import SettingsProvider from "./context/SettingsProvider";

function App() {
  return (
    <div className="container mx-auto">
      <SettingsProvider>
        <SettingsModalButton />
        <Main />
        <Toaster />
      </SettingsProvider>
    </div>
  );
}

export default App;
