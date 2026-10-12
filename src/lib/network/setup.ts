import NetInfo from "@react-native-community/netinfo";
import { focusManager, onlineManager } from "@tanstack/react-query";
import { AppState } from "react-native";

let configured = false;

/** Hubungkan TanStack Query ke status jaringan dan aplikasi aktif/latar. Dipanggil sekali. */
export function setupQueryNetworking() {
  if (configured) return;
  configured = true;

  onlineManager.setEventListener((setOnline) =>
    NetInfo.addEventListener((state) => {
      setOnline(state.isConnected !== false);
    }),
  );

  focusManager.setEventListener((setFocused) => {
    const subscription = AppState.addEventListener("change", (state) => {
      setFocused(state === "active");
    });
    return () => subscription.remove();
  });
}
