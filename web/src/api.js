const BASE = '/api';

function authHeader() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeader(),
      ...options.headers
    }
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const login = (email, password) =>
  request('/users/login', { method: 'POST', body: JSON.stringify({ email, password }) });

export const getMe = () => request('/users/me');

export const getFarms = () => request('/farms/farms');
export const createFarm = (data) => request('/farms/farms', { method: 'POST', body: JSON.stringify(data) });
export const createPlot = (data) => request('/farms/plots', { method: 'POST', body: JSON.stringify(data) });
export const createTask = (data) => request('/farms/tasks', { method: 'POST', body: JSON.stringify(data) });
export const getMyTasks = () => request('/farms/tasks/mine');
export const getWorkers = () => request('/users/workers');

export const getListings = () => request('/orders/listings');
export const placeOrder = (data) => request('/orders/orders', { method: 'POST', body: JSON.stringify(data) });
export const getMyOrders = () => request('/orders/orders/mine');

export async function submitFieldLog(formData) {
  const res = await fetch(`${BASE}/farms/field-logs`, {
    method: 'POST',
    headers: authHeader(),
    body: formData
  });
  if (!res.ok) throw new Error('Failed to submit field log');
  return res.json();
}

export const getPlots = () => request('/farms/plots');
export const createListing = (data) => request('/orders/listings', { method: 'POST', body: JSON.stringify(data) });
export const getAllListings = () => request('/orders/listings/all');
