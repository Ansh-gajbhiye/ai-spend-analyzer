export default function Transactions({ transactions }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Transactions</h2>
      {transactions.length === 0 ? (
        <p className="text-zinc-400">No transactions uploaded yet.</p>
      ) : (
        <div className="bg-zinc-800 border border-zinc-700 p-6 rounded-xl shadow-sm">
          <div className="overflow-x-auto max-h-[500px]">
            <table className="w-full text-left">
              <thead className="text-zinc-400 text-xs uppercase tracking-wider">
                <tr className="border-b border-zinc-700">
                  <th className="py-3 pr-4">Date</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 pl-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-700">
                {transactions.map((t, idx) => {
                  const amt = parseFloat(t.amount !== undefined ? t.amount : t.Amount);
                  const isNegative = amt < 0;
                  return (
                    <tr key={idx} className="hover:bg-zinc-700/50 transition-colors">
                      <td className="py-4 pr-4 whitespace-nowrap text-sm text-zinc-400">{t.date || t.Date}</td>
                      <td className="py-4 px-4 text-sm text-zinc-200 font-medium">{t.description || t.Description}</td>
                      <td className={`py-4 pl-4 whitespace-nowrap text-sm font-semibold text-right ${isNegative ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {isNegative ? `-₹${Math.abs(amt)}` : `+₹${amt}`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}