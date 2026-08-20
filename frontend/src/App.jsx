import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import NewPatient from './pages/NewPatient';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Consultation from './pages/Consultation';
import PrescriptionView from './pages/PrescriptionView';
import PatientDirectory from './pages/PatientDirectory';
import PatientDetail from './pages/PatientDetail';
import CalendarView from './pages/CalendarView';
import Analytics from './pages/Analytics';
import Inventory from './pages/Inventory';
import Finances from './pages/Finances';
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

          {/* Con Sidebar (Layout) */}
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/patients" element={<PatientDirectory />} />
            <Route path="/patients/:id" element={<PatientDetail />} />
            <Route path="/calendar" element={<CalendarView />} />
            <Route path="/finances" element={<Finances />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          {/* Pantallas completas (sin Sidebar) */}
          <Route path="/patient/new" element={<NewPatient />} />
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
