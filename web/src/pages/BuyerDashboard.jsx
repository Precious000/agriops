import React, { useEffect, useState } from 'react';
import { getListings, placeOrder, getMyOrders } from '../api';

export default function BuyerDashboard() {
  const [listings, setListings] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    getListings().then(setListings).catch(() => {});
    getMyOrders().then(setOrders).catch(() => {});
  }, []);

  async function handleOrder(listing) {
    const qty = prompt(`How many kg of ${listing.crop}?`);
    if (!qty) return;
    await placeOrder({ listing_id: listing.id, quantity_kg: Number(qty) });
    getMyOrders().then(setOrders);
  }

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 700, margin: '40px auto' }}>
      <h2>Produce Listings</h2>
      <ul>
        {listings.map(l => (
          <li key={l.id} style={{ marginBottom: 8 }}>
            {l.crop} — {l.quantity_kg}kg available at ${l.price_per_kg}/kg
            <button style={{ marginLeft: 8 }} onClick={() => handleOrder(l)}>Order</button>
          </li>
        ))}
      </ul>

      <h2>My Orders</h2>
      <ul>{orders.map(o => <li key={o.id}>Order #{o.id} — {o.quantity_kg}kg — {o.status}</li>)}</ul>
    </div>
  );
}
