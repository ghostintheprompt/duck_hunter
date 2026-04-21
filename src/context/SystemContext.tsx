import { createContext, useContext, useState, ReactNode } from 'react';

interface SystemState {
  droneDetected: boolean;
  targetId: string | null;
  signalStrength: number;
  isSystemReady: boolean;
  isHardwareConnected: boolean;
  hardwareType: 'SDR_SIM' | 'RTL_SDR' | 'HACKRF' | null;
}

interface SystemContextType {
  state: SystemState;
  setDroneDetected: (detected: boolean, id?: string | null) => void;
  setSignalStrength: (strength: number) => void;
  setSystemReady: (ready: boolean) => void;
  setHardwareState: (connected: boolean, type: SystemState['hardwareType']) => void;
}

const SystemContext = createContext<SystemContextType | undefined>(undefined);

export function SystemProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SystemState>({
    droneDetected: false,
    targetId: null,
    signalStrength: 0,
    isSystemReady: true,
    isHardwareConnected: false,
    hardwareType: 'SDR_SIM'
  });

  const setDroneDetected = (detected: boolean, id: string | null = null) => {
    setState(prev => ({ ...prev, droneDetected: detected, targetId: id }));
  };

  const setSignalStrength = (strength: number) => {
    setState(prev => ({ ...prev, signalStrength: strength }));
  };

  const setSystemReady = (ready: boolean) => {
    setState(prev => ({ ...prev, isSystemReady: ready }));
  };

  const setHardwareState = (connected: boolean, type: SystemState['hardwareType']) => {
    setState(prev => ({ ...prev, isHardwareConnected: connected, hardwareType: type }));
  };

  return (
    <SystemContext.Provider value={{ state, setDroneDetected, setSignalStrength, setSystemReady, setHardwareState }}>
      {children}
    </SystemContext.Provider>
  );
}

export function useSystem() {
  const context = useContext(SystemContext);
  if (context === undefined) {
    throw new Error('useSystem must be used within a SystemProvider');
  }
  return context;
}
