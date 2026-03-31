import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api';

export default function AdminPurchases() {
  const [purchases, setPurchases] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.getPurchases().then(setPurchases).catch(console.error);
  }, []);

  const fmt = (p) => (p != null ? `$${Number(p).toFixed(2)}` : 'N/A');
  const fmtDate = (d) => new Date(d).toLocaleDateString();

  return (
    <div>
      <h2>Purchase Records</h2>
      {purchases.length === 0 ? (
        <div className="empty-state">No purchases yet.</div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Picture</th>
              <th>Pet Name</th>
              <th>Type</th>
              <th>Price</th>
              <th>New Owner</th>
              <th>Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {purchases.map((p) => (
              <tr key={p.id}>
                <td>
                  {p.pet_picture && (
                    <img
                      src={p.pet_picture}
                      alt={p.pet_name}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  )}
                </td>
                <td>{p.pet_name}</td>
                <td>{p.pet_type}</td>
                <td>{fmt(p.pet_price)}</td>
                <td>{p.new_owner}</td>
                <td>{fmtDate(p.created_at)}</td>
                <td>
                  <button
                    className="btn btn-primary"
                    style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                    onClick={() => navigate(`/admin/purchases/${p.id}`)}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
