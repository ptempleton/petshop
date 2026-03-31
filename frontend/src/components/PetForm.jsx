import { useEffect, useState } from 'react';
import { api } from '../api';

export default function PetForm({ initial = {}, onSave, onDelete, onCancel, isNew }) {
  const [petTypes, setPetTypes] = useState([]);
  const [form, setForm] = useState({
    name: '',
    gender: '',
    pet_type: '',
    price: '',
    picture: '',
    description: '',
    available: true,
    ...initial,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    api.getPetTypes().then(setPetTypes).catch(console.error);
  }, []);

  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const handleSave = () => {
    if (!form.name.trim()) { setError('Pet Name is required.'); return; }
    if (!form.pet_type) { setError('Pet Type is required.'); return; }
    setError('');
    onSave({ ...form, price: form.price === '' ? null : Number(form.price) });
  };

  return (
    <div>
      <div className="header">
        <div className="header-left">
          <button className="btn btn-secondary" onClick={onCancel}>Back / Cancel</button>
        </div>
        <h1>Carly's Pet Shop Management System</h1>
        <div className="header-right">
          <button className="btn btn-primary" onClick={handleSave}>Save Form</button>
        </div>
      </div>

      <div className="form-page">
        {!isNew && (
          <div className="form-actions" style={{ marginTop: 16 }}>
            <button className="btn btn-danger" onClick={onDelete}>Delete</button>
          </div>
        )}

        {error && <p className="error-msg" style={{ marginBottom: 12 }}>{error}</p>}

        <div className="form-group">
          <label className="required">Pet Name</label>
          <input value={form.name} onChange={set('name')} placeholder="Pet Name" />
        </div>

        <div className="form-group">
          <label>Gender</label>
          <input value={form.gender} onChange={set('gender')} placeholder="Gender" />
        </div>

        <div className="form-group">
          <label className="required">Pet Type</label>
          <select value={form.pet_type} onChange={set('pet_type')}>
            <option value="">-- Select Type --</option>
            {petTypes.map((t) => (
              <option key={t.id} value={t.name}>{t.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Pet Price</label>
          <input type="number" min="0" step="0.01" value={form.price} onChange={set('price')} placeholder="0.00" />
        </div>

        <div className="form-group">
          <label>Pet Picture (URL)</label>
          <input value={form.picture} onChange={set('picture')} placeholder="https://..." />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea value={form.description} onChange={set('description')} placeholder="Describe this pet..." />
        </div>

        <div className="form-group">
          <label>Available</label>
          <div className="checkbox-row">
            <input type="checkbox" checked={!!form.available} onChange={set('available')} id="avail" />
            <label htmlFor="avail" style={{ marginBottom: 0 }}>Yes, this pet is available</label>
          </div>
        </div>
      </div>
    </div>
  );
}
