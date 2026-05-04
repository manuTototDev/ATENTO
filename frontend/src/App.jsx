import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import NewPatient from './pages/NewPatient';
import Layout from './components/Layout';
import Consultation from './pages/Consultation';
import PrescriptionView from './pages/PrescriptionView';
import PatientDirectory from './pages/PatientDirectory';
import PatientDetail from './pages/PatientDetail';
import CalendarView from './pages/CalendarView';
import Analytics from './pages/Analytics';
import Finances from './pages/Finances';
import Settings from './pages/Settings';
import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/onboarding" element={<Onboarding />} />
        
        {/* Rutas con Sidebar (Layout) */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/patients" element={<PatientDirectory />} />
          <Route path="/patients/:id" element={<PatientDetail />} />
          <Route path="/calendar" element={<CalendarView />} />
          <Route path="/finances" element={<Finances />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* Pantallas completas (Sin Sidebar) */}
        <Route path="/patient/new" element={<NewPatient />} />
        <Route path="/consultation/new" element={<Consultation />} />
        <Route path="/consultation/:id" element={<Consultation />} />
        <Route path="/prescription" element={<PrescriptionView />} />
        
        {/* Default route to login for now */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
