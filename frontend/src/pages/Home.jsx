import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function Home() {
  const [pets, setPets] = useState([]);
  const [petTypes, setPetTypes] = useState([]);
  const [selectedType, setSelectedType] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.getPetTypes().then(setPetTypes).catch(console.error);
  }, []);

  useEffect(() => {
    api.getPets(selectedType).then(setPets).catch(console.error);
  }, [selectedType]);

  const fmt = (price) =>
    price != null ? `$${Number(price).toFixed(2)}` : '';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div className="header">
        <div className="header-left">
          <button className="btn btn-primary" onClick={() => navigate('/pets/new')}>
            New Pet
          </button>
        </div>
        <h1>Carly's Pet Shop Management System</h1>
        <div className="header-right">
          <button className="btn btn-primary" onClick={() => navigate('/sale')}>
            Make Sale
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/admin')}>
            Admin
          </button>
        </div>
      </div>

      <div className="home-layout">
        <div className="sidebar">
          <div
            className={`sidebar-item${selectedType === null ? ' active' : ''}`}
            onClick={() => setSelectedType(null)}
          >
            <span>All Pets</span>
            <span>›</span>
          </div>
          {petTypes.map((t) => (
            <div
              key={t.id}
              className={`sidebar-item${selectedType === t.name ? ' active' : ''}`}
              onClick={() => setSelectedType(t.name)}
            >
              <span>{t.name}</span>
              <span>›</span>
            </div>
          ))}
        </div>

        <div className="pet-list">
          {pets.length === 0 && (
            <div className="empty-state">No pets in this category.</div>
          )}
          {pets.map((pet) => (
            <div
              key={pet.id}
              className="pet-card"
              onClick={() => navigate(`/pets/${pet.id}/edit`)}
            >
              <img
                src={pet.picture || 'https://cdn.pixabay.com/photo/2017/09/25/13/12/dog-2785074_1280.jpg'}
                alt={pet.name}
                onError={(e) => {
                  e.target.src = 'https://cdn.pixabay.com/photo/2017/09/25/13/12/dog-2785074_1280.jpg';
                }}
              />
              <div className="pet-card-body">
                <div className="pet-card-name">{pet.name}</div>
                <div className="pet-card-type">
                  {pet.gender ? `${pet.gender} ` : ''}{pet.pet_type}
                </div>
                {pet.description && (
                  <div className="pet-card-desc">{pet.description}</div>
                )}
                <div className="pet-card-footer">
                  {pet.price != null && (
                    <span className="pet-price">{fmt(pet.price)}</span>
                  )}
                  {pet.available ? (
                    <span className="badge-available">Available</span>
                  ) : (
                    <span className="badge-unavailable">Sold</span>
                  )}
                </div>
              </div>
              <span className="chevron">›</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
