import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, FALLBACK_IMG } from '../api';

export default function MakeSale() {
  const [pets, setPets] = useState([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [owner, setOwner] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.getPets().then((all) => setPets(all.filter((p) => p.available))).catch(console.error);
  }, []);

  const filtered = pets.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleComplete = async () => {
    if (!selected) { setError('Please select a pet.'); return; }
    if (!owner.trim()) { setError('New Owner name is required.'); return; }
    setError('');
    const purchase = await api.createPurchase({
      pet_id: selected.id,
      pet_name: selected.name,
      pet_type: selected.pet_type,
      pet_picture: selected.picture,
      pet_price: selected.price,
      new_owner: owner.trim(),
    });
    navigate(`/admin/purchases/${purchase.id}`);
  };

  const fmt = (p) => (p != null ? `$${Number(p).toFixed(2)}` : '');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div className="header">
        <div className="header-left">
          <button className="btn btn-secondary" onClick={() => navigate('/')}>Cancel Sale</button>
        </div>
        <h1>Carly's Pet Shop Management System</h1>
        <div className="header-right">
          <button className="btn btn-success" onClick={handleComplete}>Complete Sale</button>
        </div>
      </div>

      <div className="sale-layout">
        <div className="sale-list">
          <div className="sale-search">
            <input
              placeholder="Search By Pet Name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {filtered.map((pet) => (
            <div
              key={pet.id}
              className={`sale-pet-row${selected?.id === pet.id ? ' selected' : ''}`}
              onClick={() => { setSelected(pet); setError(''); }}
            >
              <img
                src={pet.picture || FALLBACK_IMG}
                alt={pet.name}
                onError={(e) => { e.target.src = FALLBACK_IMG; }}
              />
              <div className="sale-pet-info">
                <div className="name">{pet.name} the {pet.pet_type}</div>
                <div className="price">{fmt(pet.price)}</div>
              </div>
              <span className="chevron" style={{ marginLeft: 'auto' }}>›</span>
            </div>
          ))}
        </div>

        <div className="sale-detail">
          {selected ? (
            <>
              {(selected.picture || true) && (
                <img
                  src={selected.picture || FALLBACK_IMG}
                  alt={selected.name}
                  onError={(e) => { e.target.src = FALLBACK_IMG; }}
                />
              )}
              <div>
                <div className="sale-detail-label">Pet Name</div>
                <div className="sale-detail-value">{selected.name}</div>
              </div>
              <div>
                <div className="sale-detail-label">Pet Type</div>
                <div className="sale-detail-value">{selected.pet_type}</div>
              </div>
              <div>
                <div className="sale-detail-label">Pet Price</div>
                <div className="sale-detail-value">{fmt(selected.price)}</div>
              </div>
              <div>
                <div className="sale-detail-label" style={{ color: '#dc3545' }}>* New Owner</div>
                <input
                  style={{ padding: '7px 10px', border: '1px solid #b8d4f0', borderRadius: 4, fontSize: '0.9rem', width: '100%', maxWidth: 280 }}
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  placeholder="Owner name"
                />
              </div>
              {error && <p className="error-msg">{error}</p>}
            </>
          ) : (
            <div className="empty-state">Select a pet from the list to make a sale.</div>
          )}
        </div>
      </div>
    </div>
  );
}
