import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Calendar, Clock, User, Check, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

interface Appointment {
  id: string;
  customer_id: string;
  service_id: string;
  date: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes: string;
  customer: { full_name: string; avatar_url: string };
  service: { name: string; price: number; duration: number };
}

export function Schedule() {
  const { user, profile } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, [user]);

  const fetchAppointments = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select(`
          *,
          customer:profiles!customer_id(full_name, avatar_url),
          service:services(name, price, duration)
        `)
        .eq("mechanic_id", user.id)
        .order("date", { ascending: true });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from("appointments")
        .update({ status })
        .eq("id", id);

      if (error) throw error;
      setAppointments(appointments.map(a => a.id === id ? { ...a, status: status as any } : a));
      toast.success(`Agendamento ${status === 'confirmed' ? 'confirmado' : status === 'cancelled' ? 'cancelado' : 'atualizado'}!`);
    } catch (error) {
      console.error("Error updating appointment:", error);
      toast.error("Erro ao atualizar status.");
    }
  };

  const getUserType = () => {
    switch (profile?.role) {
      case 'mechanic': return 'mechanic';
      case 'shop': return 'shop';
      case 'admin': return 'admin';
      default: return 'customer';
    }
  };

  if (loading) return <div className="p-8 text-center">Carregando...</div>;

  return (
    <DashboardLayout userType={getUserType()}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold font-heading text-gray-900">Agenda</h1>
            <p className="text-gray-500">Gerencie seus compromissos.</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {appointments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Agenda vazia</h3>
              <p className="text-gray-500">Você não tem agendamentos futuros.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {appointments.map((apt) => (
                <div key={apt.id} className="p-6 flex flex-col md:flex-row gap-6 items-start md:items-center">
                  <div className="flex-shrink-0 text-center w-16 bg-gray-50 rounded-lg p-2 border border-gray-100">
                    <span className="block text-xs text-gray-500 uppercase">{new Date(apt.date).toLocaleString('default', { month: 'short' })}</span>
                    <span className="block text-2xl font-bold text-gray-900">{new Date(apt.date).getDate()}</span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900 truncate">{apt.service?.name || "Serviço"}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        apt.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        apt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        apt.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {apt.status === 'pending' ? 'Pendente' : apt.status === 'confirmed' ? 'Confirmado' : apt.status === 'cancelled' ? 'Cancelado' : 'Concluído'}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {new Date(apt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({apt.service?.duration} min)
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" /> {apt.customer?.full_name || "Cliente"}
                      </span>
                    </div>
                    
                    {apt.notes && (
                      <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded border border-gray-100">
                        "{apt.notes}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto">
                    {apt.status === 'pending' && (
                      <>
                        <Button size="sm" variant="outline" className="flex-1 md:flex-none text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200" onClick={() => updateStatus(apt.id, 'cancelled')}>
                          <X className="h-4 w-4 mr-1" /> Recusar
                        </Button>
                        <Button size="sm" className="flex-1 md:flex-none bg-green-600 hover:bg-green-700 text-white" onClick={() => updateStatus(apt.id, 'confirmed')}>
                          <Check className="h-4 w-4 mr-1" /> Confirmar
                        </Button>
                      </>
                    )}
                    {apt.status === 'confirmed' && (
                       <Button size="sm" variant="outline" className="flex-1 md:flex-none" onClick={() => updateStatus(apt.id, 'completed')}>
                         Concluir Serviço
                       </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
