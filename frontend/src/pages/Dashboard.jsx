import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Lock, Home, ChefHat, User, TrendingUp, FileText,
  Activity, Cpu, ShieldCheck, Zap, Radio
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [time, setTime] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('ro-RO'));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Background & Grid */}
      <div className="main-viewport"></div>
      <div className="laser-grid"></div>

      {/* TOP BAR - INFO */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start z-50 pointer-events-none">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-neon-cyan">
            <ShieldCheck size={16} className="animate-pulse" />
            <span className="font-hud text-xs tracking-widest">SIGKILL_SECURE_OS</span>
          </div>
          <p className="text-[10px] text-slate-500 ml-6">v4.0 // QUANTUM ENCRYPTION ON</p>
        </div>

        <div className="text-right">
          <h1 className="font-hud text-2xl text-white tracking-tighter">{time}</h1>
          <p className="text-[10px] text-neon-blue uppercase">Local System Sync</p>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="relative z-10 w-full h-full flex items-center justify-center">

        {/* PANOU STÂNGA */}
        <div className="absolute left-10 w-72 flex flex-col gap-6 hidden lg:flex">
          <div className="glass-panel p-5">
            <h3 className="font-hud text-[10px] text-neon-cyan mb-4 uppercase">User_Profile</h3>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full border border-neon-cyan/30 flex items-center justify-center bg-neon-cyan/5">
                <User size={24} className="text-neon-cyan" />
              </div>
              <div>
                <p className="font-bold text-white">Alexandru</p>
                <p className="text-[10px] text-slate-400">Status: Online</p>
              </div>
            </div>
            <div className="space-y-3 text-[10px] font-mono">
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span className="text-slate-500">Buget:</span>
                <span className="text-white">5,000 RON</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span className="text-slate-500">Facturi:</span>
                <span className="text-rose-500">3 Alerte</span>
              </div>
            </div>
          </div>

          <div className="glass-panel p-5">
            <h3 className="font-hud text-[10px] text-neon-blue mb-3 uppercase">Neural_Link</h3>
            <div className="flex items-center gap-3">
              <Activity size={14} className="text-neon-blue" />
              <span className="text-xs text-slate-300">Sincronizare cămară activă...</span>
            </div>
          </div>
        </div>

        {/* NUCLEUL CENTRAL */}
        <div className="relative flex items-center justify-center">
          {/* Reactorul */}
          <div className="holo-core">
            <div className="core-ring ring-1"></div>
            <div className="core-ring ring-2"></div>
            <div className="core-ring ring-3"></div>
            {/* Centrul strălucitor */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 bg-neon-cyan/10 rounded-full blur-xl animate-pulse"></div>
              <Radio size={40} className="text-neon-cyan drop-shadow-[0_0_15px_#00fff5]" />
            </div>
          </div>

          {/* BUTOANE ORBITALE - Calculate matematic să fie în cerc */}
          <div className="nav-node" style={{ top: '-100px', left: '0' }} onClick={() => navigate('/kitchen')}>
            <ChefHat size={20} className="text-white" />
            <span>Kitchen</span>
          </div>
          <div className="nav-node" style={{ top: '0', left: '180px' }} onClick={() => navigate('/bills')}>
            <FileText size={20} className="text-white" />
            <span>Bills</span>
          </div>
          <div className="nav-node" style={{ top: '120px', left: '100px' }} onClick={() => navigate('/budget')}>
            <TrendingUp size={20} className="text-white" />
            <span>Money</span>
          </div>
          <div className="nav-node" style={{ top: '120px', left: '-100px' }} onClick={() => navigate('/login')}>
            <Lock size={20} className="text-white" />
            <span>Security</span>
          </div>
          <div className="nav-node" style={{ top: '0', left: '-180px' }} onClick={() => navigate('/')}>
            <Home size={20} className="text-neon-cyan" />
            <span>Core</span>
          </div>
        </div>

        {/* PANOU DREAPTA */}
        <div className="absolute right-10 w-72 flex flex-col gap-6 hidden lg:flex">
          <div className="glass-panel p-5">
            <h3 className="font-hud text-[10px] text-neon-blue mb-4 uppercase">System_Load</h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] uppercase">
                  <span className="text-slate-400">CPU Core</span>
                  <span className="text-neon-cyan">42%</span>
                </div>
                <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-neon-cyan w-[42%]"></div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] uppercase">
                  <span className="text-slate-400">AI Intelligence</span>
                  <span className="text-neon-blue">98%</span>
                </div>
                <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-neon-blue w-[98%] shadow-[0_0_10px_#00d9ff]"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel p-5 flex-1">
            <h3 className="font-hud text-[10px] text-neon-cyan mb-3 uppercase">Activity_Log</h3>
            <div className="space-y-3 font-mono text-[9px]">
              <p className="text-emerald-400">[OK] Scanare frigider finalizată</p>
              <p className="text-blue-400">[INFO] Rețetă nouă generată</p>
              <p className="text-rose-400">[!] Alertă: Lapte expiră în 24h</p>
            </div>
          </div>
        </div>

      </div>

      {/* FOOTER DECORATION */}
      <div className="absolute bottom-6 w-full flex justify-center pointer-events-none opacity-30">
        <p className="font-hud text-[8px] tracking-[0.5em] text-neon-cyan">
          QUANTUM HOME INTERFACE // PROCESSED BY GEMINI AI
        </p>
      </div>
    </div>
  );
}