export default function AIAuditor({ transactions, aiQuestions, analyzing, runAIAnalysis }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-4">AI Auditor</h2>
      <p className="text-zinc-400 text-sm mb-6">Unlock Gemini intelligence to flag suspicious spending.</p>

      <button
        onClick={runAIAnalysis}
        disabled={analyzing || transactions.length === 0}
        className="px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 mb-8"
      >
        {analyzing ? 'Analyzing...' : 'Unlock Intelligence'}
      </button>

      {aiQuestions.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white">Flagged Transactions</h3>
          {aiQuestions.map((q, idx) => (
            <div key={idx} className="bg-zinc-800 border border-zinc-700 p-4 rounded-xl">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-zinc-200 font-medium">{q.description}</p>
                  <p className="text-zinc-400 text-sm italic mt-1">"{q.question}"</p>
                </div>
                <span className="text-rose-400 font-semibold">₹{q.amount}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        transactions.length > 0 && !analyzing && (
          <p className="text-zinc-400">No flagged transactions yet. Run the analysis.</p>
        )
      )}
    </div>
  );
}