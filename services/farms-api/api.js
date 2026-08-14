
export const getPlots = () => request('/farms/plots');
export const createListing = (data) => request('/orders/listings', { method: 'POST', body: JSON.stringify(data) });
export const getAllListings = () => request('/orders/listings/all');
