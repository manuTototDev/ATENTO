import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  Activity, 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Package, 
  BarChart2, 
  LogOut 
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <Activity size={28} strokeWidth={2.5} className="logo-icon" />
        <h1 className="logo-text">Atento</h1>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>
        
        <NavLink to="/patients" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          <Users size={20} />
          <span>Pacientes</span>
        </NavLink>
        
        <NavLink to="/calendar" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          <Calendar size={20} />
          <span>Agenda</span>
        </NavLink>
        
        <NavLink to="/finances" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          <BarChart2 size={20} />
          <span>Finanzas</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <button onClick={handleLogout} className="nav-item logout-btn">
          <LogOut size={20} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
