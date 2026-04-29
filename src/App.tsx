import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSystem } from './context/SystemContext';
import { 
  Shield, 
  Terminal as TerminalIcon, 
  Satellite, 
  Radio, 
  Layers, 
  Activity,
  Cpu,
  Wifi,
  Target,
  ChevronRight,
  Info,
  Scan,
  Crosshair,
  RotateCcw,
  Zap,
  ShieldAlert,
  AlertTriangle
} from 'lucide-react';
import MavlinkLab from './components/MavlinkLab';
import GpsLab from './components/GpsLab';
import InteractiveStack from './components/InteractiveStack';
import RfExplorer from './components/RfExplorer';
import EwCentral from './components/EwCentral';
import HardwareBridge from './components/HardwareBridge';

import { SystemProvider } from './context/SystemContext';

type TabId = 'stack' | 'rf' | 'mavlink' | 'gps' | 'ew' | 'bridge';

export default function App() {
  return (
    <SystemProvider>
      <AppContent />
    </SystemProvider>
  );
}

function AppContent() {
  const { state, setDroneDetected } = useSystem();
  const [activeTab, setActiveTab] = useState<TabId>('stack');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMove = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  const menuItems = [
    { id: 'stack', label: 'THREAT_MATRIX', icon: Layers, desc: 'Attack surface analysis' },
    { id: 'rf', label: 'SKY_SWEEP', icon: Radio, desc: 'SDR signal identification' },
    { id: 'mavlink', label: 'CMD_INJECT', icon: TerminalIcon, desc: 'Protocol interception' },
    { id: 'gps', label: 'TRACK_LOCK', icon: Satellite, desc: 'Signal integrity monitor' },
    { id: 'ew', label: 'EW_CENTRAL', icon: Zap, desc: 'Combat countermeasures' },
    { id: 'bridge', label: 'HWD_BRIDGE', icon: Cpu, desc: 'SDR hardware links' },
  ];

  return (
    <div className="flex h-screen bg-[#030712] text-[#A0A0A0] overflow-hidden selection:bg-zapper-orange selection:text-white">
      {/* Reticle Cursor */}
      <div 
        className="reticle hidden md:block" 
        style={{ left: mousePos.x, top: mousePos.y }}
      />
      
      {/* Background FX */}
      <div className="fixed inset-0 pointer-events-none">
         <div className="absolute inset-0 opacity-20" style={{
           backgroundImage: 'radial-gradient(circle at 50% 50%, #0a192f 0%, transparent 100%), linear-gradient(rgba(255, 255, 255, 0.01) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.01) 1px, transparent 1px)',
           backgroundSize: '100% 100%, 40px 40px, 40px 40px'
         }} />
         <div className="scanline" />
      </div>

      {/* Sidebar */}
      <aside className={`relative z-20 border-r border-white/5 bg-black/60 backdrop-blur-xl transition-all duration-300 flex flex-col ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
         <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-none border border-zapper-orange bg-zapper-orange/10 flex items-center justify-center glow-orange flex-shrink-0 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                  <Crosshair className="text-zapper-orange" size={18} />
               </div>
               {isSidebarOpen && (
                  <div className="overflow-hidden whitespace-nowrap">
                     <h1 className="text-xs font-bold text-white tracking-[0.2em] uppercase">DUCK_HUNTER</h1>
                     <p className="pixel-label opacity-40">COUNTER_UAV_OS</p>
                  </div>
               )}
            </div>
         </div>

         <nav className="flex-1 p-4 space-y-3">
            {menuItems.map((item) => (
               <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as TabId)}
                  className={`w-full group relative flex items-center gap-4 p-3 rounded-none transition-all duration-200 border-l-2 ${
                    activeTab === item.id 
                    ? 'bg-zapper-orange/10 text-zapper-orange border-zapper-orange' 
                    : 'hover:bg-white/5 text-white/30 hover:text-white/60 border-transparent'
                  }`}
               >
                  <item.icon size={20} className="flex-shrink-0" />
                  {isSidebarOpen && (
                     <div className="text-left overflow-hidden">
                        <div className="text-[10px] font-bold uppercase tracking-widest">{item.label}</div>
                        <div className="text-[8px] tech-mono opacity-40 truncate">{item.desc}</div>
                     </div>
                  )}
               </button>
            ))}
         </nav>

         <div className="p-6 border-t border-white/5 space-y-4">
            {isSidebarOpen && (
               <div className="space-y-3">
                  <div>
                     <div className="flex justify-between items-center text-[7px] tech-mono mb-1">
                        <span className="pixel-label opacity-50">BATTERY_LVL</span>
                        <span className="text-zapper-orange">8-BIT</span>
                     </div>
                     <div className="h-1 bg-white/5 rounded-none overflow-hidden">
                        <div className="h-full bg-zapper-orange w-[75%]" />
                     </div>
                  </div>
                  <div className="flex items-center gap-2 text-[8px] tech-mono text-white/20">
                     <Scan size={10} />
                     <span>SYSTEM_READY // V1.5.0</span>
                  </div>
                  <div className="flex items-center gap-2 text-[8px] tech-mono">
                     <Cpu size={10} className={state.isHardwareConnected ? 'text-duck-green' : 'text-white/10'} />
                     <span className={state.isHardwareConnected ? 'text-duck-green' : 'text-white/10'}>
                        {state.isHardwareConnected ? `HW: ${state.hardwareType}` : 'HW: SDR_SIM_MODE'}
                     </span>
                  </div>
                  <button 
                    onClick={() => setDroneDetected(false)}
                    className="w-full mt-4 flex items-center justify-center gap-2 py-2 border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] text-[7px] tech-mono uppercase transition-colors"
                  >
                    <RotateCcw size={10} /> RESET_SYSTEM_CACHE
                  </button>
               </div>
            )}
            <button 
               onClick={() => setIsSidebarOpen(!isSidebarOpen)}
               className="w-full flex justify-center p-2 rounded hover:bg-white/5 transition-colors"
            >
               <ChevronRight size={16} className={`transition-transform duration-300 ${isSidebarOpen ? 'rotate-180' : ''}`} />
            </button>
         </div>
      </aside>

      <main className="flex-1 relative z-10 overflow-y-auto custom-scrollbar flex flex-col">
         <header className="h-16 border-b border-white/5 bg-black/40 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-50">
            <div className="flex items-center gap-6">
               <div className="flex items-center gap-3">
                  <span className="text-[10px] tech-mono opacity-30 tracking-widest">FIELD_OPS //</span>
                  <span className="text-xs font-bold text-white uppercase tracking-widest">
                     {menuItems.find(i => i.id === activeTab)?.label}
                  </span>
               </div>
               <div className="flex gap-4 border-l border-white/10 pl-6 h-8 items-center">
                  <div className="text-center">
                     <div className="text-[6px] tech-mono opacity-30">NOISE_FLR</div>
                     <div className={`text-[9px] tech-mono font-bold ${state.noiseFloor > -80 ? 'text-red-500' : 'text-duck-green'}`}>
                        {state.noiseFloor} dBm
                     </div>
                  </div>
                  <div className="text-center">
                     <div className="text-[6px] tech-mono opacity-30">LINK_INT</div>
                     <div className={`text-[9px] tech-mono font-bold ${state.linkIntegrity < 50 ? 'text-red-500' : 'text-duck-green'}`}>
                        {state.linkIntegrity}%
                     </div>
                  </div>
               </div>
            </div>
            
            <div className="flex items-center gap-6">
               {state.droneDetected ? (
                 <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-none text-[8px] tech-mono text-red-500 animate-pulse">
                    <Target size={10} /> TARGET_LOCKED // {state.targetId?.slice(0, 8)}
                 </div>
               ) : (
                 <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-none text-[8px] tech-mono text-white/20">
                    <Scan size={10} /> SEARCHING_FOR_DUCKS...
                 </div>
               )}
               <div className="flex items-center gap-2 text-white/20 hover:text-white transition-colors cursor-pointer">
                  <Info size={16} />
               </div>
            </div>
         </header>

         <div className="flex-1 p-8 grid grid-cols-1 xl:grid-cols-4 gap-8">
            <div className="xl:col-span-3">
               <AnimatePresence mode="wait">
                  <motion.div
                     key={activeTab}
                     initial={{ opacity: 0, x: 20 }}
                     animate={{ opacity: 1, x: 0 }}
                     exit={{ opacity: 0, x: -20 }}
                     transition={{ duration: 0.2 }}
                     className="h-full"
                  >
                     {activeTab === 'stack' && (
                        <div className="max-w-4xl mx-auto py-12">
                           <div className="mb-12 text-center">
                              <div className="pixel-label text-zapper-orange mb-4">Round 01</div>
                              <h2 className="text-3xl font-bold text-white tracking-widest uppercase mb-4">DRONE_HUNT_MATRIX</h2>
                              <p className="text-xs text-white/40 max-w-lg mx-auto tech-mono">
                                 Automated target acquisition and classification suite. Secure the sky. Prevent the drop.
                              </p>
                           </div>
                           <InteractiveStack />
                           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
                              {[
                                 { label: 'MAVLink Hijack', icon: TerminalIcon, text: 'Force immediate landing of rogue units.' },
                                 { label: 'GNSS Lock Check', icon: Satellite, text: 'Validate coordinates against IMU drift.' },
                                 { label: 'Signal Sweep', icon: Radio, text: 'Identify fingerprints in the 2.4/5.8 spectrum.' },
                              ].map((feat, i) => (
                                 <div key={i} className="tech-container p-6 bg-white/[0.01] hover:bg-white/[0.03] transition-colors border-white/5">
                                    <feat.icon size={20} className="text-zapper-orange mb-4" />
                                    <h4 className="text-white font-bold text-xs uppercase mb-2 tracking-widest">{feat.label}</h4>
                                    <p className="text-[10px] text-white/40 leading-relaxed tech-mono">{feat.text}</p>
                                 </div>
                              ))}
                           </div>
                        </div>
                     )}
                     {activeTab === 'rf' && <div className="max-w-6xl mx-auto h-full"><RfExplorer /></div>}
                     {activeTab === 'mavlink' && (
                        <div className="max-w-6xl mx-auto h-full flex flex-col pt-8">
                           <div className="flex justify-between items-end mb-8">
                              <div>
                                 <h2 className="text-2xl font-bold text-white uppercase tracking-widest">CMD_INJECT_OS</h2>
                                 <p className="text-[10px] text-white/40 tech-mono">Direct MAVLink packet injection and kill-switch deployment.</p>
                              </div>
                           </div>
                           <MavlinkLab />
                        </div>
                     )}
                     {activeTab === 'gps' && (
                        <div className="max-w-6xl mx-auto h-full flex flex-col pt-8">
                           <div className="flex justify-between items-end mb-8">
                              <div>
                                 <h2 className="text-2xl font-bold text-white uppercase tracking-widest">TRACK_LOCK_VERIFY</h2>
                                 <p className="text-[10px] text-white/40 tech-mono">Real-time GNSS integrity monitor and spoof detection.</p>
                              </div>
                           </div>
                           <GpsLab />
                        </div>
                     )}
                     {activeTab === 'ew' && (
                        <div className="max-w-6xl mx-auto h-full flex flex-col pt-8">
                           <div className="flex justify-between items-end mb-8">
                              <div>
                                 <h2 className="text-2xl font-bold text-white uppercase tracking-widest italic">Electronic Warfare Center</h2>
                                 <p className="text-[10px] text-white/40 tech-mono">High-intensity signal disruption and tactical area denial.</p>
                              </div>
                           </div>
                           <EwCentral />
                        </div>
                     )}
                     {activeTab === 'bridge' && <div className="max-w-6xl mx-auto h-full overflow-y-auto custom-scrollbar"><HardwareBridge /></div>}
                  </motion.div>
               </AnimatePresence>
            </div>

            <div className="hidden xl:flex flex-col gap-6">
               <div className="tech-container p-6 border-white/10 bg-black/40 h-full flex flex-col">
                  <div className="flex items-center gap-3 mb-6">
                     <ShieldAlert className="text-zapper-orange" size={18} />
                     <h3 className="text-[10px] font-bold text-white uppercase tracking-widest italic">SOC_INCIDENT_FEED</h3>
                  </div>
                  <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar pr-2">
                     <AnimatePresence initial={false}>
                        {state.alerts.length === 0 ? (
                           <div className="text-[8px] tech-mono opacity-20 text-center py-12">AWAITING_INCIDENTS...</div>
                        ) : (
                           state.alerts.map((alert) => (
                              <motion.div
                                 key={alert.id + alert.timestamp}
                                 initial={{ opacity: 0, x: 20 }}
                                 animate={{ opacity: 1, x: 0 }}
                                 className="p-3 border-l-2 border-red-500 bg-red-500/5 space-y-2"
                              >
                                 <div className="flex justify-between items-start">
                                    <span className="text-[9px] font-bold text-white">{alert.id}</span>
                                    <span className="text-[7px] tech-mono opacity-40">{alert.timestamp}</span>
                                 </div>
                                 <div className="text-[8px] font-bold text-red-500 uppercase tracking-tighter">{alert.type}</div>
                                 <p className="text-[8px] tech-mono text-white/60 leading-tight">{alert.description}</p>
                              </motion.div>
                           ))
                        )}
                     </AnimatePresence>
                  </div>
                  <div className="mt-6 pt-6 border-t border-white/5">
                     <div className="pixel-label opacity-30 mb-2 tracking-widest">GUARD_RAILS</div>
                     <div className="space-y-2">
                        <div className="flex items-center justify-between text-[7px] tech-mono">
                           <span className="text-white/40">FARADAY_CONTAINMENT</span>
                           <span className="text-duck-green">ENFORCED</span>
                        </div>
                        <div className="flex items-center justify-between text-[7px] tech-mono">
                           <span className="text-white/40">LEGAL_PERIMETER</span>
                           <span className="text-duck-green">ACTIVE</span>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         <footer className="h-8 border-t border-white/5 bg-black/60 flex items-center justify-between px-8 text-[7px] tech-mono uppercase tracking-[0.3em] text-white/10">
            <div className="flex gap-6">
               <span>LAT: 45.52 | LON: -122.67</span>
               <span className={state.droneDetected ? 'text-red-500' : 'text-nes-blue/40'}>SKY: {state.droneDetected ? 'TARGET_DETECTED' : 'CLEAR'}</span>
            </div>
            <div className="flex gap-6 items-center">
               <a href="https://github.com/ghostintheprompt/duckhunter-drone-defense-laboratory/releases" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors border-r border-white/10 pr-6">CHECK_FOR_UPDATES</a>
               <span className="text-zapper-orange animate-pulse">{state.droneDetected ? `SIGNAL: -${state.signalStrength.toFixed(0)}dBm` : 'SCANNING_OS'}</span>
               <span>DUCKHUNT_OS_V1.5</span>
            </div>
         </footer>
      </main>
    </div>
  );
}
