import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import TopNav from './components/Navbar';
import AIAssistant from './components/AIAssistant';
import LandingPage from './pages/LandingPage';
import HomePage from './pages/Dashboard';
import ScanPage from './pages/ScanPage';
import AssistantPage from './pages/AssistantPage';
import BudgetPage from './pages/BudgetPage';
import BillsPage from './pages/BillsPage';
import KitchenPage from './pages/KitchenPage';
import LoginPage from './pages/LoginPage';
import PricingPage from './pages/PricingPage';
import DietPlanPage from './pages/DietPlanPage';

const publicRoutes = ['/', '/login', '/pricing'];

export default function App() {
  const location = useLocation();
  const isPublic = publicRoutes.includes(location.pathname);

  if (isPublic) {
    return (
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/pricing" element={<PricingPage />} />
        </Routes>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <div className="app-bg" />
      <TopNav />
      <main className="app-content">
        <Routes>
          <Route path="/home" element={<HomePage />} />
          <Route path="/dashboard" element={<Navigate to="/home" replace />} />
          <Route path="/kitchen" element={<KitchenPage />} />
          <Route path="/scan" element={<ScanPage />} />
          <Route path="/assistant" element={<AssistantPage />} />
          <Route path="/budget" element={<BudgetPage />} />
          <Route path="/bills" element={<BillsPage />} />
          <Route path="/diet" element={<DietPlanPage />} />
        </Routes>
      </main>
      <AIAssistant />
    </div>
  );
}