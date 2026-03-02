import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Plus, Car, Trash2, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  plate: string;
}

export function Vehicles() {
  const { user, profile } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    make: "",
    model: "",
    year: new Date().getFullYear(),
    plate: "",
  });

  useEffect(() => {
    fetchVehicles();
  }, [user]);

  const fetchVehicles = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setVehicles(data || []);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      toast.error("Erro ao carregar veículos.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("vehicles")
        .insert([{ ...newVehicle, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;

      setVehicles([data, ...vehicles]);
      setIsModalOpen(false);
      setNewVehicle({ make: "", model: "", year: new Date().getFullYear(), plate: "" });
      toast.success("Veículo adicionado com sucesso!");
    } catch (error) {
      console.error("Error adding vehicle:", error);
      toast.error("Erro ao adicionar veículo.");
    }
  };

  const handleDeleteVehicle = async (id: string) => {
    if (!confirm("Tem certeza que deseja remover este veículo?")) return;

    try {
      const { error } = await supabase.from("vehicles").delete().eq("id", id);
      if (error) throw error;

      setVehicles(vehicles.filter((v) => v.id !== id));
      toast.success("Veículo removido.");
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      toast.error("Erro ao remover veículo.");
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
            <h1 className="text-2xl font-bold font-heading text-gray-900">Meus Veículos</h1>
            <p className="text-gray-500">Gerencie os carros da sua garagem.</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Veículo
          </Button>
        </div>

        {vehicles.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-200">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Car className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Nenhum veículo cadastrado</h3>
            <p className="text-gray-500 max-w-sm mx-auto mt-2 mb-6">
              Adicione seu veículo para receber ofertas personalizadas e compatíveis.
            </p>
            <Button variant="outline" onClick={() => setIsModalOpen(true)}>
              Adicionar Agora
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((vehicle) => (
              <div key={vehicle.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm relative group">
                <button
                  onClick={() => handleDeleteVehicle(vehicle.id)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <Car className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{vehicle.make} {vehicle.model}</h3>
                    <p className="text-gray-500">{vehicle.year}</p>
                  </div>
                </div>
                {vehicle.plate && (
                  <div className="text-xs font-mono bg-gray-100 px-2 py-1 rounded w-fit text-gray-600">
                    {vehicle.plate}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Add Vehicle Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Adicionar Veículo</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-6 w-6" />
                </button>
              </div>
              <form onSubmit={handleAddVehicle} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
                  <Input
                    required
                    placeholder="Ex: Honda"
                    value={newVehicle.make}
                    onChange={(e) => setNewVehicle({ ...newVehicle, make: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Modelo</label>
                  <Input
                    required
                    placeholder="Ex: Civic LXR 2.0"
                    value={newVehicle.model}
                    onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ano</label>
                    <Input
                      required
                      type="number"
                      min="1900"
                      max={new Date().getFullYear() + 1}
                      value={newVehicle.year}
                      onChange={(e) => setNewVehicle({ ...newVehicle, year: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Placa (Opcional)</label>
                    <Input
                      placeholder="ABC-1234"
                      value={newVehicle.plate}
                      onChange={(e) => setNewVehicle({ ...newVehicle, plate: e.target.value.toUpperCase() })}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">Salvar Veículo</Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
