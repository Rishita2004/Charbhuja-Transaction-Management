import { AlertTriangle } from "lucide-react";

export default function DeleteConfirm({ order, onClose, onConfirm }) {
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-sm p-6">
                <div className="flex flex-col items-center text-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-red-900/30 border border-red-800 flex items-center justify-center">
                        <AlertTriangle size={26} className="text-red-400" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white">Delete Order?</h2>
                        <p className="text-sm text-gray-400 mt-1">
                            Are you sure you want to delete order{" "}
                            <span className="text-brand-400 font-semibold">{order.order_id}</span>?
                            This will also remove all dispatch history.
                        </p>
                    </div>
                    <div className="flex gap-3 w-full pt-1">
                        <button onClick={onClose} className="btn-secondary flex-1 justify-center">
                            Cancel
                        </button>
                        <button onClick={onConfirm} className="btn-danger flex-1 justify-center">
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
