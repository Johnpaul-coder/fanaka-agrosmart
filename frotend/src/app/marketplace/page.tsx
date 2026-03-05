export default function MarketplacePage() {
  const products = [
    { id: 1, name: "NPK 17-17-17 Fertilizer", price: 3500, category: "Inputs", store: "AgroVet Nairobi" },
    { id: 2, name: "Certified Maize Seeds (2kg)", price: 800, category: "Seeds", store: "Western Seeds Ltd" },
    { id: 3, name: "Organic Tomatoes (Grade A)", price: 120, category: "Produce", store: "Kiambu Farmer Hub" },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">Marketplace</h2>
        <div className="space-x-2">
          <button className="bg-gray-200 px-3 py-1 rounded text-sm">Inputs</button>
          <button className="bg-gray-200 px-3 py-1 rounded text-sm">Produce</button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map((p) => (
          <div key={p.id} className="bg-white p-5 rounded-xl shadow-sm border hover:shadow-md transition">
            <span className="text-xs font-bold text-orange-600 uppercase">{p.category}</span>
            <h3 className="text-xl font-bold mt-1">{p.name}</h3>
            <p className="text-gray-500 text-sm mb-4">Sold by: {p.store}</p>
            <div className="flex justify-between items-center">
              <span className="text-2xl font-black text-green-700">KES {p.price}</span>
              <button className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-bold">Add to Cart</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}