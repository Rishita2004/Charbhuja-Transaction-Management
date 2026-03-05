import {
    ShoppingCart, TrendingUp, Clock, CheckCircle2, Package, DollarSign,
} from "lucide-react";

const fmt = (n) => typeof n === "number" ? n.toLocaleString("en-IN") : "0";

const cards = [
    { key: "total_purchase_orders", label: "Purchase Orders", icon: ShoppingCart, color: "from-blue-600 to-blue-800", text: "text-blue-300" },
    { key: "total_sales_orders", label: "Sales Orders", icon: TrendingUp, color: "from-purple-600 to-purple-800", text: "text-purple-300" },
    { key: "pending_orders", label: "Pending Orders", icon: Clock, color: "from-orange-600 to-orange-800", text: "text-orange-300" },
    { key: "completed_orders", label: "Completed", icon: CheckCircle2, color: "from-green-600 to-green-800", text: "text-green-300" },
    { key: "total_volume", label: "Total Volume", icon: Package, color: "from-teal-600 to-teal-800", text: "text-teal-300", suffix: " units" },
    { key: "total_transaction_value", label: "Total Value", icon: DollarSign, color: "from-brand-600 to-brand-800", text: "text-brand-300", prefix: "₹" },
];

export default function SummaryCards({ summary }) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            {cards.map(({ key, label, icon: Icon, color, text, prefix = "", suffix = "" }) => (
                <div key={key} className="card flex flex-col gap-3 hover:border-gray-700 transition-all duration-200 group">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200`}>
                        <Icon size={18} className="text-white" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-medium">{label}</p>
                        <p className={`text-2xl font-bold mt-0.5 ${text}`}>
                            {prefix}{fmt(summary?.[key])}{suffix}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}
