export function BrandRow() {
  const brands = ["Bosch", "NGK", "SKF", "Mobil"];
  return (
    <div className="grid grid-cols-4 gap-3">
      {brands.map((b) => (
        <div
          key={b}
          className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 flex flex-col items-center"
        >
          <div className="h-10 w-10 rounded-lg bg-gray-100" />
          <span className="mt-2 text-xs text-gray-700 font-medium">{b}</span>
        </div>
      ))}
    </div>
  );
}

