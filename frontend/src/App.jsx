import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import NewPet from './pages/NewPet';
import EditPet from './pages/EditPet';
import MakeSale from './pages/MakeSale';
import AdminLayout from './pages/admin/AdminLayout';
import AdminPurchases from './pages/admin/AdminPurchases';
import AdminPetTypes from './pages/admin/AdminPetTypes';
import PurchaseDetail from './pages/PurchaseDetail';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/pets/new" element={<NewPet />} />
      <Route path="/pets/:id/edit" element={<EditPet />} />
      <Route path="/sale" element={<MakeSale />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="purchases" replace />} />
        <Route path="purchases" element={<AdminPurchases />} />
        <Route path="purchases/:id" element={<PurchaseDetail />} />
        <Route path="pet-types" element={<AdminPetTypes />} />
      </Route>
    </Routes>
  );
}
