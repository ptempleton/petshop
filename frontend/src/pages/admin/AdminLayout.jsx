import { NavLink, Outlet, useNavigate } from 'react-router-dom';

export default function AdminLayout() {
  const navigate = useNavigate();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div className="header">
        <div className="header-left">
          <button className="btn btn-secondary" onClick={() => navigate('/')}>
            ← Back to Shop
          </button>
        </div>
        <h1>Carly's Pet Shop — Admin</h1>
        <div className="header-right" />
      </div>

      <div className="admin-layout">
        <nav className="admin-nav">
          <NavLink
            to="/admin/purchases"
            className={({ isActive }) => isActive ? 'active' : ''}
          >
            Purchases
          </NavLink>
          <NavLink
            to="/admin/pet-types"
            className={({ isActive }) => isActive ? 'active' : ''}
          >
            Pet Types
          </NavLink>
        </nav>
        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
