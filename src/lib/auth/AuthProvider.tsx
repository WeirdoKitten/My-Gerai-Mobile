import { useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  type ReactNode,
  use,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { configureApiClient } from "@/api/client";
import { logout } from "@/api/endpoints/auth";

import { deleteToken, readToken, saveToken } from "./token-storage";

export const SESSION_EXPIRED_NOTICE = "Sesi berakhir, silakan login kembali.";

type AuthStatus = "loading" | "signedOut" | "signedIn";

type AuthContextValue = {
  status: AuthStatus;
  /** Pesan untuk layar login setelah keluar paksa, mis. sesi berakhir. */
  notice: string | null;
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearNotice: () => void;
  /** Pesan status Lapak dari server (pending/ditolak/nonaktif atau hasil daftar) untuk layar menunggu. */
  statusMessage: string | null;
  setStatusMessage: (message: string | null) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const tokenRef = useRef<string | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [notice, setNotice] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const clearLocalSession = useCallback(async () => {
    tokenRef.current = null;
    setStatus("signedOut");
    queryClient.clear();
    await deleteToken().catch(() => {});
  }, [queryClient]);

  useEffect(() => {
    configureApiClient({
      getToken: () => tokenRef.current,
      onUnauthorized: () => {
        if (tokenRef.current === null) return;
        setNotice(SESSION_EXPIRED_NOTICE);
        void clearLocalSession();
      },
    });

    let cancelled = false;
    readToken()
      .catch(() => null)
      .then((token) => {
        if (cancelled) return;
        tokenRef.current = token;
        setStatus(token ? "signedIn" : "signedOut");
      });
    return () => {
      cancelled = true;
    };
  }, [clearLocalSession]);

  const signIn = useCallback(async (token: string) => {
    await saveToken(token);
    tokenRef.current = token;
    setNotice(null);
    setStatus("signedIn");
  }, []);

  const signOut = useCallback(async () => {
    // Server mencabut token + token push. Gagal jaringan tetap keluar lokal.
    await logout().catch(() => {});
    await clearLocalSession();
  }, [clearLocalSession]);

  const clearNotice = useCallback(() => setNotice(null), []);

  return (
    <AuthContext
      value={{ status, notice, signIn, signOut, clearNotice, statusMessage, setStatusMessage }}
    >
      {children}
    </AuthContext>
  );
}

export function useAuth(): AuthContextValue {
  const value = use(AuthContext);
  if (!value) throw new Error("useAuth harus dipakai di dalam AuthProvider.");
  return value;
}
