import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { createOrder, updateOrder } from "../api/api";

const PURCHASE_ITEMS = ["Cottonseed"];
const SALE_ITEMS = [
    "Cattlefeed Husk",
    "Cottonseed Linters",
    "Cottonseed",
    "Cottonseed Oil",
    "Cottonseed Oil Cake",
];

const UNIT_TYPES = ["Ton", "Trucks"];
const ORDER_TYPES = ["Purchase", "Sale"];

const emptyForm = {
    broker_name: "",
    item_name: "",
    order_type: "Purchase",
    order_date: new Date().toISOString().slice(0, 10),
    quantity_ordered: "",
    unit_type: "Ton",
    price_per_unit: "",
};

export default function OrderModal({ order, onClose, onSaved }) {
    const [form, setForm] = useState(emptyForm);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");

    useEffect(() => {
        if (order) {
            setForm({
                broker_name: order.broker_name,
                item_name: order.item_name,
                order_type: order.order_type,
                order_date: order.order_date,
                quantity_ordered: order.quantity_ordered,
                unit_type: order.unit_type,
                price_per_unit: order.price_per_unit,
            });
        }
    }, [order]);

    const items = form.order_type === "Purchase" ? PURCHASE_ITEMS : SALE_ITEMS;

    const set = (k, v) =>
        setForm((f) => ({
            ...f,
            [k]: v,
            ...(k === "order_type" ? { item_name: "" } : {}),
        }));

    const totalPrice = (form.quantity_ordered || 0) * (form.price_per_unit || 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErr("");
        if (!form.broker_name || !form.item_name || !form.quantity_ordered || !form.price_per_unit) {
            setErr("Please fill all required fields.");
            return;
        }
        setLoading(true);
        try {
            const payload = {
                ...form,
                quantity_ordered: parseFloat(form.quantity_ordered),
                price_per_unit: parseFloat(form.price_per_unit),
            };
            if (order) {
                await updateOrder(order.id, payload);
            } else {
                await createOrder(payload);
            }
            onSaved();
            onClose();
        } catch (e) {
            setErr(e.response?.data?.detail || "Failed to save order.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-lg">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
                    <h2 className="text-lg font-bold text-white">
                        {order ? "Edit Order" : "New Order"}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {err && (
                        <div className="bg-red-900/40 border border-red-800 text-red-300 text-sm px-4 py-2.5 rounded-lg">
                            {err}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Order Type *</label>
                            <select
                                className="input"
                                value={form.order_type}
                                onChange={(e) => set("order_type", e.target.value)}
                            >
                                {ORDER_TYPES.map((t) => <option key={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="label">Item Name *</label>
                            <select
                                className="input"
                                value={form.item_name}
                                onChange={(e) => set("item_name", e.target.value)}
                            >
                                <option value="">Select item</option>
                                {items.map((i) => <option key={i}>{i}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="label">Broker Name *</label>
                        <input
                            className="input"
                            placeholder="e.g. Ramesh Traders"
                            value={form.broker_name}
                            onChange={(e) => set("broker_name", e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Order Date *</label>
                            <input
                                type="date"
                                className="input"
                                value={form.order_date}
                                onChange={(e) => set("order_date", e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="label">Unit Type *</label>
                            <select
                                className="input"
                                value={form.unit_type}
                                onChange={(e) => set("unit_type", e.target.value)}
                            >
                                {UNIT_TYPES.map((u) => <option key={u}>{u}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Quantity Ordered *</label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                className="input"
                                placeholder="0"
                                value={form.quantity_ordered}
                                onChange={(e) => set("quantity_ordered", e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="label">Price per Unit (₹) *</label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                className="input"
                                placeholder="0.00"
                                value={form.price_per_unit}
                                onChange={(e) => set("price_per_unit", e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="bg-gray-800/60 rounded-xl px-4 py-3 flex justify-between items-center border border-gray-700">
                        <span className="text-sm text-gray-400 font-medium">Total Price (auto)</span>
                        <span className="text-xl font-bold text-brand-400">
                            ₹{totalPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </span>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
                            {loading ? "Saving…" : order ? "Update Order" : "Create Order"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
