import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, LogOut, Menu, X, Sunrise, Users, Briefcase, Settings as SettingsIcon } from 'lucide-react';
import { apiLogout } from '../utils/api';

const NAV_ITEMS = [
  { to: '/hoy', label: 'Hoy', icon: Sunrise, color: 'var(--pop-blue)' },
  { to: '/pacientes', label: 'Pacientes', icon: Users, color: 'var(--pop-green)' },
  { to: '/negocio', label: 'Negocio', icon: Briefcase, color: 'var(--pop-gold)' },
  { to: '/ajustes', label: 'Ajustes', icon: SettingsIcon, color: 'var(--pop-violet)' },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await apiLogout();
    navigate('/login');
  };

  return (
    <>
      <button className="sidebar-menu-toggle" onClick={() => setOpen(true)} aria-label="Abrir menú">
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
          <h1 className="logo-text">Escrivo.</h1>
          <button className="sidebar-close-btn" onClick={() => setOpen(false)} aria-label="Cerrar menú">
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map(({ to, label, icon: Icon, color }) => {
            const isActive = location.pathname.startsWith(to);
            return (
              <NavLink
                key={to}
                to={to}
                className={`nav-item${isActive ? ' active' : ''}`}
                style={{ '--item-color': color }}
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
