# Test record

Conditions, method, and measured result, so the claim can be checked.

- **Date:** 2026-10-22
- **Target / surrogate:** synthetic, physically-motivated observations for emitting drone, dark (non-RF) drone, bird, and ground clutter. Not field captures.
- **Method:** Gaussian naive Bayes trained on a 70/30 split, seed 1337. Two sensors compared: radio-only (RF features) and fusion (RF + acoustic + micro-Doppler + kinematics). Detection = sample classified into a drone class.
- **How measured:** per-class detection and false-alarm rates on the held-out test set.

```
DuckHunter dark-drone detection benchmark
synthetic, physically-motivated data | seed=1337 | 1120 train / 480 test

                          radio-only      fusion
------------------------------------------------
emitting drone detect         100.0%      100.0%
DARK drone detect               0.0%      100.0%
bird false alarm                0.0%        0.0%
clutter false alarm             0.8%        0.0%

so what: radio-only sees 0.0% of dark drones; fusion sees 100.0%.
         fusion closes a 100.0% detection gap on the drone that
         will not announce itself, the one that matters.

example fused track on a DARK drone (radio-only saw nothing here):
  {'node_id': 'NODE-07', 'node_location': {'lat': 38.8895, 'lon': -77.0353}, 'heading_deg': 304.0, 'classification': 'drone_dark', 'confidence': 0.91, 'is_threat': True, 'altitude_band_m': [1, 300]}
```

Reproduce: `python3 detection/run_benchmark.py`

Limits are stated in `detector.py` under BLIND_SPOTS and in the README. This demonstrates the sensing logic. It does not assert a fielded detection rate.
