import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Cpu, Wifi, AlertCircle, CheckCircle2, Terminal as TerminalIcon, Info, Usb } from 'lucide-react';
import { useSystem } from '../context/SystemContext';

const SDR_FILTERS = [
  { vendorId: 0x0BDA, productId: 0x2832 }, // RTL2832U
  { vendorId: 0x0BDA, productId: 0x2838 }, // RTL-SDR Blog V3
  { vendorId: 0x1D50, productId: 0x6089 }, // HackRF One
];

export default function HardwareBridge() {
  const { state, setHardwareState } = useSystem();
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startDiscovery = async () => {
    if (!('usb' in navigator)) {
      setError('WebUSB not supported in this browser. Use Chrome or Edge.');
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      // @ts-ignore
      const device = await navigator.usb.requestDevice({ filters: SDR_FILTERS });
      
      console.log('Tactical link established:', device.productName);
      
      // Perform low-level handshake
      await device.open();
      if (device.configuration === null) {
        await device.selectConfiguration(1);
      }
      await device.claimInterface(0);

      const type = device.vendorId === 0x1D50 ? 'HACKRF' : 'RTL_SDR';
      setHardwareState(true, type);
      
    } catch (err) {
      console.error('USB Error:', err);
      if (err instanceof Error && err.name !== 'NotFoundError') {
        setError(err.message);
      }
    } finally {
      setIsSearching(false);
    }
  };

  const disconnectHardware = () => {
    setHardwareState(false, 'SDR_SIM');
  };

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col gap-12 py-12">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-white tracking-widest uppercase italic">The Hardware Bridge</h2>
        <p className="text-sm text-white/40 max-w-2xl mx-auto tech-mono">
           DuckHunter is built for simulation, but it is architected for real-world parity. 
           Follow the protocol to connect live SDR (Software Defined Radio) units via WebUSB.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="tech-container p-8 bg-white/[0.01] border-white/5 space-y-6">
           <div className="flex items-center gap-4 text-zapper-orange">
              <Usb size={24} />
              <h3 className="font-bold text-xs uppercase tracking-widest text-white">USB SDR Connectivity</h3>
           </div>
           
           <div className="space-y-4 text-[10px] tech-mono leading-relaxed text-white/40">
              <p>
                 To use DuckHunter with real-world signals, connect your device and authorize the browser to link the driver bridge.
              </p>
              <div className="p-4 bg-black/40 border-l border-zapper-orange/40">
                 <div className="text-white mb-2 underline uppercase">Detected Hardware:</div>
                 <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${state.isHardwareConnected ? 'bg-duck-green' : 'bg-red-500'} animate-pulse`} />
                    <span className="text-white font-bold">{state.isHardwareConnected ? state.hardwareType : 'NONE_DETECTED'}</span>
                 </div>
              </div>
           </div>

           {state.isHardwareConnected ? (
              <button 
                onClick={disconnectHardware}
                className="w-full py-4 border border-red-500/20 text-red-500 tech-mono text-[9px] uppercase hover:bg-red-500/10 transition-all flex items-center justify-center gap-3"
              >
                 DISCONNECT_HARDWARE
              </button>
           ) : (
              <button 
                onClick={startDiscovery}
                disabled={isSearching}
                className="w-full py-4 border border-zapper-orange/20 text-zapper-orange tech-mono text-[9px] uppercase hover:bg-zapper-orange/10 transition-all flex items-center justify-center gap-3"
              >
                 {isSearching ? <div className="w-3 h-3 border-2 border-zapper-orange border-t-transparent rounded-full animate-spin" /> : <Wifi size={16} />}
                 {isSearching ? 'SCANNING_USB_BUS...' : 'INIT_HARDWARE_SEARCH'}
              </button>
           )}

           {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-[8px] tech-mono uppercase">
                 ERR: {error}
              </div>
           )}
        </div>

        <div className="tech-container p-8 bg-red-500/[0.02] border-red-500/10 space-y-6">
           <div className="flex items-center gap-4 text-red-500">
              <AlertCircle size={24} />
              <h3 className="font-bold text-xs uppercase tracking-widest text-white">Legal & Technical Hurdles</h3>
           </div>
           
           <div className="space-y-4 text-[9px] tech-mono leading-relaxed text-white/50">
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 italic">
                 CRITICAL: Broad-spectrum jamming is illegal in civilian airspace (FCC/EASA). Operation in shielded Faraday cages only.
              </div>
              <ul className="space-y-4">
                 <li>
                    <span className="text-white font-bold block mb-1">1. BROWSERS RESTRICTIONS</span>
                    Modern browsers prevent direct execution of low-level RF drivers. DuckHunter requires a local WebSocket daemon or WebUSB implementation (Chromium only).
                 </li>
                 <li>
                    <span className="text-white font-bold block mb-1">2. SAMPLE RATE LIMITS</span>
                    High-end drones use 40MHz+ bandwidth. Consumer SDRs (RTL2832U) are limited to 2.4MHz. HackRF/USRP is required for full spectrum capture.
                 </li>
                 <li>
                    <span className="text-white font-bold block mb-1">3. HARDWARE ENCRYPTION</span>
                    Proprietary links (AES-256) cannot be decrypted by this software alone. We focus on unencrypted MAVLink and Analog FPV video metadata.
                 </li>
              </ul>
           </div>
        </div>
      </div>

      {state.isHardwareConnected && (
        <div className="tech-container p-6 bg-black/40 border-zapper-orange/10">
           <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                 <TerminalIcon size={16} className="text-zapper-orange" />
                 <h3 className="text-[10px] font-bold text-white uppercase tracking-widest italic">{state.hardwareType}_DATA_STREAM</h3>
              </div>
              <div className="flex items-center gap-4 text-[8px] tech-mono">
                 <span className="text-duck-green font-bold animate-pulse">SAMPLES_STREAMING</span>
                 <span className="text-white/20">2.4 Msps</span>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                 <div className="text-[7px] tech-mono text-white/20 uppercase mb-2">Decoded_Frames</div>
                 <div className="h-40 bg-black/60 p-4 font-mono text-[8px] space-y-1 overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none" />
                    {[...Array(8)].map((_, i) => (
                       <motion.div 
                         key={i}
                         initial={{ opacity: 0, x: -10 }}
                         animate={{ opacity: 1 - (i * 0.1), x: 0 }}
                         transition={{ delay: i * 0.1 }}
                         className="flex gap-4 text-duck-green/60"
                       >
                          <span className="opacity-30">0x{Math.floor(Math.random() * 0xFFFF).toString(16).padStart(4, '0')}</span>
                          <span>{['MSG_HEARTBEAT', 'MSG_GPS_RAW_INT', 'MSG_SYS_STATUS', 'MSG_ATTITUDE'][Math.floor(Math.random() * 4)]}</span>
                          <span className="ml-auto opacity-30">{Math.floor(Math.random() * 100)}ms</span>
                       </motion.div>
                    ))}
                 </div>
              </div>

              <div className="space-y-4">
                 <div className="text-[7px] tech-mono text-white/20 uppercase mb-2">Signal_Polarization</div>
                 <div className="h-40 border border-white/5 bg-black/60 flex items-center justify-center overflow-hidden">
                    <svg width="100%" height="100%" viewBox="0 0 200 200" className="opacity-40">
                       <circle cx="100" cy="100" r="80" fill="none" stroke="white" strokeWidth="0.5" strokeDasharray="2 2" />
                       <line x1="20" y1="100" x2="180" y2="100" stroke="white" strokeWidth="0.5" />
                       <line x1="100" y1="20" x2="100" y2="180" stroke="white" strokeWidth="0.5" />
                       <motion.path 
                         d="M100,100 L140,60" 
                         stroke="#ff3c00" 
                         strokeWidth="2"
                         animate={{ rotate: 360 }}
                         transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
                         style={{ transformOrigin: '100px 100px' }}
                       />
                       {[...Array(20)].map((_, i) => (
                          <motion.circle
                            key={i}
                            cx={100 + Math.random() * 80 - 40}
                            cy={100 + Math.random() * 80 - 40}
                            r="1"
                            fill="#4ade80"
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ duration: 1, repeat: Infinity, delay: Math.random() }}
                          />
                       ))}
                    </svg>
                 </div>
              </div>
           </div>
        </div>
      )}

      <div className="tech-container p-6 border-white/5 bg-black/40">
         <div className="flex items-center gap-3 mb-6">
            <TerminalIcon size={18} className="text-white/20" />
            <h3 className="text-[10px] font-bold text-white uppercase tracking-widest">Tactical Implementation Plan</h3>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
               { step: '01', title: 'Driver Hook', desc: 'Compile local librtlsdr bridge' },
               { step: '02', title: 'Data Pipe', desc: 'Forward I/Q samples via WebSocket' },
               { step: '03', title: 'DSP Engine', desc: 'Apply FFT and pattern classification' }
            ].map(item => (
               <div key={item.step} className="flex gap-4">
                  <div className="text-lg font-bold text-zapper-orange/20">{item.step}</div>
                  <div>
                     <div className="text-[9px] font-bold text-white uppercase mb-1">{item.title}</div>
                     <div className="text-[8px] text-white/30 tech-mono">{item.desc}</div>
                  </div>
               </div>
            ))}
         </div>
      </div>

      <div className="mt-auto pt-6 border-t border-white/5 flex justify-between items-center text-[7px] tech-mono text-white/20 uppercase tracking-widest">
         <span>SDR_BRIDGE // V1.0.0</span>
         <div className="flex gap-4">
            <span className="flex items-center gap-1 text-red-500/40 animate-pulse"><AlertCircle size={10} /> FOR_RESEARCH_PURPOSES_ONLY</span>
         </div>
      </div>
    </div>
  );
}
