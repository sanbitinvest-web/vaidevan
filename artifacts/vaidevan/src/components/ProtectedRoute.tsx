import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { investor, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (loading) return;
    if (!investor) {
      setLocation("/portal");
    } else if (investor.approvalStatus !== "approved") {
      setLocation("/portal/aguardando");
    }
  }, [investor, loading, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!investor || investor.approvalStatus !== "approved") return null;

  return <>{children}</>;
}
