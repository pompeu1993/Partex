import { MessageSquare, Tags, CreditCard } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      id: 1,
      title: "Solicite uma Cotação",
      desc: "Envie sua lista ou descreva o que precisa",
      Icon: MessageSquare,
    },
    {
      id: 2,
      title: "Compare Preços",
      desc: "Receba cotações de lojas parceiras",
      Icon: Tags,
    },
    {
      id: 3,
      title: "Finalize a Compra",
      desc: "Escolha a melhor oferta e pague online",
      Icon: CreditCard,
    },
  ];
  return (
    <div className="space-y-3">
      {steps.map(({ id, title, desc, Icon }) => (
        <div
          key={id}
          className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-start gap-3"
        >
          <div className="h-10 w-10 rounded-full bg-orange-50 flex items-center justify-center">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">{title}</p>
            <p className="text-sm text-gray-500">{desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

