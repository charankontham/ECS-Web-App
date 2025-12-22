const currentHost = window.location.protocol + "//" + window.location.hostname;
const backendPort = import.meta.env.VITE_BACKEND_PORT || "8080";
export const API_BASE_URL = `${currentHost}:${backendPort}`;
