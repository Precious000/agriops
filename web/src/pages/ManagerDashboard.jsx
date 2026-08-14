import React, { useEffect, useState } from 'react';
import { getFarms, createFarm, getWorkers, getPlots, createListing, getAllListings } from '../api';

export default function ManagerDashboard() {
  const [farms, setFarms] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [plots, setPlots] = useState([]);
  const [listings, setListings] = useState([]);
  const [farmName, setFarmName] = useState('');
  const [farmLocation, setFarmLocation] = useState('');

  const [listingPlotId, setListingPlotId] = useState('');
  const [listingCrop, setListingCrop] = useState('');
  const [listingQty, setListingQty] = useState('');
  const [listingPrice, setListingPrice] = useState('');

  useEffect(() => {
    getFarms().then(setFarms).catch(() => {});
    getWorkers().then(setWorkers).catch(() => {});
    getPlots().then(setPlots).catch(() => {});
    getAllListings().then(setListings).catch(() => {});
  }, []);

  async function handleAddFarm(e) {
    e.preventDefault();
    const farm = await createFarm({ name: farmName, location: farmLocation });
    setFarms([...farms, farm]);
    setFarmName(''); setFarmLocation('');
  }

  async function handleAddListing(e) {
    e.preventDefault();
    if (!listingPlotId) return alert('Select a plot first');
    const listing = await createListing({
      plot_id: listingPlotId,
      crop: listingCrop,
      quantity_kg: Number(listingQty),
      price_per_kg: Number(listingPrice)
    });
    setListings([listing, ...listings]);
    setListingCrop(''); setListingQty(''); setListingPrice('');
  }

  return (
    <div className="page">
      <h2>🌾 Manager Dashboard</h2>

      <div className="card">
        <h3>Your Farms</h3>
        {farms.length === 0 ? (
          <p className="empty-state">No farms yet — add one below.</p>
        ) : (
          farms.map(f => (
            <div className="list-item" key={f.id}>
              <span>{f.name}</span>
              <span style={{ color: '#8a998a' }}>{f.location}</span>
            </div>
          ))
        )}
        <form onSubmit={handleAddFarm} className="form-row" style={{ marginTop: 16 }}>
          <input placeholder="Farm name" value={farmName} onChange={e => setFarmName(e.target.value)} />
          <input placeholder="Location" value={farmLocation} onChange={e => setFarmLocation(e.target.value)} />
          <button className="btn" type="submit">Add Farm</button>
        </form>
      </div>

      <div className="card">
        <h3>Workers</h3>
        {workers.length === 0 ? (
          <p className="empty-state">No workers registered yet.</p>
        ) : (
          workers.map(w => (
            <div className="list-item" key={w.id}>
              <span>{w.full_name}</span>
              <span style={{ color: '#8a998a' }}>{w.email}</span>
            </div>
          ))
        )}
      </div>

      <div className="card">
        <h3>Produce Listings</h3>
        {listings.length === 0 ? (
          <p className="empty-state">No listings yet — create one below.</p>
        ) : (
          listings.map(l => (
            <div className="list-item" key={l.id}>
              <span>{l.crop} — {l.quantity_kg}kg @ ${l.price_per_kg}/kg</span>
              <span className={`badge ${l.available ? 'badge-available' : 'badge-sold'}`}>
                {l.available ? 'available' : 'sold out'}
              </span>
            </div>
          ))
        )}

        <form onSubmit={handleAddListing} className="form-row" style={{ marginTop: 16 }}>
          {plots.length === 0 ? (
            <p className="empty-state">Create a plot for one of your farms before listing produce.</p>
          ) : (
            <select value={listingPlotId} onChange={e => setListingPlotId(e.target.value)}>
              <option value="">Select plot</option>
              {plots.map(p => <option key={p.id} value={p.id}>{p.name} ({p.crop || 'no crop'})</option>)}
            </select>
          )}
          <input placeholder="Crop" value={listingCrop} onChange={e => setListingCrop(e.target.value)} style={{ width: 110 }} />
          <input placeholder="Qty (kg)" type="number" value={listingQty} onChange={e => setListingQty(e.target.value)} style={{ width: 100 }} />
          <input placeholder="Price/kg" type="number" value={listingPrice} onChange={e => setListingPrice(e.target.value)} style={{ width: 90 }} />
          <button className="btn" type="submit" disabled={plots.length === 0}>Create Listing</button>
        </form>
      </div>
    </div>
  );
}
