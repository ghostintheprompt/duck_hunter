import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, Zap, Radio, Target, AlertTriangle, Crosshair, Lock } from 'lucide-react';
import { useSystem } from '../context/SystemContext';

const EW_TOOLS = [
  { id: 'jam', name: 'BROADBAND_NOISE', desc: 'Saturate frequency with white noise to sever control links.', power: 100 },
  { id: 'spoof', name: 'MEACONING_SPOOF', desc: 'Rebroadcast delayed GNSS signals to drift target coordinates.', power: 60 },
  { id: 'protocol', name: 'LINK_HARDENING', desc: 'Detect and exploit ELRS/Crossfire telemetry weaknesses.', power: 40 }
];

export default function EwCentral() {
  const { state } = useSystem();
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [deploymentProgress, setDeploymentProgress] = useState(0);
  const [combatLogs, setCombatLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    setCombatLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 10)]);
  };

  const handleDeploy = (toolId: string) => {
    if (activeTool) return;
    setActiveTool(toolId);
    setDeploymentProgress(0);
    addLog(`INITIATING ${EW_TOOLS.find(t => t.id === toolId)?.name}...`);
    
    const timer = setInterval(() => {
      setDeploymentProgress(p => {
        if (p >= 100) {
          clearInterval(timer);
          addLog(`EFFECT_ACTIVE: ${EW_TOOLS.find(t => t.id === toolId)?.name}`);
          setTimeout(() => {
            setActiveTool(null);
            setDeploymentProgress(0);
            addLog(`EFFECT_DISSIPATED.`);
          }, 5000);
          return 100;
        }
        return p + 2;
      });
    }, 50);
  };

  return (
    <div className="h-full flex flex-col gap-8">
      <div className="flex justify-between items-start">
        <div className="tech-container p-6 bg-red-500/5 border-red-500/20 max-w-md">
           <div className="flex items-center gap-3 mb-4">
              <Zap className="text-red-500 animate-pulse" size={24} />
              <h2 className="text-xl font-bold text-white uppercase tracking-widest italic">Electronic Warfare Center</h2>
           </div>
           <p className="text-[10px] tech-mono text-white/40 leading-relaxed mb-4">
              Combat-proven countermeasures inspired by modern high-intensity conflict zones. 
              Broadband saturation and positional deception are mandatory for urban area denial.
           </p>
           {!state.droneDetected && (
              <div className="p-2 bg-red-500/20 border border-red-500/40 text-[8px] tech-mono text-red-500 uppercase flex items-center gap-2">
                 <ShieldAlert size={12} /> Warning: No target lock. Countermeasures inactive.
              </div>
           )}
        </div>

        <div className="tech-container p-6 w-64 bg-black/40">
           <div className="pixel-label opacity-30 mb-2">Combat_Feed</div>
           <div className="space-y-1 h-32 overflow-hidden flex flex-col justify-end">
              {combatLogs.map((log, i) => (
                <div key={i} className="text-[8px] tech-mono text-white/40 truncate">
                   {log}
                </div>
              ))}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {EW_TOOLS.map(tool => (
          <div key={tool.id} className={`tech-container p-6 transition-all ${activeTool === tool.id ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'border-white/5 opacity-80 hover:opacity-100 hover:border-white/20'}`}>
             <div className="flex justify-between items-start mb-6">
                <div className={`p-2 ${activeTool === tool.id ? 'bg-red-500 text-white' : 'bg-white/5 text-white/40'}`}>
                   {tool.id === 'jam' ? <Radio size={18} /> : tool.id === 'spoof' ? <Target size={18} /> : <Lock size={18} />}
                </div>
                <div className="text-right">
                   <div className="tech-mono text-[8px] opacity-40 uppercase">Power_Req</div>
                   <div className="text-xs text-white font-bold">{tool.power}mW</div>
                </div>
             </div>
             
             <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-2">{tool.name}</h3>
             <p className="text-[9px] tech-mono text-white/40 mb-6 h-8 leading-tight">
                {tool.desc}
             </p>

             <div className="relative h-10">
                <AnimatePresence mode="wait">
                   {activeTool === tool.id ? (
                      <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        className="w-full h-full"
                      >
                         <div className="flex justify-between items-center text-[7px] tech-mono text-red-500 mb-1">
                            <span>DEPLOYING_BURST</span>
                            <span>{deploymentProgress}%</span>
                         </div>
                         <div className="h-1.5 bg-white/5 overflow-hidden">
                            <motion.div 
                              className="h-full bg-red-500" 
                              initial={{ width: 0 }}
                              animate={{ width: `${deploymentProgress}%` }}
                            />
                         </div>
                      </motion.div>
                   ) : (
                      <button 
                        disabled={!state.droneDetected}
                        onClick={() => handleDeploy(tool.id)}
                        className={`w-full py-2 border text-[8px] tech-mono uppercase transition-all ${
                          state.droneDetected 
                          ? 'border-red-500/40 text-red-500 hover:bg-red-500 hover:text-white' 
                          : 'border-white/5 text-white/10 cursor-not-allowed'
                        }`}
                      >
                         Execute Protocol
                      </button>
                   )}
                </AnimatePresence>
             </div>
          </div>
        ))}
      </div>

      {/* Triangulation Visual */}
      <div className="tech-container flex-1 bg-black/60 p-8 flex items-center justify-center relative overflow-hidden">
         <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="w-full h-full" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #ef4444 0%, transparent 100%)', backgroundSize: '100% 100%' }} />
         </div>
         
         <div className="relative w-96 h-96 border border-white/5 rounded-full flex items-center justify-center">
            {/* Radar Sweeps */}
            <motion.div 
               animate={{ rotate: 360 }}
               transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
               className="absolute inset-0 border-t border-red-500/20 rounded-full"
            />
            <div className="absolute w-1/3 h-1/3 border border-white/10 rounded-full" />
            <div className="absolute w-2/3 h-2/3 border border-white/10 rounded-full" />
            
            {/* Antennas */}
            {[0, 120, 240].map((angle, i) => (
               <div 
                 key={i} 
                 className="absolute w-4 h-4 bg-white/10 border border-white/20 flex items-center justify-center"
                 style={{ transform: `rotate(${angle}deg) translateY(-192px)` }}
               >
                  <div className="w-1 h-3 bg-red-500/40" />
               </div>
            ))}

            {/* Locked Target */}
            {state.droneDetected && (
              <motion.div 
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute text-red-500 flex flex-col items-center"
                style={{ top: '30%', left: '60%' }} // Mock position
              >
                 <Crosshair size={24} className="animate-spin-slow" />
                 <div className="mt-2 bg-red-600 text-white text-[7px] px-1 font-bold tech-mono whitespace-nowrap">
                    TRK_ID: {state.targetId?.slice(0,4)}
                 </div>
                 <div className="text-[6px] tech-mono text-red-500/80 mt-1">AOA: 42.5°</div>
              </motion.div>
            )}

            <div className="tech-mono text-[7px] text-white/20 absolute bottom-4">
               PSEUDO_DOPPLER_ARRAY // ACTIVE
            </div>
         </div>
      </div>
    </div>
  );
}
