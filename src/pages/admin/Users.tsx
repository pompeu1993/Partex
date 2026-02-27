import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Loader2, Search, Trash2, Eye, User, Mail, Shield, UserCog, CheckCircle, XCircle, FileText, AlertTriangle, FileSearch, Edit, Save, MapPin, Package, Lock, Store, Globe } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { formatDate } from "@/lib/utils";

export function Users() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Review Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectionInput, setShowRejectionInput] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<any>({});
  const [activeTab, setActiveTab] = useState("general");
  const [userProducts, setUserProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  
  const MASTER_ID = "6bdb346f-532a-4201-9b9a-a6afe34145af";

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Erro ao carregar usuários");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProducts = async (userId: string) => {
    setLoadingProducts(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("seller_id", userId);
      
      if (error) throw error;
      setUserProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Erro ao carregar produtos do usuário");
    } finally {
      setLoadingProducts(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || 
      (filterStatus === "pending" && user.status === "pending") ||
      (filterStatus === "approved" && user.status === "approved");

    return matchesSearch && matchesStatus;
  });

  // --- Review Logic ---
  const handleReview = (user: any) => {
    if (user.id === MASTER_ID) {
        toast.error("O usuário Master não pode ser revisado.");
        return;
    }
    setSelectedUser(user);
    setRejectionReason("");
    setShowRejectionInput(false);
    setIsReviewModalOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedUser) return;
    setProcessing(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ status: 'approved', rejection_reason: null })
        .eq("id", selectedUser.id);

      if (error) throw error;
      
      setUsers(users.map(u => u.id === selectedUser.id ? { ...u, status: 'approved', rejection_reason: null } : u));
      toast.success("Usuário aprovado com sucesso!");
      setIsReviewModalOpen(false);
    } catch (error) {
      console.error("Error approving user:", error);
      toast.error("Erro ao aprovar usuário");
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = () => {
    setShowRejectionInput(true);
  };

  const handleConfirmReject = async () => {
    if (!selectedUser) return;
    if (!rejectionReason.trim()) {
      toast.error("Por favor, informe o motivo da rejeição.");
      return;
    }

    setProcessing(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ status: 'rejected', rejection_reason: rejectionReason })
        .eq("id", selectedUser.id);

      if (error) throw error;
      
      setUsers(users.map(u => u.id === selectedUser.id ? { ...u, status: 'rejected', rejection_reason: rejectionReason } : u));
      toast.success("Usuário rejeitado com sucesso.");
      setIsReviewModalOpen(false);
    } catch (error) {
      console.error("Error rejecting user:", error);
      toast.error("Erro ao rejeitar usuário");
    } finally {
      setProcessing(false);
    }
  };

  // --- Edit Logic ---
  const handleEdit = (user: any) => {
    if (user.id === MASTER_ID) {
        toast.error("O usuário Master não pode ser editado.");
        return;
    }
    setEditFormData({
      id: user.id,
      full_name: user.full_name || "",
      email: user.email || "", 
      phone: user.phone || "",
      role: user.role || "user",
      status: user.status || "pending",
      bio: user.bio || "",
      store_name: user.store_name || "",
      is_public: user.is_public !== false, // default true
      document_type: user.document_type || "cpf",
      document_number: user.document_number || "",
      // Flatten address for easier editing, or keep nested
      address_zipCode: user.address?.zipCode || "",
      address_street: user.address?.street || "",
      address_number: user.address?.number || "",
      address_neighborhood: user.address?.neighborhood || "",
      address_city: user.address?.city || "",
      address_state: user.address?.state || "",
    });
    setActiveTab("general");
    fetchUserProducts(user.id);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    setProcessing(true);
    try {
      // Construct address object
      const address = {
        zipCode: editFormData.address_zipCode,
        street: editFormData.address_street,
        number: editFormData.address_number,
        neighborhood: editFormData.address_neighborhood,
        city: editFormData.address_city,
        state: editFormData.address_state,
      };

      const updates = {
        full_name: editFormData.full_name,
        phone: editFormData.phone,
        role: editFormData.role,
        status: editFormData.status,
        bio: editFormData.bio,
        store_name: editFormData.store_name,
        is_public: editFormData.is_public,
        document_type: editFormData.document_type,
        document_number: editFormData.document_number,
        address: address
      };

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", editFormData.id);

      if (error) throw error;

      // Update local state
      setUsers(users.map(u => u.id === editFormData.id ? { ...u, ...updates } : u));
      toast.success("Dados do usuário atualizados!");
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Erro ao salvar alterações");
    } finally {
      setProcessing(false);
    }
  };

  const handleEditChange = (field: string, value: any) => {
    setEditFormData((prev: any) => ({ ...prev, [field]: value }));
  };
  
  const handlePasswordReset = async () => {
    if (!editFormData.email) return;
    if (!confirm(`Enviar email de redefinição de senha para ${editFormData.email}?`)) return;
    
    try {
        const { error } = await supabase.auth.resetPasswordForEmail(editFormData.email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success("Email de redefinição enviado!");
    } catch (error) {
        console.error("Error sending reset email:", error);
        toast.error("Erro ao enviar email");
    }
  };

  const toggleAdmin = async (id: string, currentRole: string) => {
    // Legacy quick toggle, now integrated into Edit Modal but kept for quick access if needed.
    // Let's redirect to handleEdit instead for consistency or keep it.
    // Keeping it as "Quick Action"
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (!confirm(`Deseja alterar a função para ${newRole}?`)) return;
    
    try {
        const { error } = await supabase.from("profiles").update({ role: newRole }).eq("id", id);
        if (error) throw error;
        setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u));
        toast.success("Permissão atualizada");
    } catch (error) {
        toast.error("Erro ao atualizar");
    }
  };

  if (loading) {
    return (
      <DashboardLayout userType="admin">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold font-heading text-gray-900">
            Gerenciamento de Usuários
          </h1>
          <p className="text-gray-500">Administre os usuários cadastrados na plataforma</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Buscar por nome ou email..." 
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  variant={filterStatus === 'all' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setFilterStatus('all')}
                >
                  Todos
                </Button>
                <Button 
                  variant={filterStatus === 'pending' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setFilterStatus('pending')}
                  className={filterStatus === 'pending' ? "bg-orange-500 hover:bg-orange-600" : ""}
                >
                  Pendentes
                  {users.filter(u => u.status === 'pending').length > 0 && (
                    <span className="ml-2 bg-white text-orange-600 px-1.5 py-0.5 rounded-full text-xs font-bold">
                      {users.filter(u => u.status === 'pending').length}
                    </span>
                  )}
                </Button>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Total: <strong>{filteredUsers.length}</strong> usuários
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50/50 text-gray-500 font-medium border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Usuário</th>
                  <th className="px-6 py-4">Função</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Data Cadastro</th>
                  <th className="px-6 py-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className={`hover:bg-gray-50/50 transition-colors ${user.status === 'pending' ? 'bg-orange-50/30' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold">
                            {user.full_name?.charAt(0) || <User className="h-5 w-5" />}
                          </div>
                          {user.status === 'pending' && (
                            <span className="absolute -top-1 -right-1 h-3 w-3 bg-orange-500 rounded-full border-2 border-white animate-pulse" />
                          )}
                        </div>
                        <div>
                          <p className={`font-bold ${user.status === 'pending' ? 'text-orange-700' : 'text-gray-900'}`}>
                            {user.full_name || "Sem nome"}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Mail className="h-3 w-3" />
                            {user.email || "Email não disponível"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                        user.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role === 'admin' && <Shield className="h-3 w-3 mr-1" />}
                        {user.role || 'user'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                        user.status === 'approved' 
                          ? 'bg-green-100 text-green-800' 
                          : user.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {user.status === 'pending' && <AlertTriangle className="h-3 w-3 mr-1" />}
                        {user.status === 'approved' ? 'Aprovado' : user.status === 'rejected' ? 'Rejeitado' : 'Pendente'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        {(user.status === 'pending' || user.status === 'approved') && user.id !== MASTER_ID && (
                          <Button 
                            variant={user.status === 'approved' ? "outline" : "default"} 
                            size="sm" 
                            className={user.status === 'pending' ? "bg-blue-600 hover:bg-blue-700 h-8" : "h-8 border-orange-200 text-orange-700 hover:bg-orange-50 hover:text-orange-800"}
                            onClick={() => handleReview(user)}
                            title="Revisar Usuário"
                          >
                            <FileSearch className="h-4 w-4" />
                          </Button>
                        )}
                        {user.id !== MASTER_ID ? (
                            <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-gray-600 hover:text-primary hover:bg-orange-50"
                            title="Editar Usuário Completo"
                            onClick={() => handleEdit(user)}
                            >
                            <Edit className="h-4 w-4" />
                            </Button>
                        ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-500 select-none">
                                <Lock className="h-3 w-3 mr-1" /> Master
                            </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      Nenhum usuário encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      <Modal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        title="Revisão de Cadastro"
        footer={
          !showRejectionInput ? (
            <>
              <Button 
                variant="outline" 
                onClick={handleReject}
                className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Rejeitar
              </Button>
              <Button 
                onClick={handleApprove}
                className="bg-green-600 hover:bg-green-700"
                disabled={processing}
              >
                {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                Aprovar Cadastro
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => setShowRejectionInput(false)}>Cancelar</Button>
              <Button 
                onClick={handleConfirmReject}
                className="bg-red-600 hover:bg-red-700"
                disabled={processing}
              >
                {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirmar Rejeição"}
              </Button>
            </>
          )
        }
      >
        {selectedUser && (
          <div className="space-y-6">
            {/* ... (Existing review content) ... */}
            <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center text-gray-400 border border-gray-200 shadow-sm">
                <User className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">{selectedUser.full_name}</h3>
                <p className="text-gray-500 flex items-center gap-1">
                  <Mail className="h-3 w-3" /> {selectedUser.email}
                </p>
                <div className="flex gap-2 mt-2">
                   <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                      {selectedUser.role}
                   </span>
                   <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      ID: {selectedUser.id.slice(0, 8)}
                   </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 uppercase">Telefone</label>
                <p className="text-gray-900 font-medium">{selectedUser.phone || "Não informado"}</p>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 uppercase">Documento ({selectedUser.document_type || "?"})</label>
                <p className="text-gray-900 font-medium">{selectedUser.document_number || "Não informado"}</p>
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-xs font-medium text-gray-500 uppercase">Endereço</label>
                <p className="text-gray-900">
                  {selectedUser.address ? (
                    <>
                      {selectedUser.address.street}, {selectedUser.address.number}
                      {selectedUser.address.complement && ` - ${selectedUser.address.complement}`}
                      <br />
                      {selectedUser.address.neighborhood} - {selectedUser.address.city}/{selectedUser.address.state}
                      <br />
                      CEP: {selectedUser.address.zipCode}
                    </>
                  ) : "Não informado"}
                </p>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4" /> Documentação Anexada
              </h4>
              
              {selectedUser.document_url ? (
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-center">
                   <p className="text-sm text-gray-500 mb-3">O usuário enviou um documento para validação.</p>
                   <Button 
                     variant="outline" 
                     onClick={() => window.open(`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/user-documents/${selectedUser.document_url}`, '_blank')}
                   >
                     <Eye className="h-4 w-4 mr-2" /> Visualizar Documento
                   </Button>
                </div>
              ) : (
                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 text-center text-yellow-700 text-sm">
                  <AlertTriangle className="h-5 w-5 mx-auto mb-1" />
                  Nenhum documento anexado.
                </div>
              )}
            </div>

            {showRejectionInput && (
              <div className="bg-red-50 p-4 rounded-xl border border-red-100 animate-in fade-in slide-in-from-top-2">
                <label className="block text-sm font-bold text-red-800 mb-2">Motivo da Rejeição</label>
                <Input
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Ex: Documento ilegível, CNPJ inválido..."
                  className="bg-white"
                  autoFocus
                />
                <p className="text-xs text-red-600 mt-2">
                  Este motivo será exibido ao usuário quando ele tentar fazer login.
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Edit Modal - Full Profile Management */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar Usuário Completo"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsEditModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveEdit} disabled={processing}>
              {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Salvar Alterações
            </Button>
          </>
        }
      >
        <div className="flex border-b border-gray-100 mb-6">
          <button
            onClick={() => setActiveTab("general")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === "general" ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-700"}`}
          >
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" /> Geral
            </div>
          </button>
          <button
            onClick={() => setActiveTab("address")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === "address" ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-700"}`}
          >
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" /> Endereço
            </div>
          </button>
          <button
            onClick={() => setActiveTab("products")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === "products" ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-700"}`}
          >
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4" /> Produtos
            </div>
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === "security" ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-700"}`}
          >
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" /> Permissões
            </div>
          </button>
        </div>

        <div className="space-y-6">
          {activeTab === "general" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-left-2 duration-300">
              <div className="space-y-2 col-span-2 md:col-span-1">
                <label className="text-sm font-medium text-gray-700">Nome Completo</label>
                <Input
                  value={editFormData.full_name}
                  onChange={(e) => handleEditChange('full_name', e.target.value)}
                />
              </div>
              <div className="space-y-2 col-span-2 md:col-span-1">
                <label className="text-sm font-medium text-gray-700">Email (Apenas Visualização)</label>
                <div className="flex">
                    <div className="bg-gray-100 flex items-center px-3 border border-r-0 border-gray-200 rounded-l-md text-gray-500">
                        <Mail className="h-4 w-4" />
                    </div>
                    <Input
                        value={editFormData.email}
                        disabled
                        className="rounded-l-none bg-gray-50 text-gray-500"
                    />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Telefone</label>
                <Input
                  value={editFormData.phone}
                  onChange={(e) => handleEditChange('phone', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Visibilidade do Perfil</label>
                <div className="flex items-center gap-2 h-10 px-3 border border-gray-200 rounded-md bg-white">
                    <input 
                        type="checkbox" 
                        id="is_public"
                        checked={editFormData.is_public}
                        onChange={(e) => handleEditChange('is_public', e.target.checked)}
                        className="h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary"
                    />
                    <label htmlFor="is_public" className="text-sm text-gray-700 flex items-center gap-2 cursor-pointer select-none w-full">
                        {editFormData.is_public ? <Globe className="h-4 w-4 text-green-500" /> : <Lock className="h-4 w-4 text-red-500" />}
                        {editFormData.is_public ? "Público (Visível)" : "Privado (Oculto)"}
                    </label>
                </div>
              </div>
              
              <div className="col-span-2 space-y-2">
                <label className="text-sm font-medium text-gray-700">Biografia / Sobre</label>
                <textarea
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={editFormData.bio}
                  onChange={(e) => handleEditChange('bio', e.target.value)}
                  placeholder="Informações sobre o usuário..."
                />
              </div>

              {(editFormData.role === 'shop' || editFormData.role === 'mechanic') && (
                  <div className="col-span-2 space-y-2 animate-in fade-in slide-in-from-top-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Store className="h-4 w-4" /> Nome da Loja / Oficina
                    </label>
                    <Input
                      value={editFormData.store_name}
                      onChange={(e) => handleEditChange('store_name', e.target.value)}
                      placeholder={editFormData.role === 'shop' ? "Nome da Loja" : "Nome da Oficina"}
                    />
                  </div>
              )}
            </div>
          )}

          {activeTab === "address" && (
            <div className="animate-in fade-in slide-in-from-right-2 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Tipo Documento</label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={editFormData.document_type}
                      onChange={(e) => handleEditChange('document_type', e.target.value)}
                    >
                      <option value="cpf">CPF</option>
                      <option value="cnpj">CNPJ</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Número Documento</label>
                    <Input
                      value={editFormData.document_number}
                      onChange={(e) => handleEditChange('document_number', e.target.value)}
                    />
                  </div>
                </div>

                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
                    <MapPin className="h-4 w-4" /> Endereço Completo
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">CEP</label>
                    <Input
                      value={editFormData.address_zipCode}
                      onChange={(e) => handleEditChange('address_zipCode', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Rua</label>
                    <Input
                      value={editFormData.address_street}
                      onChange={(e) => handleEditChange('address_street', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Número</label>
                    <Input
                      value={editFormData.address_number}
                      onChange={(e) => handleEditChange('address_number', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Bairro</label>
                    <Input
                      value={editFormData.address_neighborhood}
                      onChange={(e) => handleEditChange('address_neighborhood', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Cidade</label>
                    <Input
                      value={editFormData.address_city}
                      onChange={(e) => handleEditChange('address_city', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Estado</label>
                    <Input
                      value={editFormData.address_state}
                      onChange={(e) => handleEditChange('address_state', e.target.value)}
                    />
                  </div>
                </div>
            </div>
          )}

          {activeTab === "products" && (
              <div className="animate-in fade-in slide-in-from-right-2 duration-300">
                  <div className="flex justify-between items-center mb-4">
                      <h4 className="font-bold text-gray-900">Produtos Cadastrados ({userProducts.length})</h4>
                  </div>
                  
                  {loadingProducts ? (
                      <div className="text-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                          <p className="text-sm text-gray-500 mt-2">Carregando produtos...</p>
                      </div>
                  ) : userProducts.length > 0 ? (
                      <div className="border rounded-md overflow-hidden">
                          <table className="w-full text-sm text-left">
                              <thead className="bg-gray-50 text-gray-500 font-medium">
                                  <tr>
                                      <th className="px-4 py-2">Nome</th>
                                      <th className="px-4 py-2">Preço</th>
                                      <th className="px-4 py-2">Criado em</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                  {userProducts.map((prod) => (
                                      <tr key={prod.id}>
                                          <td className="px-4 py-2 font-medium">{prod.name}</td>
                                          <td className="px-4 py-2">
                                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(prod.price)}
                                          </td>
                                          <td className="px-4 py-2 text-gray-500">
                                              {formatDate(prod.created_at)}
                                          </td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      </div>
                  ) : (
                      <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                          <Package className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                          <p className="text-gray-500">Este usuário não possui produtos cadastrados.</p>
                      </div>
                  )}
              </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
                <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-lg">
                    <h4 className="font-bold text-yellow-800 flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4" /> Zona de Perigo
                    </h4>
                    <p className="text-sm text-yellow-700 mb-4">
                        Alterações aqui afetam o acesso e permissões do usuário no sistema.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">Função (Role)</label>
                          <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={editFormData.role}
                            onChange={(e) => handleEditChange('role', e.target.value)}
                          >
                            <option value="user">Usuário Comum</option>
                            <option value="mechanic">Mecânico</option>
                            <option value="shop">Loja (Vendedor)</option>
                            <option value="admin">Administrador</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">Status da Conta</label>
                          <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={editFormData.status}
                            onChange={(e) => handleEditChange('status', e.target.value)}
                          >
                            <option value="pending">Pendente</option>
                            <option value="approved">Aprovado</option>
                            <option value="rejected">Rejeitado</option>
                          </select>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-4">
                    <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Lock className="h-4 w-4" /> Senha e Acesso
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                            <p className="font-medium text-gray-900">Redefinição de Senha</p>
                            <p className="text-sm text-gray-500">Envia um email para o usuário com link para criar nova senha.</p>
                        </div>
                        <Button variant="outline" onClick={handlePasswordReset}>
                            <Mail className="h-4 w-4 mr-2" /> Enviar Email
                        </Button>
                    </div>
                </div>
            </div>
          )}
        </div>
      </Modal>
    </DashboardLayout>
  );
}
