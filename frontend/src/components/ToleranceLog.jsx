import { useState, useMemo } from "react";
import { CheckCircle2, XCircle, Filter } from "lucide-react";

const sign = (n) => (n > 0 ? `+${n.toFixed(2)}%` : `${n.toFixed(2)}%`);

export default function ToleranceLog({ log }) {
    const [brokerFilter, setBrokerFilter] = useState("");

    // Exclude exact-zero deviation (no adjustment happened), then apply broker filter
    const filtered = useMemo(() => {
        return (log || [])
            .filter((r) => r.deviation_percent !== 0)
            .filter((r) =>
                brokerFilter ? r.broker.toLowerCase().includes(brokerFilter.toLowerCase()) : true
            );
    }, [log, brokerFilter]);

    // Unique brokers for the dropdown
    const brokers = useMemo(
        () => [...new Set((log || []).map((r) => r.broker))].sort(),
        [log]
    );

    return (
        <div className="card mt-8">
            <div className="flex flex-wrap items-center gap-3 mb-4">
                <div className="flex-1">
                    <h2 className="text-lg font-bold text-gray-200">Adjustment / Tolerance Log</h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                        Completed orders with actual deviation from ordered quantity
                    </p>
                </div>

                {/* Broker filter */}
                <div className="flex items-center gap-2">
                    <Filter size={14} className="text-gray-500" />
                    <select
                        className="input w-44 text-xs"
                        value={brokerFilter}
                        onChange={(e) => setBrokerFilter(e.target.value)}
                    >
                        <option value="">All Brokers</option>
                        {brokers.map((b) => (
                            <option key={b} value={b}>{b}</option>
                        ))}
                    </select>
                </div>

                <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full border border-gray-700">
                    {filtered.length} records
                </span>
            </div>

            {filtered.length === 0 ? (
                <p className="text-sm text-gray-500 py-4 text-center">
                    {brokerFilter
                        ? `No deviation records for "${brokerFilter}".`
                        : "No deviation records yet — all completed orders matched exactly."}
                </p>
            ) : (
                <div className="overflow-x-auto rounded-xl border border-gray-800">
                    <table className="w-full">
                        <thead>
                            <tr>
                                {["Broker", "Item", "Ordered Qty", "Actual Qty", "Deviation %", "Within Tolerance"].map((h) => (
                                    <th key={h} className="th">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((row, i) => {
                                const within = row.within_tolerance;
                                const dev = row.deviation_percent;
                                return (
                                    <tr key={i} className="hover:bg-gray-800/50 transition-colors">
                                        <td className="td font-medium">{row.broker}</td>
                                        <td className="td">{row.item}</td>
                                        <td className="td">{row.ordered_quantity} {row.unit_type}</td>
                                        <td className="td">{row.actual_quantity} {row.unit_type}</td>
                                        <td className={`td font-bold text-base ${within ? "text-green-400" : "text-red-400"}`}>
                                            {sign(dev)}
                                        </td>
                                        <td className="td">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${within
                                                ? "bg-green-900/40 text-green-300 border-green-800"
                                                : "bg-red-900/40 text-red-300 border-red-800"
                                                }`}>
                                                {within ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                                                {within ? "Yes" : "No"}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
