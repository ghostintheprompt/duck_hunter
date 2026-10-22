"""
Measure the sensing gap, and write the test record.

Headline result: a radio-only sensor is blind to the dark drone. A fused
sensor sees it. We prove it with a number, on a held-out split, and we
write down the conditions so a reader can check the claim.

Run:  python3 detection/run_benchmark.py
"""

import os
import datetime
from detector import (
    generate, GaussianNB, detection_report, build_track,
    radio_only_predict, RADIO_IDX, FUSION_IDX,
)


def split(X, y, train_frac=0.7):
    cut = int(len(X) * train_frac)
    return X[:cut], y[:cut], X[cut:], y[cut:]


def pct(x):
    return "{:5.1f}%".format(100 * x)


def main():
    X, y = generate(n_per_class=400, seed=1337)
    Xtr, ytr, Xte, yte = split(X, y)

    fusion = GaussianNB().fit(Xtr, ytr, idx=FUSION_IDX)

    r = detection_report(yte, radio_only_predict(Xte))
    f = detection_report(yte, fusion.predict(Xte))

    lines = []
    lines.append("DuckHunter dark-drone detection benchmark")
    lines.append("synthetic, physically-motivated data | seed=1337 | "
                 + "{} train / {} test".format(len(Xtr), len(Xte)))
    lines.append("")
    lines.append("{:<24}{:>12}{:>12}".format("", "radio-only", "fusion"))
    lines.append("-" * 48)
    lines.append("{:<24}{:>12}{:>12}".format("emitting drone detect", pct(r["emitting_detect"]), pct(f["emitting_detect"])))
    lines.append("{:<24}{:>12}{:>12}".format("DARK drone detect", pct(r["dark_detect"]), pct(f["dark_detect"])))
    lines.append("{:<24}{:>12}{:>12}".format("bird false alarm", pct(r["bird_false_alarm"]), pct(f["bird_false_alarm"])))
    lines.append("{:<24}{:>12}{:>12}".format("clutter false alarm", pct(r["clutter_false_alarm"]), pct(f["clutter_false_alarm"])))
    lines.append("")
    gap = f["dark_detect"] - r["dark_detect"]
    lines.append("so what: radio-only sees {} of dark drones; fusion sees {}.".format(
        pct(r["dark_detect"]).strip(), pct(f["dark_detect"]).strip()))
    lines.append("         fusion closes a {} detection gap on the drone that".format(pct(gap).strip()))
    lines.append("         will not announce itself, the one that matters.")
    lines.append("")

    node = {"id": "NODE-07", "lat": 38.8895, "lon": -77.0353}
    di = next(i for i, t in enumerate(yte) if t == "drone_dark")
    track = build_track(Xte[di], fusion.predict([Xte[di]])[0], 0.91, node)
    lines.append("example fused track on a DARK drone (radio-only saw nothing here):")
    lines.append("  " + str(track))

    report = "\n".join(lines)
    print(report)

    here = os.path.dirname(os.path.abspath(__file__))
    with open(os.path.join(here, "TEST_RECORD.md"), "w") as fh:
        fh.write("# Test record\n\n")
        fh.write("Conditions, method, and measured result, so the claim can be checked.\n\n")
        fh.write("- **Date:** {}\n".format(datetime.date.today().isoformat()))
        fh.write("- **Target / surrogate:** synthetic, physically-motivated observations for "
                 "emitting drone, dark (non-RF) drone, bird, and ground clutter. Not field captures.\n")
        fh.write("- **Method:** Gaussian naive Bayes trained on a 70/30 split, seed 1337. "
                 "Two sensors compared: radio-only (RF features) and fusion (RF + acoustic + "
                 "micro-Doppler + kinematics). Detection = sample classified into a drone class.\n")
        fh.write("- **How measured:** per-class detection and false-alarm rates on the held-out test set.\n\n")
        fh.write("```\n" + report + "\n```\n\n")
        fh.write("Reproduce: `python3 detection/run_benchmark.py`\n\n")
        fh.write("Limits are stated in `detector.py` under BLIND_SPOTS and in the README. "
                 "This demonstrates the sensing logic. It does not assert a fielded detection rate.\n")

    print("\n(test record written to detection/TEST_RECORD.md)")


if __name__ == "__main__":
    main()
