import axios from "axios";

const API_URL = "https://charbhuja-transaction-management.onrender.com";

export const fetchOrders = (params) => API.get("/orders/", { params });
export const createOrder = (data) => API.post("/orders/", data);
export const updateOrder = (id, data) => API.put(`/orders/${id}`, data);
export const deleteOrder = (id) => API.delete(`/orders/${id}`);

export const fetchDispatches = (orderId) => API.get(`/dispatches/${orderId}`);
export const addDispatch = (data) => API.post("/dispatches/", data);
export const deleteDispatch = (id) => API.delete(`/dispatches/${id}`);

export const fetchSummary = () => API.get("/dashboard/summary");
export const fetchToleranceLog = () => API.get("/dashboard/tolerance-log");
export const exportExcel = () =>
    API.get("/dashboard/export", { responseType: "blob" }).then((res) => {
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "charbhuja_orders.xlsx");
        document.body.appendChild(link);
        link.click();
        link.remove();
    });
