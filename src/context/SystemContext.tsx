import { createContext, useContext, useState, ReactNode } from 'react';

interface SystemState {
  droneDetected: boolean;
  targetId: string | null;
  signalStrength: number;
  noiseFloor: number;
  linkIntegrity: number;
  cpuTemp: number;
  impactDetected: boolean;
  alerts: { id: string, timestamp: string, type: string, description: string }[];
  isSystemReady: boolean;
  isHardwareConnected: boolean;
  hardwareType: 'SDR_SIM' | 'RTL_SDR' | 'HACKRF' | null;
}

interface SystemContextType {
  state: SystemState;
  setDroneDetected: (detected: boolean, id?: string | null) => void;
  setSignalStrength: (strength: number) => void;
  setNoiseFloor: (floor: number) => void;
  setLinkIntegrity: (integrity: number) => void;
  setCpuTemp: (temp: number) => void;
  setImpact: (impact: boolean) => void;
  triggerAlert: (alertId: string, type: string, description: string) => void;
  setSystemReady: (ready: boolean) => void;
  setHardwareState: (connected: boolean, type: SystemState['hardwareType']) => void;
}

const SystemContext = createContext<SystemContextType | undefined>(undefined);

export function SystemProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SystemState>({
    droneDetected: false,
    targetId: null,
    signalStrength: 0,
    noiseFloor: -110,
    linkIntegrity: 100,
    cpuTemp: 42, // Celsius
    impactDetected: false,
    alerts: [],
    isSystemReady: true,
    isHardwareConnected: false,
    hardwareType: 'SDR_SIM'
  });

  const setDroneDetected = (detected: boolean, id: string | null = null) => {
    setState(prev => ({ 
      ...prev, 
      droneDetected: detected, 
      targetId: id,
      impactDetected: !detected ? false : prev.impactDetected 
    }));
  };

  const setSignalStrength = (strength: number) => {
    setState(prev => ({ ...prev, signalStrength: strength }));
  };

  const setNoiseFloor = (floor: number) => {
    setState(prev => ({ ...prev, noiseFloor: floor }));
  };

  const setLinkIntegrity = (integrity: number) => {
    setState(prev => ({ ...prev, linkIntegrity: integrity }));
  };

  const setCpuTemp = (temp: number) => {
    setState(prev => ({ ...prev, cpuTemp: temp }));
  };

  const setImpact = (impact: boolean) => {
    setState(prev => ({ ...prev, impactDetected: impact }));
  };

  const triggerAlert = (alertId: string, type: string, description: string) => {
    const ts = new Date().toLocaleTimeString('en-GB', { hour12: false });
    setState(prev => ({
      ...prev,
      alerts: [{ id: alertId, timestamp: ts, type, description }, ...prev.alerts.slice(0, 9)]
    }));
  };

  const setSystemReady = (ready: boolean) => {
    setState(prev => ({ ...prev, isSystemReady: ready }));
  };

  const setHardwareState = (connected: boolean, type: SystemState['hardwareType']) => {
    setState(prev => ({ ...prev, isHardwareConnected: connected, hardwareType: type }));
  };

  return (
    <SystemContext.Provider value={{ 
      state, 
      setDroneDetected, 
      setSignalStrength, 
      setNoiseFloor, 
      setLinkIntegrity, 
      setCpuTemp,
      setImpact,
      triggerAlert, 
      setSystemReady, 
      setHardwareState 
    }}>
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
