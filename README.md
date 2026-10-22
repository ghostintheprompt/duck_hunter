# DuckHunter

Drone detection and force protection. A lab for seeing the small drone that does not want to be seen.

[![License: MIT](https://img.shields.io/badge/License-MIT-teal.svg)](https://opensource.org/licenses/MIT)
[![Detection tests](https://img.shields.io/badge/detection%20tests-9%2F9-brightgreen.svg)](detection/test_detector.py)
[![Platform](https://img.shields.io/badge/core-python%20stdlib-blue.svg)](detection/)

---

The threat that takes aircrew and ground troops out of the sky now is small, cheap, and quiet. A drone in DoD Group 1 to 3, flying low with its radio off, announces nothing. Most of what is sold as drone detection reads a cooperative Remote ID beacon that a real threat simply does not transmit. A detector that waits to be introduced is not a detector.

DuckHunter takes the other approach. It fuses the signals a silent drone cannot hide, rotor acoustics, micro-Doppler, and flight kinematics, to catch the drone that radio-only sensing misses, and it measures whether it worked.

## The result, measured

Radio-only sensing against multi-modal fusion, on a held-out split (synthetic, physically-motivated data, seed 1337):

```
                          radio-only      fusion
------------------------------------------------
emitting drone detect         100.0%      100.0%
DARK drone detect               0.0%      100.0%
bird false alarm                0.0%        0.0%
clutter false alarm             0.8%        0.0%
```

Radio-only is structurally blind to the dark drone, because a silent drone and a bird look the same over the radio, which is nothing. Fusion separates them on the signals the drone cannot turn off. The full test record, with conditions and method, is in `detection/TEST_RECORD.md`.

These numbers are clean because the data is synthetic and separable by construction. They demonstrate the sensing logic, not a fielded detection rate. The honest next step, and the only thing that earns a real performance number, is field RF, acoustic, and radar captures. That limit is stated in the code and kept in plain view on purpose.

## Run it

```
python3 detection/run_benchmark.py          # measure the gap, write the test record
cd detection && python3 -m unittest         # 9 tests, the core claim enforced
```

Pure standard library. No third-party packages.

## What it is, and what it is not

It is a sensor. It sees, classifies, and reports a track carrying a heading and the absolute location of the node that caught it, and then it leaves the decision to a human being.

It is not a weapon. Active counter-drone mitigation, jamming, spoofing, takeover, kinetic defeat, is restricted by law to specific government authorities and is illegal for private parties. The repository keeps a red-team simulation for understanding how these aircraft are attacked, because you cannot reliably detect what you refuse to understand, but it stays walled off, simulated, and is never operated against live airspace. Capability is not permission.

Standards in view: DoD UAS Groups 1 to 3, and FAA 14 CFR Part 89 Remote ID, the cooperative signal this tool deliberately does not depend on.

## Layout

```
duck_hunter/
  detection/            the detection lab (Python, standard library)
    detector.py         features, synthetic model, classifier, track output
    run_benchmark.py    radio-only against fusion, writes the test record
    test_detector.py    unit tests, including the core detection-gap claim
    TEST_RECORD.md      generated: conditions, method, measured result
  src/, public/         interactive simulation and red-team training, walled off
```

## Privacy

Local only. No telemetry, no analytics, no tracking.

---

Built because the small, quiet thing that takes aircraft out of the sky should be seen coming. For a pilot who flew toward the wounded, and the six who flew with her. Seven stars.

Built by [MDRN Corp](https://mdrn.app)
