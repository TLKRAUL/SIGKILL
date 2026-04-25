import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import AIAssistant from './components/AIAssistant';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import ScanPage from './pages/ScanPage';
import AssistantPage from './pages/AssistantPage';
import BudgetPage from './pages/BudgetPage';
import BillsPage from './pages/BillsPage';
import KitchenPage from './pages/KitchenPage';
import LoginPage from './pages/LoginPage';

export default function App() {
  return (
    <div className="min-h-screen relative">
      {/* Kitchen background overlay */}
      <div className="kitchen-bg" />
      
      <Navbar />
      <main className="relative z-10">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/kitchen" element={<KitchenPage />} />
          <Route path="/scan" element={<ScanPage />} />
          <Route path="/assistant" element={<AssistantPage />} />
          <Route path="/budget" element={<BudgetPage />} />
          <Route path="/bills" element={<BillsPage />} />
        </Routes>
      </main>
      <AIAssistant />
    </div>
  );
}