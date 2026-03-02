import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Terminal, RefreshCw, CheckCircle, XCircle, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface DeployLog {
  id: string;
  status: "success" | "error" | "building";
  message: string;
  timestamp: string;
  commit_hash?: string;
  branch?: string;
}

export function DeployLogs() {
  const { profile } = useAuth();
  const [logs, setLogs] = useState<DeployLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      // In a real app, this would fetch from Vercel API or similar via our backend
      const response = await fetch("http://localhost:3001/api/deploy/logs");
      if (!response.ok) throw new Error("Failed to fetch logs");
      const data = await response.json();
      setLogs(data);
    } catch (error) {
      console.error("Error fetching deploy logs:", error);
      toast.error("Erro ao carregar logs de deploy");
      
      // Fallback mock data if backend is not running or fails
      setLogs([
        {
          id: "1",
          status: "error",
          message: "ERR_PNPM_OUTDATED_LOCKFILE Cannot install with \"frozen-lockfile\"",
          timestamp: new Date().toISOString(),
          commit_hash: "a1b2c3d",
          branch: "main"
        },
        {
          id: "2",
          status: "success",
          message: "Deploy completed successfully",
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          commit_hash: "e5f6g7h",
          branch: "main"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold font-heading text-gray-900">Deploy Logs</h1>
            <p className="text-gray-500">Histórico de implantações e status do sistema.</p>
          </div>
          <Button onClick={fetchLogs} variant="outline" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </div>

        <div className="bg-black/90 rounded-xl overflow-hidden shadow-lg border border-gray-800 font-mono text-sm">
          <div className="bg-gray-800/50 px-4 py-2 border-b border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-gray-400" />
              <span className="text-gray-300">Console Output</span>
            </div>
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
            </div>
          </div>
          
          <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar">
            {logs.length === 0 ? (
              <div className="text-gray-500 text-center py-8">Nenhum log encontrado.</div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="border-b border-gray-800/50 pb-4 last:border-0 last:pb-0">
                  <div className="flex items-start gap-3">
                    {log.status === 'success' && <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />}
                    {log.status === 'error' && <XCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />}
                    {log.status === 'building' && <RefreshCw className="h-4 w-4 text-blue-500 animate-spin mt-0.5 shrink-0" />}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                          log.status === 'success' ? 'bg-green-500/10 text-green-400' :
                          log.status === 'error' ? 'bg-red-500/10 text-red-400' :
                          'bg-blue-500/10 text-blue-400'
                        }`}>
                          {log.status.toUpperCase()}
                        </span>
                        <span className="text-gray-500 text-xs flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                        {log.commit_hash && (
                          <span className="text-gray-600 text-xs">
                            Commit: {log.commit_hash}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-300 break-all whitespace-pre-wrap">{log.message}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
