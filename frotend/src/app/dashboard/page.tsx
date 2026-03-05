export default function DashboardPage() {
  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Quality Score Section */}
      <div className="md:col-span-1 bg-white p-6 rounded-2xl border shadow-sm flex flex-col items-center text-center">
        <h3 className="text-gray-500 font-bold uppercase text-xs">Quality Survey Score</h3>
        <div className="text-6xl font-black text-orange-500 my-4">88<span className="text-2xl">/100</span></div>
        <p className="text-sm text-gray-400">Your produce meets 90% of Fanaka Export Standards.</p>
      </div>

      {/* Wallet Section */}
      <div className="md:col-span-2 bg-green-800 p-8 rounded-2xl text-white shadow-xl relative overflow-hidden">
        <p className="text-sm opacity-80 uppercase tracking-widest">Total Earnings</p>
        <h2 className="text-5xl font-black mt-2">KES 45,200.50</h2>
        <div className="mt-8 flex gap-4">
          <button className="bg-white text-green-800 px-6 py-2 rounded-xl font-bold">Withdraw to M-Pesa</button>
          <button className="bg-green-700 px-6 py-2 rounded-xl font-bold border border-green-600">View History</button>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="md:col-span-3 bg-white p-6 rounded-2xl border shadow-sm">
        <h3 className="font-bold mb-4">Recent Transactions</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3">Item</th>
                <th className="p-3">Status</th>
                <th className="p-3">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td className="p-3 font-medium">10 Bags of Onions</td>
                <td className="p-3 text-blue-600">Pending Inspection</td>
                <td className="p-3 font-bold">KES 12,000</td>
              </tr>
              <tr className="border-t">
                <td className="p-3 font-medium">Fungicide Purchase</td>
                <td className="p-3 text-green-600">Completed</td>
                <td className="p-3 font-bold text-red-500">- KES 2,500</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}