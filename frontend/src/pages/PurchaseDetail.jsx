import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';

export default function PurchaseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [purchase, setPurchase] = useState(null);

  useEffect(() => {
    api.getPurchase(id).then(setPurchase).catch(console.error);
  }, [id]);

  const handleReturn = async () => {
    if (!window.confirm(`Return ${purchase?.pet_name} to inventory? This will delete the sale record.`)) return;
    await api.deletePurchase(id);
    navigate('/admin/purchases');
  };

  if (!purchase) return null;

  const fmt = (p) => (p != null ? `$${Number(p).toFixed(2)}` : 'N/A');
  const fmtDate = (d) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <button className="btn btn-secondary" onClick={() => navigate('/admin/purchases')}>
          ← Back to Purchases
        </button>
        <button className="btn btn-danger" onClick={handleReturn}>
          Return Pet to Inventory
        </button>
      </div>

      <div className="purchase-detail">
        {purchase.pet_picture && (
          <img
            src={purchase.pet_picture}
            alt={purchase.pet_name}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        )}
        <div className="field">
          <label>Pet Name</label>
          <span>{purchase.pet_name}</span>
        </div>
        <div className="field">
          <label>Pet Type</label>
          <span>{purchase.pet_type}</span>
        </div>
        <div className="field">
          <label>Sale Price</label>
          <span>{fmt(purchase.pet_price)}</span>
        </div>
        <div className="field">
          <label>New Owner</label>
          <span>{purchase.new_owner}</span>
        </div>
        <div className="field">
          <label>Date Purchased</label>
          <span>{fmtDate(purchase.created_at)}</span>
        </div>
      </div>
    </div>
  );
}
