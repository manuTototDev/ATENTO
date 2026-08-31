import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, LogOut, Menu, X, LayoutDashboard, Users, Calendar, DollarSign, Package, BarChart3, Settings as SettingsIcon } from 'lucide-react';
import { apiLogout } from '../utils/api';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/patients', label: 'Pacientes', icon: Users },
  { to: '/calendar', label: 'Agenda', icon: Calendar },
  { to: '/finances', label: 'Finanzas', icon: DollarSign },
  { to: '/inventory', label: 'Inventario', icon: Package },
  { to: '/analytics', label: 'Analítica', icon: BarChart3 },
  { to: '/settings', label: 'Ajustes', icon: SettingsIcon },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await apiLogout(); // Borra cookie httpOnly en el servidor + limpia localStorage
    navigate('/login');
  };

  return (
    <>
      <button
        className="sidebar-menu-toggle"
        onClick={() => setOpen(true)}
        aria-label="Abrir menú"
      >
        <Menu size={20} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="sidebar-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      <aside className={`sidebar${open ? ' open' : ''}`}>
        <div className="sidebar-logo">
          <Activity size={24} strokeWidth={2.5} />
          <h1 className="logo-text">Lemmatica.</h1>
          <button
            className="sidebar-menu-toggle"
            style={{ marginLeft: 'auto', background: 'transparent' }}
            onClick={() => setOpen(false)}
            aria-label="Cerrar menú"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
            const isActive = location.pathname.startsWith(to);
            return (
              <NavLink
                key={to}
                to={to}
                className={`nav-item${isActive ? ' active' : ''}`}
                onClick={() => setOpen(false)}
              >
                {isActive && (
                  <motion.span
                    className="nav-item-indicator"
                    layoutId="sidebar-active-indicator"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                <Icon size={18} strokeWidth={2} />
                <span>{label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
