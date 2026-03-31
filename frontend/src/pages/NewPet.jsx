import { useNavigate } from 'react-router-dom';
import PetForm from '../components/PetForm';
import { api } from '../api';

export default function NewPet() {
  const navigate = useNavigate();

  const handleSave = async (data) => {
    await api.createPet(data);
    navigate('/');
  };

  return (
    <PetForm
      isNew
      onSave={handleSave}
      onCancel={() => navigate('/')}
    />
  );
}
