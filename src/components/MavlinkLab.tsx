import { useState, useEffect, useRef } from 'react';
import { Terminal as TerminalIcon, Play, Pause, Square, Wifi, ShieldAlert, Cpu, Flame, Bomb, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSystem } from '../context/SystemContext';

interface LogEntry {
  id: number;
  timestamp: string;
  type: 'POSITION' | 'HEARTBEAT' | 'WAYPOINT' | 'COMMAND' | 'SYSTEM' | 'IMPACT';
  details: string;
}

export default function MavlinkLab() {
  const { state, triggerAlert, setCpuTemp, setImpact } = useSystem();
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [droneState, setDroneState] = useState({ armed: false, mode: 'STABILIZE', alt: 0, lat: 45.523, lon: -122.676 });
  const [alert, setAlert] = useState<string | null>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  const addLog = (type: LogEntry['type'], details: string) => {
    const ts = new Date().toLocaleTimeString('en-GB', { hour12: false });
    setLogs(prev => [...prev.slice(-49), { id: Date.now(), timestamp: ts, type, details }]);
  };

  const injectCommand = async (cmd: string) => {
    if (state.linkIntegrity < 30 && Math.random() > 0.5) {
       addLog('COMMAND', `ERR: LINK_INTEGRITY_LOW // INJECTION_FAILED`);
       return;
    }

    addLog('COMMAND', `PENDING: REQUESTING_${cmd}...`);
    await new Promise(r => setTimeout(r, 600));

    addLog('COMMAND', `INJECTED: ${cmd}`);
    
    if (cmd === 'TERMINATE_KINETIC') {
      setDroneState(prev => ({ ...prev, armed: false, alt: 0 }));
      setImpact(true);
      setAlert('!!! CRITICAL: MID-AIR MOTOR KILL EXECUTED !!!');
      addLog('IMPACT', 'PHYSICAL_DESTRUCTION_CONFIRMED // KINETIC_FAILSAFE_INJECTED');
      triggerAlert('INC-MAV-400', 'KINETIC_TERMINATION', 'MAV_CMD_DO_FLIGHT_TERMINATION executed. Aircraft destroyed on impact.');
      setTimeout(() => setAlert(null), 4000);
    }

    if (cmd === 'THERMAL_OVERLOAD') {
       addLog('SYSTEM', 'INJECTING_HOG_LOAD... OVERCLOCKING_ESC_CONTROLLER');
       let temp = state.cpuTemp;
       const interval = setInterval(() => {
          temp += 5;
          setCpuTemp(temp);
          if (temp > 95) {
             clearInterval(interval);
             addLog('SYSTEM', 'FAILSAFE: THERMAL_SHUTDOWN_INITIATED');
             setDroneState(prev => ({ ...prev, armed: false, alt: 0 }));
             triggerAlert('INC-PWR-505', 'HARDWARE_DENIAL', 'Thermal runaway detected. System shutdown to prevent battery fire.');
          }
       }, 500);
    }

    if (cmd === 'RTL_EXPLODE') {
       setDroneState(prev => ({ ...prev, mode: 'RTL' }));
       addLog('HEARTBEAT', 'MODE CHANGE: RTL (FORCED)');
       addLog('SYSTEM', 'PAYLOAD_ARMED: PROXIMITY_TRIGGER_ACTIVE');
       
       setTimeout(() => {
          addLog('IMPACT', 'RTL_PROXIMITY_TRIGGERED // SECONDARY_EFFECT_ACTIVE');
          setImpact(true);
          setDroneState(prev => ({ ...prev, armed: false, alt: 0 }));
          triggerAlert('INC-NAV-606', 'LOGIC_HIJACK', 'Aircraft returned to launch and detonated kinetic secondary.');
       }, 5000);
    }

    if (cmd === 'DISARM_FORCE') {
      setDroneState(prev => ({ ...prev, armed: false, alt: 0 }));
      setAlert('!!! CRITICAL: REMOTE DISARM EXECUTED !!!');
      triggerAlert('INC-MAV-603', 'UNAUTHORIZED_COMMAND', 'Remote disarm command injected via secondary link.');
      setTimeout(() => setAlert(null), 3000);
    }
  };

  useEffect(() => {
    if (!isRunning || !state.droneDetected || state.impactDetected) return;

    const interval = setInterval(() => {
      const types: LogEntry['type'][] = ['POSITION', 'HEARTBEAT', 'WAYPOINT', 'COMMAND'];
      const type = types[Math.floor(Math.random() * (droneState.armed ? 4 : 2))]; 
      
      const ts = new Date().toLocaleTimeString('en-GB', { hour12: false });
      let details = '';

      switch (type) {
        case 'POSITION':
          const nAlt = droneState.armed ? Math.min(120, droneState.alt + (Math.random() - 0.2) * 5) : 0;
          details = `lat=${droneState.lat.toFixed(6)} lon=${droneState.lon.toFixed(6)} alt=${nAlt.toFixed(1)}m`;
           setDroneState(prev => ({ ...prev, alt: nAlt }));
          break;
        case 'HEARTBEAT':
          details = `${droneState.armed ? 'ARMED' : 'DISARMED'}  mode=${droneState.mode} temp=${state.cpuTemp}°C`;
          break;
        case 'WAYPOINT':
          details = `seq=${Math.floor(Math.random() * 10)} lat=${droneState.lat.toFixed(4)} lon=${droneState.lon.toFixed(4)} alt=50.0m`;
          break;
        case 'COMMAND':
           details = `ID=${Math.floor(Math.random() * 1000)} param1=0.0 status=ACCEPTED`;
          break;
      }

      setLogs(prev => [...prev.slice(-49), { id: Date.now(), timestamp: ts, type, details }]);
    }, 800);

    return () => clearInterval(interval);
  }, [isRunning, droneState.armed, droneState.mode, droneState.alt, state.droneDetected, state.impactDetected, state.cpuTemp]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="tech-container glow-orange mb-12 flex flex-col h-[500px]">
      <div className="tech-header">
        <div className="flex items-center gap-2">
          <TerminalIcon size={16} className="text-zapper-orange" />
          <span className="tech-mono">ZAPPER_INJECT // CMD_OVERRIDE v1.5</span>
        </div>
        <div className="flex items-center gap-4">
           {state.impactDetected && (
              <div className="flex items-center gap-2 px-2 py-0.5 bg-red-600 border border-red-400 text-[7px] tech-mono text-white animate-bounce">
                 <ShieldAlert size={8} /> KINETIC_IMPACT_DETECTED
              </div>
           )}
           <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsRunning(!isRunning)}
                className={`p-1 rounded-none hover:bg-white/10 transition-colors ${isRunning ? 'text-red-500' : 'text-duck-green'}`}
              >
                {isRunning ? <Square size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
              </button>
          <button 
            onClick={() => { setLogs([]); setImpact(false); setCpuTemp(42); }}
            className="p-1 rounded-none hover:bg-white/10 text-white/20"
          >
            <ShieldAlert size={16} />
          </button>
        </div>
      </div>
    </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 bg-black/40 overflow-hidden">
        <div className="col-span-3 overflow-y-auto p-4 font-mono text-[10px] space-y-1 custom-scrollbar relative">
          {(!state.droneDetected || state.impactDetected) && (
            <div className="absolute inset-0 z-10 bg-black/80 backdrop-blur-sm flex items-center justify-center border border-white/5">
              <div className="text-center p-8 max-w-xs tech-container bg-zapper-orange/5 border-zapper-orange/20">
                <ShieldAlert size={32} className="text-zapper-orange mx-auto mb-4 animate-pulse" />
                <div className="font-bold text-white mb-2 uppercase tracking-widest">{state.impactDetected ? 'Signal_Terminated' : 'Target_Null'}</div>
                <p className="text-[8px] text-white/40 tech-mono uppercase">
                   {state.impactDetected ? 'Physical impact detected. Link parity lost. Reset system to acquire new target.' : 'Please lock onto a signal in the SKY_SWEEP lab before attempting injection.'}
                </p>
              </div>
            </div>
          )}
          {logs.length === 0 && (
             <div className="text-white/10 italic">Awaiting radio parity...</div>
          )}
          {logs.map((log) => (
            <div key={log.id} className="flex gap-4">
              <span className="text-white/20">[{log.timestamp}]</span>
              <span className={`w-16 ${
                log.type === 'POSITION' ? 'text-nes-blue' : 
                log.type === 'HEARTBEAT' ? 'text-duck-green' : 
                log.type === 'WAYPOINT' ? 'text-purple-400' : 
                log.type === 'IMPACT' ? 'text-red-500 font-bold' :
                'text-zapper-orange'
              }`}>{log.type}</span>
              <span className="text-white/60">{log.details}</span>
            </div>
          ))}
          <div ref={logEndRef} />
        </div>

        <div className="border-l border-white/5 p-4 flex flex-col gap-6 bg-white/[0.01]">
          <div className="space-y-4">
             <div>
                <div className="tech-mono mb-1 opacity-50">Signal Priority</div>
                <div className="text-[9px] text-red-500 uppercase font-bold flex items-center gap-1">
                   <ShieldAlert size={10} /> LINK_HIJACKABLE
                </div>
             </div>
             <div>
                <div className="tech-mono mb-1 opacity-50">Thermal State</div>
                <div className={`text-[9px] font-bold ${state.cpuTemp > 80 ? 'text-red-500 animate-pulse' : 'text-duck-green'}`}>
                   {state.cpuTemp.toFixed(1)}°C // {state.cpuTemp > 80 ? 'CRITICAL' : 'NOMINAL'}
                </div>
             </div>
             <div>
                <div className="tech-mono mb-1 opacity-50">Target Armed</div>
                <div className={`text-xs font-bold ${droneState.armed ? 'text-red-500' : 'text-duck-green'}`}>
                   {droneState.armed ? 'YES_ARMED' : 'NO_READY'}
                </div>
             </div>
             <div>
                <div className="tech-mono mb-1 opacity-50">Flight Mode</div>
                <div className="text-xs text-white font-bold">{droneState.mode}</div>
             </div>
          </div>
          
          <div className="flex-1 pt-4 border-t border-white/5">
             <div className="pixel-label mb-4 text-zapper-orange uppercase">Offensive Tools</div>
             <div className="flex flex-col gap-2">
                <button 
                  onClick={() => injectCommand('TERMINATE_KINETIC')}
                  className="group relative w-full py-2 bg-red-600/10 border border-red-600/30 text-red-500 text-[8px] tech-mono hover:bg-red-600 hover:text-white transition-all uppercase flex items-center justify-center gap-2"
                >
                  <Zap size={10} className="group-hover:animate-pulse" /> Kinetic Kill
                </button>
                <button 
                  onClick={() => injectCommand('THERMAL_OVERLOAD')}
                  className="group w-full py-2 bg-orange-600/10 border border-orange-600/30 text-orange-500 text-[8px] tech-mono hover:bg-orange-600 hover:text-white transition-all uppercase flex items-center justify-center gap-2"
                >
                  <Flame size={10} /> Heat Soak
                </button>
                <button 
                  onClick={() => injectCommand('RTL_EXPLODE')}
                  className="group w-full py-2 bg-purple-600/10 border border-purple-600/30 text-purple-500 text-[8px] tech-mono hover:bg-purple-600 hover:text-white transition-all uppercase flex items-center justify-center gap-2"
                >
                  <Bomb size={10} /> RTL_Detonate
                </button>
                <div className="h-4" />
                <button 
                  onClick={() => injectCommand('DISARM_FORCE')}
                  className="w-full py-1 border border-white/10 text-white/40 text-[7px] tech-mono hover:bg-white/5 transition-all uppercase"
                >
                  Legacy Disarm
                </button>
             </div>
          </div>
        </div>
      </div>
      
      <AnimatePresence>
        {alert && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 px-6 py-2 bg-red-600 text-white tech-mono text-[10px] font-bold shadow-2xl skew-x-[-10deg]"
          >
             {alert}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
