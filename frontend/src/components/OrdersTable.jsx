import { useState, useEffect, useCallback } from "react";
import {
    Plus, Truck, Pencil, Trash2, ArrowUpDown, ArrowUp, ArrowDown, Filter, X
} from "lucide-react";
import { fetchOrders, deleteOrder } from "../api/api";
import DispatchHistory from "./DispatchHistory";
import OrderModal from "./OrderModal";
import DispatchModal from "./DispatchModal";
import DeleteConfirm from "./DeleteConfirm";

const STATUS_BADGE = {
    Pending: "badge-pending",
    Partial: "badge-partial",
    Completed: "badge-completed",
};

const ORDER_TYPE_COLOR = {
    Purchase: "text-blue-400 bg-blue-900/30 border border-blue-800",
    Sale: "text-purple-400 bg-purple-900/30 border border-purple-800",
};

const SORTABLE = [
    { key: "order_date", label: "Date" },
    { key: "quantity_ordered", label: "Qty Ordered" },
    { key: "remaining_quantity", label: "Remaining" },
    { key: "total_price", label: "Total Price" },
    { key: "status", label: "Status" },
    { key: "broker_name", label: "Broker" },
];

export default function OrdersTable({ onRefreshSummary }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);

    // Sort
    const [sortBy, setSortBy] = useState("created_at");
    const [sortDir, setSortDir] = useState("desc");

    // Filters
    const [filters, setFilters] = useState({ broker: "", item: "", status: "", order_type: "", date_from: "", date_to: "" });
    const [showFilters, setShowFilters] = useState(false);

    // Modals
    const [orderModal, setOrderModal] = useState(null);  // null | "new" | order-obj
    const [dispatchModal, setDispatchModal] = useState(null); // null | order-obj
    const [deleteModal, setDeleteModal] = useState(null);  // null | order-obj

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                sort_by: sortBy,
                sort_dir: sortDir,
                ...(filters.broker && { broker: filters.broker }),
                ...(filters.item && { item: filters.item }),
                ...(filters.status && { status: filters.status }),
                ...(filters.order_type && { order_type: filters.order_type }),
                ...(filters.date_from && { date_from: filters.date_from }),
                ...(filters.date_to && { date_to: filters.date_to }),
            };
            const res = await fetchOrders(params);
            setOrders(res.data);
        } finally {
            setLoading(false);
        }
    }, [sortBy, sortDir, filters]);

    useEffect(() => { load(); }, [load]);

    const handleSort = (key) => {
        if (sortBy === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        else { setSortBy(key); setSortDir("desc"); }
    };

    const SortIcon = ({ col }) => {
        if (sortBy !== col) return <ArrowUpDown size={12} className="text-gray-600" />;
        return sortDir === "asc" ? <ArrowUp size={12} className="text-brand-400" /> : <ArrowDown size={12} className="text-brand-400" />;
    };

    const handleDeleteConfirmed = async () => {
        await deleteOrder(deleteModal.id);
        setDeleteModal(null);
        load();
        onRefreshSummary?.();
    };

    const clearFilters = () => setFilters({ broker: "", item: "", status: "", order_type: "", date_from: "", date_to: "" });
    const hasFilters = Object.values(filters).some(Boolean);

    return (
        <div className="card mt-6">
            {/* Header */}
            <div className="flex flex-wrap items-center gap-3 mb-5">
                <div className="flex-1">
                    <h2 className="text-lg font-bold text-gray-200">Orders</h2>
                    <p className="text-xs text-gray-500 mt-0.5">{orders.length} records</p>
                </div>
                <button
                    onClick={() => setShowFilters((s) => !s)}
                    className={`btn-secondary ${hasFilters ? "border-brand-600 text-brand-400" : ""}`}
                >
                    <Filter size={14} />
                    Filters {hasFilters && <span className="bg-brand-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">!</span>}
                </button>
                {hasFilters && (
                    <button onClick={clearFilters} className="btn-secondary text-red-400 border-red-800">
                        <X size={14} /> Clear
                    </button>
                )}
                <button onClick={() => setOrderModal("new")} className="btn-primary">
                    <Plus size={15} /> New Order
                </button>
            </div>

            {/* Filters panel */}
            {showFilters && (
                <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 mb-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    <div>
                        <label className="label">Broker</label>
                        <input className="input" placeholder="Search…" value={filters.broker}
                            onChange={(e) => setFilters((f) => ({ ...f, broker: e.target.value }))} />
                    </div>
                    <div>
                        <label className="label">Item</label>
                        <input className="input" placeholder="Search…" value={filters.item}
                            onChange={(e) => setFilters((f) => ({ ...f, item: e.target.value }))} />
                    </div>
                    <div>
                        <label className="label">Status</label>
                        <select className="input" value={filters.status}
                            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}>
                            <option value="">All</option>
                            <option>Pending</option>
                            <option>Partial</option>
                            <option>Completed</option>
                        </select>
                    </div>
                    <div>
                        <label className="label">Type</label>
                        <select className="input" value={filters.order_type}
                            onChange={(e) => setFilters((f) => ({ ...f, order_type: e.target.value }))}>
                            <option value="">All</option>
                            <option>Purchase</option>
                            <option>Sale</option>
                        </select>
                    </div>
                    <div>
                        <label className="label">Date From</label>
                        <input type="date" className="input" value={filters.date_from}
                            onChange={(e) => setFilters((f) => ({ ...f, date_from: e.target.value }))} />
                    </div>
                    <div>
                        <label className="label">Date To</label>
                        <input type="date" className="input" value={filters.date_to}
                            onChange={(e) => setFilters((f) => ({ ...f, date_to: e.target.value }))} />
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-gray-800">
                <table className="w-full">
                    <thead>
                        <tr>
                            <th className="th">
                                <button onClick={() => handleSort("broker_name")} className="flex items-center gap-1.5 hover:text-brand-400 transition-colors">
                                    Broker <SortIcon col="broker_name" />
                                </button>
                            </th>
                            <th className="th">Item</th>
                            <th className="th">Type</th>
                            <th className="th">
                                <button onClick={() => handleSort("order_date")} className="flex items-center gap-1.5 hover:text-brand-400 transition-colors">
                                    Date <SortIcon col="order_date" />
                                </button>
                            </th>
                            <th className="th">
                                <button onClick={() => handleSort("quantity_ordered")} className="flex items-center gap-1.5 hover:text-brand-400 transition-colors">
                                    Ordered <SortIcon col="quantity_ordered" />
                                </button>
                            </th>
                            <th className="th">Unit</th>
                            <th className="th">Price/Unit</th>
                            <th className="th">
                                <button onClick={() => handleSort("total_price")} className="flex items-center gap-1.5 hover:text-brand-400 transition-colors">
                                    Total ₹ <SortIcon col="total_price" />
                                </button>
                            </th>
                            <th className="th">Sent</th>
                            <th className="th">
                                <button onClick={() => handleSort("remaining_quantity")} className="flex items-center gap-1.5 hover:text-brand-400 transition-colors">
                                    Remaining <SortIcon col="remaining_quantity" />
                                </button>
                            </th>
                            <th className="th">
                                <button onClick={() => handleSort("status")} className="flex items-center gap-1.5 hover:text-brand-400 transition-colors">
                                    Status <SortIcon col="status" />
                                </button>
                            </th>
                            <th className="th text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={12} className="td text-center py-12 text-gray-500">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
                                        Loading orders…
                                    </div>
                                </td>
                            </tr>
                        ) : orders.length === 0 ? (
                            <tr>
                                <td colSpan={12} className="td text-center py-12 text-gray-500">
                                    No orders found. Create your first order!
                                </td>
                            </tr>
                        ) : (
                            orders.map((order) => (
                                <>
                                    <tr key={order.id} className="hover:bg-gray-800/40 transition-colors group">
                                        <td className="td font-medium">{order.broker_name}</td>
                                        <td className="td text-gray-300">{order.item_name}</td>
                                        <td className="td">
                                            <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-semibold ${ORDER_TYPE_COLOR[order.order_type]}`}>
                                                {order.order_type}
                                            </span>
                                        </td>
                                        <td className="td text-gray-400">{order.order_date}</td>
                                        <td className="td font-semibold">{order.quantity_ordered}</td>
                                        <td className="td text-gray-400">{order.unit_type}</td>
                                        <td className="td text-gray-300">₹{order.price_per_unit.toLocaleString("en-IN")}</td>
                                        <td className="td font-semibold text-brand-300">₹{order.total_price.toLocaleString("en-IN")}</td>
                                        <td className="td text-orange-400 font-semibold">{order.quantity_sent}</td>
                                        <td className={`td font-semibold ${order.remaining_quantity < 0 ? "text-red-400" : order.remaining_quantity === 0 ? "text-green-400" : "text-yellow-400"}`}>
                                            {order.remaining_quantity}
                                        </td>
                                        <td className="td">
                                            <span className={STATUS_BADGE[order.status] || "badge-pending"}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="td">
                                            <div className="flex items-center gap-1.5 justify-center">
                                                <button
                                                    onClick={() => setDispatchModal(order)}
                                                    title="Add dispatch"
                                                    className="p-1.5 rounded-lg text-gray-500 hover:text-orange-400 hover:bg-orange-900/20 transition-all"
                                                >
                                                    <Truck size={14} />
                                                </button>
                                                <button
                                                    onClick={() => setOrderModal(order)}
                                                    title="Edit order"
                                                    className="p-1.5 rounded-lg text-gray-500 hover:text-blue-400 hover:bg-blue-900/20 transition-all"
                                                >
                                                    <Pencil size={14} />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteModal(order)}
                                                    title="Delete order"
                                                    className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-900/20 transition-all"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    <DispatchHistory
                                        key={`dh-${order.id}`}
                                        order={order}
                                        onChanged={() => { load(); onRefreshSummary?.(); }}
                                    />
                                </>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modals */}
            {orderModal && (
                <OrderModal
                    order={orderModal === "new" ? null : orderModal}
                    onClose={() => setOrderModal(null)}
                    onSaved={() => { load(); onRefreshSummary?.(); }}
                />
            )}
            {dispatchModal && (
                <DispatchModal
                    order={dispatchModal}
                    onClose={() => setDispatchModal(null)}
                    onSaved={() => { load(); onRefreshSummary?.(); }}
                />
            )}
            {deleteModal && (
                <DeleteConfirm
                    order={deleteModal}
                    onClose={() => setDeleteModal(null)}
                    onConfirm={handleDeleteConfirmed}
                />
            )}
        </div>
    );
}
