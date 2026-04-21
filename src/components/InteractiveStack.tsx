import { motion } from 'motion/react';
import { Satellite, Radio, Cpu, Smartphone, Cloud, Layers, ShieldAlert } from 'lucide-react';
import { useSystem } from '../context/SystemContext';

const layers = [
  { id: 'cloud', name: 'Cloud Backend', icon: Cloud, vulnerability: 'API leaks, data exposure, fleet management hijacking' },
  { id: 'gcs', name: 'Ground Control (GCS)', icon: Smartphone, vulnerability: 'OS-level malware, insecure app links, buffer overflows' },
  { id: 'firmware', name: 'Flight Controller', icon: Cpu, vulnerability: 'Firmware exploits, logic bugs, unauthenticated missions' },
  { id: 'mavlink', name: 'MAVLink Protocol', icon: Layers, vulnerability: 'No encryption, injection, replay attacks' },
  { id: 'rf', name: 'RF Control Link', icon: Radio, vulnerability: 'Signal jamming, telemetry sniffing, link hijacking' },
  { id: 'gps', name: 'GPS / GNSS', icon: Satellite, vulnerability: 'No signal authentication, spoofing, signal denial' }
];

export default function InteractiveStack() {
  const { state } = useSystem();
  
  return (
    <div className="my-16 flex flex-col items-center">
      <div className="tech-mono mb-8 text-zapper-orange uppercase tracking-widest text-[10px]">Drone_Vulnerability_Stack</div>
      
      <div className="relative w-full max-w-sm space-y-1">
        {layers.map((layer, index) => {
          const isActiveVector = state.droneDetected && (layer.id === 'rf' || layer.id === 'mavlink' || layer.id === 'gps');
          
          return (
            <motion.div
              key={layer.id}
              whileHover={{ scale: 1.02, x: 5 }}
              animate={isActiveVector ? { 
                boxShadow: ['0 0 0px #ff3c0000', '0 0 15px #ff3c0044', '0 0 0px #ff3c0000'] 
              } : {}}
              transition={isActiveVector ? { duration: 2, repeat: Infinity } : {}}
              className="group cursor-pointer"
            >
              <div className={`tech-container transition-all p-4 flex items-center justify-between group-hover:border-zapper-orange/30 ${
                isActiveVector ? 'bg-zapper-orange/[0.03] border-zapper-orange/20' : 'bg-white/[0.01] hover:bg-white/[0.04]'
              }`}>
               <div className="flex items-center gap-4">
                  <div className="p-2 bg-zapper-orange/10 text-zapper-orange group-hover:glow-orange transition-all">
                     <layer.icon size={18} />
                  </div>
                  <div>
                     <div className="text-[11px] font-bold text-white/80 group-hover:text-white uppercase tracking-wider">{layer.name}</div>
                     <div className="text-[8px] text-white/20 hidden group-hover:block transition-all mt-1 tech-mono">
                        {layer.vulnerability}
                     </div>
                  </div>
               </div>
               <div className="text-white/5 group-hover:text-zapper-orange/50 transition-colors">
                  <ShieldAlert size={14} />
               </div>
            </div>
            
            {index < layers.length - 1 && (
               <div className="flex justify-center h-2 overflow-hidden">
                  <div className="w-[1px] h-full bg-white/5" />
               </div>
            )}
          </motion.div>
        )})}
      </div>
    </div>
  );
}
