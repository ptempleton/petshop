import { useEffect, useState } from 'react';
import { api } from '../../api';

export default function AdminPetTypes() {
  const [types, setTypes] = useState([]);
  const [editing, setEditing] = useState({});
  const [newName, setNewName] = useState('');

  const load = () => api.getPetTypes().then(setTypes).catch(console.error);

  useEffect(() => { load(); }, []);

  const handleEdit = (id, value) => setEditing((e) => ({ ...e, [id]: value }));

  const handleSave = async (t) => {
    const name = editing[t.id]?.trim();
    if (!name) return;
    await api.updatePetType(t.id, name);
    setEditing((e) => { const n = { ...e }; delete n[t.id]; return n; });
    load();
  };

  const handleDelete = async (t) => {
    if (!window.confirm(`Delete type "${t.name}"?`)) return;
    await api.deletePetType(t.id);
    load();
  };

  const handleAdd = async () => {
    if (!newName.trim()) return;
    await api.createPetType(newName.trim());
    setNewName('');
    load();
  };

  return (
    <div>
      <h2>Pet Types</h2>
      <div className="type-list">
        {types.map((t) => (
          <div key={t.id} className="type-row">
            <input
              value={editing[t.id] ?? t.name}
              onChange={(e) => handleEdit(t.id, e.target.value)}
            />
            {editing[t.id] !== undefined && editing[t.id] !== t.name && (
              <button className="btn btn-success" onClick={() => handleSave(t)}>Save</button>
            )}
            <button className="btn btn-danger" onClick={() => handleDelete(t)}>Delete</button>
          </div>
        ))}

        <div className="add-type-row">
          <input
            placeholder="New pet type name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <button className="btn btn-primary" onClick={handleAdd}>Add</button>
        </div>
      </div>
    </div>
  );
}
