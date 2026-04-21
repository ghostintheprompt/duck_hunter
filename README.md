# DuckHunter: Drone Defense Laboratory

<p align="center">
  <img src="public/og-image.png" width="500" alt="DuckHunter Icon" />
</p>

[![License: MIT](https://img.shields.io/badge/License-MIT-teal.svg)](https://opensource.org/licenses/MIT)
[![Platform: Web](https://img.shields.io/badge/Platform-Web-blue.svg)](https://www.google.com/chrome/)
[![Release: v1.0.0](https://img.shields.io/badge/Release-v1.0.0-orange.svg)](https://github.com/ghostintheprompt/duckhunter-drone-defense-laboratory/releases)

DuckHunter is a high-fidelity, interactive drone security simulation and research platform. It serves as a tactical OS for security researchers to analyze drone attack surfaces, intercept protocols, and identify RF signatures in real-time.

## Active Capabilities

### SKY_SWEEP (RF Spectrum Analysis)
- Spectral Hunting: Real-time signal identification across 2.4GHz, 5.8GHz, and 900MHz bands (Simulation).
- Signature Classification: Automated detection of drone links vs. standard noise (Simulation).
- Signal Tracking: Visualizes power spectral density (PSD) to determine target proximity.

### CMD_INJECT (MAVLink Interception)
- Pulse Sniffer: Passive monitoring of simulated MAVLink telemetry packets (POSITION, HEARTBEAT).
- Zapper Injection: Deploy tactical overrides to regain control of rogue aircraft:
  - TERMINATE_FLIGHT: Forced disarming and motor shutdown.
  - RECALL_TARGET: Immediate Return-To-Launch (RTL) injection.
  - GPS_HIJACK: Mission waypoint redirection.

### TRACK_LOCK (GPS Integrity Monitor)
- Divergence Analysis: Continuous cross-validation of GNSS data against internal IMU sensors.
- Spoof Detection: Identifies GPS spoofing by flagging divergence between reported coordinates and movement vectors.
- Zapper Parity: Validates that the "duck" in the crosshairs is physically where the data says it is.

### EW_CENTRAL (Electronic Warfare)
- Broadband Saturation: Noise injection simulations to break the "Control Link" between GCS and aircraft.
- Meaconing: Deployment of delayed GPS/GNSS rebroadcasts to "drift" the target safely.
- Protocol Exploitation: Pattern identification for FHSS used by ELRS and Crossfire links.

### HWD_BRIDGE (SDR Hardware Integration)
- Plug & Play WebUSB: Integration for RTL-SDR and HackRF One hardware discovery.
- Hardware Handshaking: Low-level USB claiming for direct SDR access via browser-native drivers.
- I/Q Processing: Proof-of-Concept flow for piping raw radio samples into the visualizer.

## Tactical Installation

### Build from Source

1. Clone the repository:
   ```bash
   git clone https://github.com/ghostintheprompt/duckhunter-drone-defense-laboratory.git
   cd duckhunter-drone-defense-laboratory
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start local development server:
   ```bash
   npm run dev
   ```

4. Compile production build:
   ```bash
   npm run build
   ```

## Tactical Disclaimer (DOG_HOUSE)

CRITICAL: SIGNAL TRANSMISSION SECURITY NOTICE

DuckHunter is a precision research and simulation suite. Unauthorized radio frequency interference, broadband jamming, or signal spoofing is a felony-level offense in most civilian jurisdictions (FCC, EASA, etc.).

- The Zapper Clause: If you connect high-gain hardware, pull the trigger in live airspace, and catch a legal cease-and-desist or an actual raid—that is your Game Over.
- Containment: All active Electronic Warfare (EW) protocols must be executed within certified Faraday Cages or shielded laboratory environments.
- User Responsibility: The developers of DuckHunter accept zero liability for your misuse of these protocols. Secure your own perimeter.

## Privacy Statement

DuckHunter is built on MDRN Corp principles: free, open source, no subscriptions, and zero telemetry. All simulation data and hardware interactions occur strictly within your local browser environment.

---

### Built by MDRN Corp — [mdrn.app](https://mdrn.app)
