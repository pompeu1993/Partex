import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PictureUpload } from "@/components/ui/PictureUpload";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Loader2, Plus, Pencil, Trash2, X, Save, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";

interface Category {
  id: number;
  name: string;
  slug: string;
  icon_url: string | null;
  type: 'product' | 'service' | 'both';
  created_at: string;
}

export function Categories() {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  // Form state
  const [name, setName] = useState("");
  const [iconUrl, setIconUrl] = useState<string | null>(null);
  const [type, setType] = useState<'product' | 'service' | 'both'>('both');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Erro ao carregar categorias");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setName(category.name);
      setIconUrl(category.icon_url);
      setType(category.type);
    } else {
      setEditingCategory(null);
      setName("");
      setIconUrl(null);
      setType("both");
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setName("");
    setIconUrl(null);
    setType("both");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      toast.error("O nome é obrigatório");
      return;
    }

    setIsSubmitting(true);
    
    // Simple slug generation
    const slug = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "-");

    try {
      if (editingCategory) {
        const { error } = await supabase
          .from("categories")
          .update({ name, slug, icon_url: iconUrl, type })
          .eq("id", editingCategory.id);
        
        if (error) throw error;
        toast.success("Categoria atualizada com sucesso!");
      } else {
        const { error } = await supabase
          .from("categories")
          .insert([{ name, slug, icon_url: iconUrl, type }]);
        
        if (error) throw error;
        toast.success("Categoria criada com sucesso!");
      }
      
      fetchCategories();
      handleCloseModal();
    } catch (error: any) {
      console.error("Error saving category:", error);
      if (error.code === '23505') { // Unique violation
          toast.error("Já existe uma categoria com este nome/slug.");
      } else {
          toast.error("Erro ao salvar categoria");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir esta categoria?")) return;

    try {
      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Categoria excluída com sucesso!");
      fetchCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Erro ao excluir categoria");
    }
  };

  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold font-heading text-gray-900">
              Categorias
            </h1>
            <p className="text-gray-500">Gerencie as categorias de produtos e serviços</p>
          </div>
          <Button onClick={() => handleOpenModal()}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Categoria
          </Button>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Buscar categorias..." 
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-600 font-medium">
                  <tr>
                    <th className="px-4 py-3 rounded-l-lg">Ícone</th>
                    <th className="px-4 py-3">Nome</th>
                    <th className="px-4 py-3">Tipo</th>
                    <th className="px-4 py-3 text-right rounded-r-lg">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredCategories.length > 0 ? (
                    filteredCategories.map((category) => (
                      <tr key={category.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3">
                          {category.icon_url ? (
                            <img src={category.icon_url} alt={category.name} className="h-8 w-8 object-contain rounded bg-gray-100 p-1" />
                          ) : (
                            <div className="h-8 w-8 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">
                                Sem
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-900">{category.name}</td>
                        <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                category.type === 'product' ? 'bg-blue-100 text-blue-700' :
                                category.type === 'service' ? 'bg-green-100 text-green-700' :
                                'bg-purple-100 text-purple-700'
                            }`}>
                                {category.type === 'product' ? 'Produto' : category.type === 'service' ? 'Serviço' : 'Ambos'}
                            </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleOpenModal(category)}>
                              <Pencil className="h-4 w-4 text-gray-500 hover:text-primary" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(category.id)}>
                              <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-500" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                        Nenhuma categoria encontrada.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-lg font-bold">{editingCategory ? 'Editar Categoria' : 'Nova Categoria'}</h2>
                    <Button variant="ghost" size="icon" onClick={handleCloseModal}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>
                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Nome</label>
                        <Input 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            placeholder="Ex: Motor" 
                            required
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Tipo</label>
                        <select 
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={type}
                            onChange={(e: any) => setType(e.target.value)}
                        >
                            <option value="product">Produto</option>
                            <option value="service">Serviço</option>
                            <option value="both">Ambos</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Ícone</label>
                        <PictureUpload
                            value={iconUrl}
                            onChange={setIconUrl}
                            folder="categories"
                            label="Upload Ícone"
                        />
                    </div>

                    <div className="flex justify-end pt-4 gap-2">
                        <Button type="button" variant="outline" onClick={handleCloseModal}>Cancelar</Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                            Salvar
                        </Button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </DashboardLayout>
  );
}
