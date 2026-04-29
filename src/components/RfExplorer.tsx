import { useState, useEffect } from 'react';
import { Radio, Zap, AlertTriangle, ShieldCheck, Target } from 'lucide-react';
import { motion } from 'motion/react';

import { useSystem } from '../context/SystemContext';

interface Signal {
  id: string;
  name: string;
  freq: number;
  power: number;
  type: string;
  isDrone: boolean;
}

const BANDS = [
  { name: '2.4 GHz', start: 2400, end: 2483 },
  { name: '5.8 GHz', start: 5725, end: 5850 },
  { name: '900 MHz', start: 900, end: 930 }
];

export default function RfExplorer() {
  const { state, setDroneDetected, setSignalStrength } = useSystem();
  const [activeBand, setActiveBand] = useState(BANDS[0]);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    if (!isScanning) return;

    const interval = setInterval(() => {
      setSignals(prev => {
        const next = prev.filter(() => Math.random() > 0.3);
        
        if (Math.random() > 0.5) {
          const freq = activeBand.start + Math.random() * (activeBand.end - activeBand.start);
          const power = -90 + Math.random() * 60;
          const isDrone = Math.random() > 0.7;
          
          const newSignal = {
            id: Math.random().toString(36).substr(2, 9),
            name: isDrone ? 'DJI_O3_LINK_TA_P01' : 'WIFI_HOME_2G',
            freq,
            power,
            type: isDrone ? 'OFDM_FHSS' : 'IEEE_802.11',
            isDrone
          };
          
          if (isDrone && !state.droneDetected) {
            setDroneDetected(true, newSignal.id);
            setSignalStrength(Math.abs(power));
          }

          next.push(newSignal);
        }
        
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isScanning, activeBand, setDroneDetected, setSignalStrength, state.droneDetected]);

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {BANDS.map(band => (
          <button
            key={band.name}
            onClick={() => setActiveBand(band)}
            className={`tech-container p-4 text-left transition-all ${
              activeBand.name === band.name ? 'border-zapper-orange/50 bg-zapper-orange/5' : 'hover:border-white/20'
            }`}
          >
            <div className="tech-mono text-[10px] mb-1 opacity-50">Target Band</div>
            <div className="text-white font-bold">{band.name}</div>
            <div className="text-[10px] tech-mono mt-2 text-white/30">
               {band.start} - {band.end} MHz
            </div>
          </button>
        ))}
      </div>

      <div className="tech-container flex-1 min-h-[400px] flex flex-col">
        <div className="tech-header">
           <div className="flex items-center gap-2">
              <Radio size={14} className="text-zapper-orange" />
              <span className="tech-mono text-[8px]">Spectral Hunter // {activeBand.name}</span>
           </div>
           <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-[8px] tech-mono text-white/20">
                 <div className="w-2 h-2 rounded-none bg-zapper-orange animate-pulse" />
                 SWEEPING_FOR_DUCKS
              </div>
           </div>
        </div>
        
        <div className="flex-1 relative p-8 flex items-end gap-1">
           {/* Background Grid */}
           <div className="absolute inset-x-8 inset-y-8 grid grid-cols-10 grid-rows-6 pointer-events-none opacity-[0.03]">
              {[...Array(60)].map((_, i) => <div key={i} className="border-t border-l border-white" />)}
           </div>

           {/* Spectral Visualization */}
           <div className="w-full h-full flex items-end gap-[2px]">
              {[...Array(100)].map((_, i) => {
                 const freq = activeBand.start + (i / 100) * (activeBand.end - activeBand.start);
                 const activeSignal = signals.find(s => Math.abs(s.freq - freq) < 1);
                 
                 // Technical Restoration: Incorporate noise floor from SystemContext
                 const noiseFactor = (state.noiseFloor + 110) / 2; // Normalize -110..-60 range
                 const baseHeight = 5 + Math.random() * 5 + noiseFactor;

                 return (
                    <div key={i} className="flex-1 flex flex-col justify-end gap-1 h-full">
                       <motion.div 
                          initial={false}
                          animate={{ 
                             height: activeSignal ? `${(activeSignal.power + 100)}%` : `${baseHeight}%`,
                             backgroundColor: activeSignal ? (activeSignal.isDrone ? '#ff3c00' : '#ffffff44') : (state.noiseFloor > -80 ? '#ef444420' : '#ffffff05')
                          }}
                          className="w-full transition-colors duration-500"
                       />
                    </div>
                 );
              })}
           </div>

           {/* Floating Marker for Drone */}
           {signals.filter(s => s.isDrone).map(s => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute top-1/4"
                style={{ left: `${((s.freq - activeBand.start) / (activeBand.end - activeBand.start)) * 100}%` }}
              >
                 <div className="flex flex-col items-center">
                    <div className="bg-zapper-orange text-black text-[8px] font-bold px-1 py-0.5 tech-mono whitespace-nowrap mb-2">
                       TARGET_IDENTIFIED
                    </div>
                    <div className="w-[1px] h-32 bg-gradient-to-b from-zapper-orange to-transparent" />
                 </div>
              </motion.div>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="tech-container p-6 bg-white/[0.01]">
            <h3 className="tech-mono text-[10px] mb-4 text-zapper-orange">Signal Acquisition</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
               {signals.map(s => (
                  <div key={s.id} className="flex items-center justify-between py-2 border-b border-white/5 text-[9px] tech-mono">
                     <div className="flex items-center gap-3">
                        <div className={`p-1 ${s.isDrone ? 'bg-zapper-orange/20 text-zapper-orange' : 'bg-white/10 text-white/40'}`}>
                           {s.isDrone ? <Target size={10} /> : <Radio size={10} />}
                        </div>
                        <div>
                           <div className="text-white leading-none mb-1">{s.name}</div>
                           <div className="opacity-40">{s.freq.toFixed(2)} MHz</div>
                        </div>
                     </div>
                     <div className="text-right">
                        <div className="text-white">{s.power.toFixed(1)} dBm</div>
                        <div className="opacity-40">{s.type}</div>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         <div className="tech-container p-6 bg-white/[0.01] flex flex-col justify-center items-center text-center">
            {signals.some(s => s.isDrone) ? (
               <>
                  <div className="w-12 h-12 border border-red-500/50 bg-red-500/10 text-red-500 flex items-center justify-center mb-4 animate-pulse">
                     <AlertTriangle size={20} />
                  </div>
                  <h3 className="text-white font-bold text-sm mb-1 uppercase tracking-widest">DRONE_LOCKED</h3>
                  <p className="text-[8px] text-white/40 tech-mono leading-relaxed max-w-[200px]">
                     Unencrypted telemetry detected. Zapper link established.
                  </p>
               </>
            ) : (
               <>
                  <div className="w-12 h-12 border border-duck-green/50 bg-duck-green/10 text-duck-green flex items-center justify-center mb-4">
                     <ShieldCheck size={20} />
                  </div>
                  <h3 className="text-white font-bold text-sm mb-1 uppercase tracking-widest">SKY_SECURE</h3>
                  <p className="text-[8px] text-white/40 tech-mono leading-relaxed max-w-[200px]">
                     No unauthorized aircraft signatures detected. Scanning...
                  </p>
               </>
            )}
         </div>
      </div>
    </div>
  );
}
