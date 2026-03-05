import { useState, useEffect } from "react";
import { ChevronDown, Trash2 } from "lucide-react";
import { fetchDispatches, deleteDispatch } from "../api/api";

export default function DispatchHistory({ order, onChanged }) {
    const [dispatches, setDispatches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const load = async () => {
        setLoading(true);
        try {
            const res = await fetchDispatches(order.id);
            setDispatches(res.data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) load();
    }, [open]);

    const handleDelete = async (id) => {
        if (!confirm("Delete this dispatch entry?")) return;
        await deleteDispatch(id);
        onChanged();
        load();
    };

    return (
        <tr>
            <td colSpan={13} className="bg-gray-900/60 border-b border-gray-800 px-0 py-0">
                <button
                    onClick={() => setOpen((o) => !o)}
                    className="w-full flex items-center gap-2 px-6 py-2 text-xs text-brand-400 hover:text-brand-300 hover:bg-brand-900/20 transition-colors font-medium"
                >
                    <ChevronDown
                        size={14}
                        className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                    />
                    {open ? "Hide" : "Show"} Dispatch History ({order.dispatches?.length || 0} entries)
                </button>

                {open && (
                    <div className="px-8 pb-4">
                        {loading ? (
                            <p className="text-xs text-gray-500 py-2">Loading…</p>
                        ) : dispatches.length === 0 ? (
                            <p className="text-xs text-gray-500 py-2">No dispatch entries yet.</p>
                        ) : (
                            <table className="w-full text-xs rounded-xl overflow-hidden border border-gray-800/60">
                                <thead>
                                    <tr className="bg-gray-800/70">
                                        {["#", "Dispatch Date", "Qty Sent", "Unit", "Cumulative", "Remaining After", ""].map((h) => (
                                            <th key={h} className="px-3 py-2 text-left text-gray-400 font-semibold uppercase tracking-wider">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {dispatches.map((d, i) => (
                                        <tr key={d.id} className="hover:bg-gray-800/30 transition-colors">
                                            <td className="px-3 py-2 text-gray-500">{i + 1}</td>
                                            <td className="px-3 py-2 text-gray-200">{d.dispatch_date}</td>
                                            <td className="px-3 py-2 text-orange-300 font-semibold">{d.quantity_sent}</td>
                                            <td className="px-3 py-2 text-gray-400">{order.unit_type}</td>
                                            <td className="px-3 py-2 text-blue-300 font-semibold">{d.cumulative_quantity}</td>
                                            <td className={`px-3 py-2 font-semibold ${d.remaining_after < 0 ? "text-red-400" : "text-green-400"}`}>
                                                {d.remaining_after}
                                            </td>
                                            <td className="px-3 py-2">
                                                <button
                                                    onClick={() => handleDelete(d.id)}
                                                    className="text-gray-600 hover:text-red-400 transition-colors"
                                                    title="Delete dispatch"
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </td>
        </tr>
    );
}
