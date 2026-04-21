# Initialization Protocol: DuckHunter Lab

This document outlines the protocol for compiling and deploying the DuckHunter Laboratory from source.

## Tactical Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)
- Chromium-based browser (Chrome, Edge, Brave) for WebUSB parity

## Deployment Setup

1. Clone the Laboratory:
   ```bash
   git clone https://github.com/ghostintheprompt/duckhunter-drone-defense-laboratory.git
   cd duckhunter-drone-defense-laboratory
   ```

2. Link Environment Dependencies:
   ```bash
   npm install
   ```

3. Initialize Field Development:
   ```bash
   npm run dev
   ```
   The application will be accessible at `http://localhost:3000`.

## Production Compilation

To generate a production-ready static bundle for deployment:

```bash
npm run build
```

The output will be contained in the `dist/` directory.

## Troubleshooting (DOG_HOUSE)

### SDR Link Failures
If the HWD_BRIDGE fails to establish parity with your unit:
- Verify that the device is not currently claimed by another process.
- Chromium parity is required; Firefox and Safari do not support the WebUSB protocol.
- Linux users may require udev rule modification to grant browser-level USB access.

### Simulation Divergence
If signals are not appearing in SKY_SWEEP, ensure the browser tab has focus to maintain high-fidelity simulation timing.

---
Built by MDRN Corp — mdrn.app
