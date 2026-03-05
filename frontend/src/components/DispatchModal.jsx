import { useState } from "react";
import { X } from "lucide-react";
import { addDispatch } from "../api/api";

export default function DispatchModal({ order, onClose, onSaved }) {
    const [form, setForm] = useState({
        dispatch_date: new Date().toISOString().slice(0, 10),
        quantity_sent: "",
    });
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErr("");
        if (!form.quantity_sent || parseFloat(form.quantity_sent) <= 0) {
            setErr("Please enter a valid quantity.");
            return;
        }
        setLoading(true);
        try {
            await addDispatch({
                order_id: order.id,
                dispatch_date: form.dispatch_date,
                quantity_sent: parseFloat(form.quantity_sent),
            });
            onSaved();
            onClose();
        } catch (e) {
            setErr(e.response?.data?.detail || "Failed to add dispatch.");
        } finally {
            setLoading(false);
        }
    };

    const newCumulative = order.quantity_sent + (parseFloat(form.quantity_sent) || 0);
    const newRemaining = order.quantity_ordered - newCumulative;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-md">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
                    <div>
                        <h2 className="text-lg font-bold text-white">Add Dispatch</h2>
                        <p className="text-xs text-gray-500 mt-0.5">{order.order_id} — {order.item_name}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="px-6 py-4 bg-gray-800/40 border-b border-gray-800 grid grid-cols-3 gap-3">
                    <div className="text-center">
                        <p className="text-xs text-gray-500">Ordered</p>
                        <p className="text-lg font-bold text-gray-200">{order.quantity_ordered} <span className="text-xs text-gray-400">{order.unit_type}</span></p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-gray-500">Sent So Far</p>
                        <p className="text-lg font-bold text-orange-400">{order.quantity_sent} <span className="text-xs text-gray-400">{order.unit_type}</span></p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-gray-500">Remaining</p>
                        <p className="text-lg font-bold text-red-400">{order.remaining_quantity} <span className="text-xs text-gray-400">{order.unit_type}</span></p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {err && (
                        <div className="bg-red-900/40 border border-red-800 text-red-300 text-sm px-4 py-2.5 rounded-lg">
                            {err}
                        </div>
                    )}

                    <div>
                        <label className="label">Dispatch Date *</label>
                        <input
                            type="date"
                            className="input"
                            value={form.dispatch_date}
                            onChange={(e) => setForm((f) => ({ ...f, dispatch_date: e.target.value }))}
                        />
                    </div>

                    <div>
                        <label className="label">Quantity Sent ({order.unit_type}) *</label>
                        <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            className="input"
                            placeholder="0"
                            value={form.quantity_sent}
                            onChange={(e) => setForm((f) => ({ ...f, quantity_sent: e.target.value }))}
                        />
                    </div>

                    {form.quantity_sent && (
                        <div className="bg-gray-800/60 rounded-xl px-4 py-3 border border-gray-700 space-y-1.5">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">After Dispatch — Total Sent:</span>
                                <span className="font-semibold text-orange-300">{newCumulative.toFixed(2)} {order.unit_type}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Remaining After:</span>
                                <span className={`font-semibold ${newRemaining < 0 ? "text-red-400" : "text-green-400"}`}>
                                    {newRemaining.toFixed(2)} {order.unit_type}
                                </span>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3 pt-1">
                        <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
                            {loading ? "Saving…" : "Add Dispatch"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
