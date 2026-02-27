import { Link } from "react-router-dom";

type Category = {
  id: number | string;
  name: string;
  icon?: React.ReactNode;
};

export function CategoryGrid({ items }: { items: Category[] }) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
      {items.map((c) => (
        <Link
          key={c.id}
          to={`/search?category=${c.id}`}
          className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 flex flex-col items-center gap-2 hover:shadow-md transition"
        >
          <div className="h-10 w-10 rounded-full bg-orange-50 flex items-center justify-center text-primary text-xl">
            {c.icon ?? "🔧"}
          </div>
          <span className="text-xs font-medium text-gray-700">{c.name}</span>
        </Link>
      ))}
    </div>
  );
}

