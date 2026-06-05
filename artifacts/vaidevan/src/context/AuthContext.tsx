import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api } from "@/lib/api";

export type ApprovalStatus = "pending_kyc" | "under_review" | "approved" | "suspended";

interface Investor {
  id: number;
  name: string;
  email: string;
  approvalStatus: ApprovalStatus;
}

interface AuthCtx {
  investor: Investor | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<Investor>;
  loginWithToken: (token: string, investor: Investor) => void;
  logout: () => void;
  refreshStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthCtx | null>(null);

export const AUTH_CHANGED = "vv-auth-changed";

function dispatchAuthChanged(loggedIn: boolean) {
  window.dispatchEvent(new CustomEvent(AUTH_CHANGED, { detail: { loggedIn } }));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [investor, setInvestor] = useState<Investor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("vdv_token");
    if (!token) { setLoading(false); return; }
    api.me()
      .then(data => {
        setInvestor(data as Investor);
        dispatchAuthChanged(true);
      })
      .catch(() => localStorage.removeItem("vdv_token"))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string): Promise<Investor> => {
    const data = await api.login(email, password);
    localStorage.setItem("vdv_token", data.token);
    const inv = data.investor as Investor;
    setInvestor(inv);
    dispatchAuthChanged(true);
    return inv;
  };

  const loginWithToken = (token: string, inv: Investor) => {
    localStorage.setItem("vdv_token", token);
    setInvestor(inv);
    dispatchAuthChanged(true);
  };

  const logout = () => {
    localStorage.removeItem("vdv_token");
    setInvestor(null);
    dispatchAuthChanged(false);
  };

  // Atualiza o approvalStatus sem re-login (chamado pela tela de espera)
  const refreshStatus = async () => {
    try {
      const data = await api.me();
      setInvestor(data as Investor);
    } catch {
      // silencioso
    }
  };

  return (
    <AuthContext.Provider value={{ investor, loading, login, loginWithToken, logout, refreshStatus }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
