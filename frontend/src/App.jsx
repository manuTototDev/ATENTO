import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import Landing from './pages/Landing';
import Today from './pages/Today';
import NewPatient from './pages/NewPatient';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Consultation from './pages/Consultation';
import PrescriptionView from './pages/PrescriptionView';
import PatientDirectory from './pages/PatientDirectory';
import PatientDetail from './pages/PatientDetail';
import Business from './pages/Business';
import Settings from './pages/Settings';
import TermsAndConditions from './pages/TermsAndConditions';
import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/terminos" element={<TermsAndConditions />} />

        {/* Rutas protegidas (requieren sesión) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/onboarding" element={<Onboarding />} />

          {/* Con Sidebar (Layout) — 4 secciones: Hoy, Pacientes, Negocio, Ajustes */}
          <Route element={<Layout />}>
            <Route path="/hoy" element={<Today />} />
            <Route path="/pacientes" element={<PatientDirectory />} />
            <Route path="/pacientes/:id" element={<PatientDetail />} />
            <Route path="/negocio" element={<Business />} />
            <Route path="/ajustes" element={<Settings />} />
          </Route>

          {/* Pantallas completas (sin Sidebar) */}
          <Route path="/pacientes/nuevo" element={<NewPatient />} />
          <Route path="/consultation/new" element={<Consultation />} />
          <Route path="/consultation/:id" element={<Consultation />} />
          <Route path="/prescription/:id" element={<PrescriptionView />} />
        </Route>

        {/* Default route back to landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
