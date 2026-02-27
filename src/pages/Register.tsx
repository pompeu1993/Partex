import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ArrowLeft, Mail, Lock, Loader2, Eye, EyeOff, Wrench, Store, User, Phone, MapPin, Upload, FileText, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export function Register() {
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState<"customer" | "mechanic" | "shop">("customer");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    phone: "",
    documentType: "cpf", // cpf or cnpj
    documentNumber: "",
    address: {
      zipCode: "",
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: ""
    }
  });

  const [documentFile, setDocumentFile] = useState<File | null>(null);

  useEffect(() => {
    // If user is already logged in, redirect
    if (user) {
      navigate("/dashboard");
    }

    // Check URL params for pre-selected role (mobile flow)
    const type = searchParams.get("type");
    if (type && ["customer", "mechanic", "shop"].includes(type)) {
      setUserType(type as any);
      // If type is selected via URL, we might want to skip step 1 or just highlight it
    }
  }, [user, navigate, searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev as any)[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setDocumentFile(e.target.files[0]);
    }
  };

  const handleNext = () => {
    // Validation logic for each step
    if (step === 2) {
      if (!formData.email || !formData.password || !formData.fullName) {
        toast.error("Preencha todos os campos obrigatórios");
        return;
      }
    }
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Sign Up
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            role: userType, // Store intended role in metadata initially
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Erro ao criar usuário");

      const userId = authData.user.id;

      // 2. Upload Document (if mechanic or shop)
      let documentUrl = null;
      if (userType !== 'customer' && documentFile) {
        const fileExt = documentFile.name.split('.').pop();
        const filePath = `${userId}/document.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('user-documents')
          .upload(filePath, documentFile);

        if (uploadError) throw uploadError;
        documentUrl = filePath;
      }

      // 3. Update Profile with details
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          role: userType,
          phone: formData.phone,
          address: formData.address,
          document_url: documentUrl,
          document_type: formData.documentType,
          status: userType === 'customer' ? 'approved' : 'pending' // Customers auto-approved, others pending
        })
        .eq('id', userId);

      if (profileError) throw profileError;

      // 4. Create Notification for Admins (if pending approval)
      if (userType !== 'customer') {
        // Fetch all admins
        const { data: admins } = await supabase
          .from('profiles')
          .select('id')
          .eq('role', 'admin');
        
        if (admins && admins.length > 0) {
          const notifications = admins.map(admin => ({
            user_id: admin.id,
            title: "Novo Cadastro Pendente",
            message: `O usuário ${formData.fullName} solicitou cadastro como ${userType === 'mechanic' ? 'Mecânico' : 'Loja'}. Verifique os documentos.`,
            read: false
          }));

          await supabase.from('notifications').insert(notifications);
        }
      }

      toast.success("Cadastro realizado com sucesso!");
      
      // Delay navigation to ensure toast is seen and auth state settles
      setTimeout(() => {
          navigate("/login");
      }, 1500);

    } catch (error: any) {
      console.error("Registration error:", error);
      
      // Handle specific Supabase errors
      if (error.message?.includes("rate limit")) {
        toast.error("Muitas tentativas de cadastro. Por favor, aguarde alguns minutos.");
      } else if (error.message?.includes("User already registered")) {
        toast.error("Este email já está cadastrado.");
      } else {
        toast.error(error.message || "Erro ao realizar cadastro");
      }
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Como você quer usar a Partex?</h2>
        <p className="text-gray-500">Escolha o perfil que melhor se adapta a você</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          type="button"
          onClick={() => setUserType("customer")}
          className={`p-6 rounded-xl border-2 text-left transition-all ${
            userType === "customer"
              ? "border-primary bg-orange-50 ring-2 ring-primary/20"
              : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
          }`}
        >
          <div className={`h-12 w-12 rounded-full flex items-center justify-center mb-4 ${
            userType === "customer" ? "bg-primary text-white" : "bg-gray-100 text-gray-500"
          }`}>
            <User className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-gray-900 mb-1">Cliente</h3>
          <p className="text-sm text-gray-500">Busco peças e serviços para meu veículo</p>
        </button>

        <button
          type="button"
          onClick={() => setUserType("mechanic")}
          className={`p-6 rounded-xl border-2 text-left transition-all ${
            userType === "mechanic"
              ? "border-primary bg-orange-50 ring-2 ring-primary/20"
              : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
          }`}
        >
          <div className={`h-12 w-12 rounded-full flex items-center justify-center mb-4 ${
            userType === "mechanic" ? "bg-primary text-white" : "bg-gray-100 text-gray-500"
          }`}>
            <Wrench className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-gray-900 mb-1">Mecânico</h3>
          <p className="text-sm text-gray-500">Ofereço serviços de manutenção e reparo</p>
        </button>

        <button
          type="button"
          onClick={() => setUserType("shop")}
          className={`p-6 rounded-xl border-2 text-left transition-all ${
            userType === "shop"
              ? "border-primary bg-orange-50 ring-2 ring-primary/20"
              : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
          }`}
        >
          <div className={`h-12 w-12 rounded-full flex items-center justify-center mb-4 ${
            userType === "shop" ? "bg-primary text-white" : "bg-gray-100 text-gray-500"
          }`}>
            <Store className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-gray-900 mb-1">Loja de Peças</h3>
          <p className="text-sm text-gray-500">Vendo autopeças e acessórios</p>
        </button>
      </div>

      <Button onClick={handleNext} className="w-full" size="lg">
        Continuar
      </Button>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Crie sua conta</h2>
        <p className="text-gray-500">Preencha seus dados de acesso</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Nome Completo</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              name="fullName"
              placeholder="Seu nome completo"
              className="pl-10"
              value={formData.fullName}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              name="email"
              type="email"
              placeholder="seu@email.com"
              className="pl-10"
              value={formData.email}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Senha</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Mínimo 6 caracteres"
              className="pl-10 pr-10"
              value={formData.password}
              onChange={handleInputChange}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Telefone / WhatsApp</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              name="phone"
              placeholder="(00) 00000-0000"
              className="pl-10"
              value={formData.phone}
              onChange={handleInputChange}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <Button variant="outline" onClick={handleBack} className="w-full">
          Voltar
        </Button>
        <Button onClick={handleNext} className="w-full">
          Continuar
        </Button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">
          {userType === "customer" ? "Endereço" : "Dados Profissionais"}
        </h2>
        <p className="text-gray-500">
          {userType === "customer" 
            ? "Onde você gostaria de receber seus pedidos?" 
            : "Precisamos de alguns documentos para validar seu cadastro"}
        </p>
      </div>

      <div className="space-y-4">
        {/* Address Fields - Common for all but especially important for delivery/service location */}
        <div className="grid grid-cols-2 gap-4">
           <div className="space-y-2 col-span-2 md:col-span-1">
            <label className="text-sm font-medium text-gray-700">CEP</label>
            <Input
              name="address.zipCode"
              placeholder="00000-000"
              value={formData.address.zipCode}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2 col-span-2 md:col-span-1">
             <label className="text-sm font-medium text-gray-700">Cidade</label>
             <Input
               name="address.city"
               placeholder="Cidade"
               value={formData.address.city}
               onChange={handleInputChange}
             />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Endereço</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              name="address.street"
              placeholder="Rua, Avenida..."
              className="pl-10"
              value={formData.address.street}
              onChange={handleInputChange}
            />
          </div>
        </div>

        {/* Document Upload for Professionals */}
        {userType !== "customer" && (
          <div className="pt-4 border-t border-gray-100">
            <h3 className="font-medium text-gray-900 mb-4">Documentação</h3>
            
            <div className="bg-blue-50 p-4 rounded-lg mb-4 flex gap-3">
              <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-bold mb-1">Validação Obrigatória</p>
                <p>Para garantir a segurança da plataforma, precisamos validar seu documento profissional (CNPJ ou Certificado).</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                 <label className="text-sm font-medium text-gray-700">Tipo de Documento</label>
                 <select 
                   name="documentType"
                   className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                   value={formData.documentType}
                   onChange={(e) => setFormData({...formData, documentType: e.target.value})}
                 >
                   <option value="cpf">CPF</option>
                   <option value="cnpj">CNPJ</option>
                 </select>
              </div>
              
              <div className="space-y-2">
                 <label className="text-sm font-medium text-gray-700">Número do Documento</label>
                 <Input
                   name="documentNumber"
                   placeholder="Apenas números"
                   value={formData.documentNumber}
                   onChange={handleInputChange}
                 />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Upload do Documento (Foto ou PDF)</label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                  <input 
                    type="file" 
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                  />
                  {documentFile ? (
                    <div className="text-center">
                      <FileText className="h-8 w-8 text-primary mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-900">{documentFile.name}</p>
                      <p className="text-xs text-gray-500">{(documentFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-900">Clique para enviar</p>
                      <p className="text-xs text-gray-500">JPG, PNG ou PDF</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-4">
        <Button variant="outline" onClick={handleBack} className="w-full">
          Voltar
        </Button>
        <Button onClick={handleSubmit} className="w-full" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Finalizar Cadastro"}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8">
        <Link to="/" className="flex justify-center items-center gap-2 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded bg-primary text-white font-bold text-xl">
            P
          </div>
          <span className="text-2xl font-heading font-bold text-gray-900">PartEX</span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-4 shadow sm:rounded-xl sm:px-10 border border-gray-100">
          {/* Progress Steps */}
          <div className="flex justify-between mb-8 relative">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -z-10" />
            {[1, 2, 3].map((s) => (
              <div 
                key={s}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  step >= s ? "bg-primary text-white" : "bg-gray-100 text-gray-400"
                }`}
              >
                {s}
              </div>
            ))}
          </div>

          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </div>

        <p className="mt-6 text-center text-sm text-gray-600">
          Já tem uma conta?{" "}
          <Link to="/login" className="font-medium text-primary hover:text-orange-600">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
