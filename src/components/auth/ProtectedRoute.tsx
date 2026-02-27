import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate("/login");
        return;
      }

      // Redirect non-admins to dashboard if route requires admin
      if (requireAdmin && profile?.role !== "admin") {
        navigate("/dashboard");
        return;
      }

      // Redirect admins to admin dashboard if they try to access user dashboard
      if (!requireAdmin && profile?.role === "admin") {
        navigate("/admin");
        return;
      }
    }
  }, [user, profile, loading, navigate, requireAdmin]);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;
  if (requireAdmin && profile?.role !== "admin") return null;

  return <>{children}</>;
}
