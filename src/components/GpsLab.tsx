import { useState, useEffect } from 'react';
import { Satellite, ShieldAlert, Zap, AlertTriangle, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSystem } from '../context/SystemContext';

export default function GpsLab() {
  const { state } = useSystem();
  const [dataPoints, setDataPoints] = useState<{ x: number, gps: number, imu: number }[]>([]);
  const [isSpoofing, setIsSpoofing] = useState(false);
  const [alerts, setAlerts] = useState<string[]>([]);

  useEffect(() => {
    if (!state.droneDetected) return;
    let tick = 0;
    const interval = setInterval(() => {
      setDataPoints(prev => {
        const lastGps = prev.length > 0 ? prev[prev.length - 1].gps : 50;
        const lastImu = prev.length > 0 ? prev[prev.length - 1].imu : 50;
        
        let newGps = lastGps + (Math.random() - 0.5) * 2;
        let newImu = lastImu + (Math.random() - 0.5) * 2;

        if (isSpoofing) {
          // Slowly diverge GPS
          newGps = lastGps + 2 + (Math.random() * 2);
          // IMU stays somewhat consistent with noise
          newImu = lastImu + (Math.random() - 0.5) * 2;
        }

        const nextPoints = [...prev.slice(-19), { x: tick++, gps: newGps, imu: newImu }];
        
        // Detect mismatch
        if (Math.abs(newGps - newImu) > 15) {
           if (!alerts.includes('IMU_MISMATCH')) {
             setAlerts(a => [...a, `[${new Date().toLocaleTimeString()}] TRK_ERR: LOCK_DIVERGENCE`]);
           }
        }

        return nextPoints;
      });
    }, 500);

    return () => clearInterval(interval);
  }, [isSpoofing, alerts]);

  return (
    <div className="tech-container glow-orange mb-12">
      <div className="tech-header">
        <div className="flex items-center gap-2">
          <Satellite size={16} className="text-zapper-orange" />
          <span className="tech-mono">TRACK_LOCK Integrity // V.04</span>
        </div>
        <button 
          onClick={() => {
            setIsSpoofing(!isSpoofing);
            if (!isSpoofing) setAlerts([]);
          }}
          className={`px-3 py-1 text-[8px] tech-mono border transition-all ${
            isSpoofing ? 'border-red-500 text-red-500 bg-red-500/10' : 'border-white/10 text-white/40 hover:border-white/20'
          }`}
        >
          {isSpoofing ? 'DISABLE_MOCK' : 'INJECT_SPOOF_PKT'}
        </button>
      </div>

      <div className="p-6 relative">
        {!state.droneDetected && (
          <div className="absolute inset-0 z-10 bg-black/80 backdrop-blur-sm flex items-center justify-center m-6">
            <div className="text-center p-8 max-w-xs tech-container bg-zapper-orange/5 border-zapper-orange/20">
              <Satellite size={32} className="text-zapper-orange mx-auto mb-4 animate-pulse" />
              <div className="font-bold text-white mb-2 uppercase tracking-widest">Signal_Loss</div>
              <p className="text-[8px] text-white/40 tech-mono uppercase">Coordinates unavailable. Please identify an aircraft in SKY_SWEEP to begin integrity validation.</p>
            </div>
          </div>
        )}
        <div className="h-48 w-full relative border-b border-l border-white/5 flex items-end">
          {/* Background Grid */}
          <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 pointer-events-none opacity-[0.02]">
            {[...Array(4)].map((_, i) => <div key={i} className="border-t border-white" />)}
          </div>

          <svg className="w-full h-full overflow-visible">
            {/* Legend */}
            <g transform="translate(10, 20)">
               <rect x="0" y="-4" width="12" height="2" fill="#ff3c00" />
               <text x="18" y="0" className="fill-white/30 text-[8px] tech-mono tracking-widest">SATELLITE_FIX</text>
               <rect x="0" y="11" width="12" height="2" fill="#ffffff20" />
               <text x="18" y="15" className="fill-white/30 text-[8px] tech-mono tracking-widest">INTERNAL_IMU</text>
            </g>

            {/* GPS Line */}
            <polyline
              fill="none"
              stroke="#ff3c00"
              strokeWidth="1.5"
              points={dataPoints.map((p, i) => `${(i / 19) * 100}%,${100 - p.gps}%`).join(' ')}
              style={{ transition: 'all 0.5s ease' }}
              className="w-full"
              preserveAspectRatio="none"
              vectorEffect="non-scaling-stroke"
            />
            {/* IMU Line */}
            <polyline
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="1"
              strokeDasharray="2"
              points={dataPoints.map((p, i) => `${(i / 19) * 100}%,${100 - p.imu}%`).join(' ')}
              style={{ transition: 'all 0.5s ease' }}
              className="w-full opacity-10"
              preserveAspectRatio="none"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
           <div className="tech-container border-white/5 p-4 h-32 overflow-y-auto custom-scrollbar bg-black/20">
              <div className="tech-mono mb-2 text-white/20">TRK_ANALYTICS</div>
              {alerts.length === 0 && <div className="text-[8px] text-white/10 tech-mono italic uppercase">No signal anomalies.</div>}
              {alerts.map((a, i) => (
                <div key={i} className="text-[8px] font-mono text-zapper-orange mb-1 flex items-center gap-2">
                  <ShieldAlert size={10} />
                  {a}
                </div>
              ))}
           </div>
           <div className="bg-white/[0.01] border border-white/5 p-4 flex flex-col justify-center items-center relative overflow-hidden">
              <AnimatePresence>
                {isSpoofing ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="text-center z-10"
                  >
                    <div className="text-zapper-orange mb-2 flex justify-center"><AlertTriangle size={24} /></div>
                    <div className="text-xs font-bold text-white mb-1 uppercase tracking-widest">TRK_DIVERGENCE</div>
                    <div className="text-[7px] text-white/30 tech-mono uppercase">Satellite coords rejected by IMU</div>
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center z-10"
                  >
                    <div className="text-duck-green mb-2 flex justify-center"><ShieldCheck size={24} /></div>
                    <div className="text-xs font-bold text-white/60 mb-1 uppercase tracking-widest">SIGNAL_LOCK_FIX</div>
                    <div className="text-[7px] text-white/20 tech-mono uppercase">Positional parity validated</div>
                  </motion.div>
                )}
              </AnimatePresence>
           </div>
        </div>
      </div>
    </div>
  );
}
