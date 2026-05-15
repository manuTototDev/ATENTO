import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Activity, LogOut } from 'lucide-react';
import { apiLogout } from '../utils/api';

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await apiLogout(); // Borra cookie httpOnly en el servidor + limpia localStorage
    navigate('/login');
  };

  const navItemStyle = (isActive) => ({
    display: 'block',
    padding: '1rem 2rem',
    textDecoration: 'none',
    color: isActive ? '#fff' : '#666',
    fontWeight: isActive ? 800 : 600,
    fontSize: '1.25rem',
    textTransform: 'uppercase',
    letterSpacing: '-0.02em',
    transition: 'all 0.3s ease',
    borderLeft: isActive ? '4px solid #fff' : '4px solid transparent',
  });

  return (
    <aside style={{
      width: '280px',
      height: '100vh',
      backgroundColor: '#000',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      position: 'sticky',
      top: 0,
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      
      {/* LOGO AREA */}
      <div style={{
        padding: '3rem 2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        <Activity size={28} strokeWidth={2.5} color="#fff" />
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.05em', margin: 0, color: '#fff' }}>
          Latento.
        </h1>
      </div>

      {/* NAVIGATION */}
      <nav style={{
        flex: 1,
        padding: '1rem 0',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <NavLink 
          to="/dashboard" 
          style={({isActive}) => navItemStyle(isActive)}
          onMouseOver={e=>{if(e.currentTarget.style.color !== 'rgb(255, 255, 255)') { e.currentTarget.style.color='#a3a3a3'; }}}
          onMouseOut={e=>{if(e.currentTarget.style.fontWeight !== '800') { e.currentTarget.style.color='#666'; }}}
        >
          Dashboard.
        </NavLink>
        
        <NavLink 
          to="/patients" 
          style={({isActive}) => navItemStyle(isActive)}
          onMouseOver={e=>{if(e.currentTarget.style.color !== 'rgb(255, 255, 255)') { e.currentTarget.style.color='#a3a3a3'; }}}
          onMouseOut={e=>{if(e.currentTarget.style.fontWeight !== '800') { e.currentTarget.style.color='#666'; }}}
        >
          Pacientes.
        </NavLink>
        
        <NavLink 
          to="/calendar" 
          style={({isActive}) => navItemStyle(isActive)}
          onMouseOver={e=>{if(e.currentTarget.style.color !== 'rgb(255, 255, 255)') { e.currentTarget.style.color='#a3a3a3'; }}}
          onMouseOut={e=>{if(e.currentTarget.style.fontWeight !== '800') { e.currentTarget.style.color='#666'; }}}
        >
          Agenda.
        </NavLink>
        
        <NavLink 
          to="/finances" 
          style={({isActive}) => navItemStyle(isActive)}
          onMouseOver={e=>{if(e.currentTarget.style.color !== 'rgb(255, 255, 255)') { e.currentTarget.style.color='#a3a3a3'; }}}
          onMouseOut={e=>{if(e.currentTarget.style.fontWeight !== '800') { e.currentTarget.style.color='#666'; }}}
        >
          Finanzas.
        </NavLink>
      </nav>

      {/* FOOTER / LOGOUT */}
      <div style={{ padding: '2rem' }}>
        <button 
          onClick={handleLogout} 
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: '0.75rem',
            padding: '1rem 0',
            background: 'transparent',
            border: 'none',
            borderTop: '1px solid #333',
            color: '#666',
            fontWeight: 600,
            fontSize: '1rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={e=>{e.currentTarget.style.color='#fff'}}
          onMouseOut={e=>{e.currentTarget.style.color='#666'}}
        >
          <LogOut size={20} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
