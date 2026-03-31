import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PetForm from '../components/PetForm';
import { api } from '../api';

export default function EditPet() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pet, setPet] = useState(null);

  useEffect(() => {
    api.getPet(id).then(setPet).catch(console.error);
  }, [id]);

  const handleSave = async (data) => {
    await api.updatePet(id, data);
    navigate('/');
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete ${pet?.name}? This cannot be undone.`)) return;
    await api.deletePet(id);
    navigate('/');
  };

  if (!pet) return null;

  return (
    <PetForm
      initial={pet}
      onSave={handleSave}
      onDelete={handleDelete}
      onCancel={() => navigate('/')}
    />
  );
}
