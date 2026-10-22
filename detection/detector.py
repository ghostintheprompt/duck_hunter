"""
Dark-drone detection core.

The problem, stated the way the field actually faces it: a small drone
(DoD Group 1 to 3) flying with its radio off does not announce itself. A
sensor that only reads the Remote ID beacon, or only listens for a control
link, is blind to it. The drone that matters is the one that is quiet.

This module demonstrates, on physically-motivated synthetic data, why
radio-only sensing misses the dark drone and why multi-modal fusion catches
it. It is a method demonstrator, not a fielded-performance claim. See
BLIND_SPOTS at the bottom of this file and in the README.

Standards referenced: DoD UAS Groups 1-3; FAA Part 89 Remote ID (the
cooperative signal this module deliberately does not depend on).

Pure standard library. Runs on python3 with no third-party packages.
"""

import math
import random
import statistics

# Per-observation feature vector. Each feature is normalized to roughly [0, 1].
FEATURES = [
    "rf_power",        # energy in drone control/video bands (2.4 / 5.8 GHz)
    "rf_band_match",   # match to a known drone control-protocol signature
    "acoustic_bpf",    # rotor blade-pass tonal strength (acoustic)
    "md_spread",       # micro-Doppler spread from spinning rotors (radar)
    "path_linearity",  # controlled, straight/hold-and-dash track geometry
    "speed",           # normalized airspeed
    "hover",           # sustained near-zero-speed station keeping
    "altitude",        # height in the 1-300 m low-altitude band
]

# Radio-only sensing uses only the two emission features. Fusion uses all.
RADIO_IDX = [0, 1]
FUSION_IDX = list(range(len(FEATURES)))

# (mean, std) per feature per class, encoding the physical story.
# The key fact: drone_dark is identical to drone_emitting EXCEPT it has no
# usable RF. Its rotor acoustics, micro-Doppler, and controlled kinematics
# are the same. That is why fusion sees it and radio does not.
CLASS_PARAMS = {
    "drone_emitting": [(.80, .08), (.85, .08), (.75, .10), (.80, .10), (.80, .10), (.50, .15), (.60, .20), (.50, .25)],
    "drone_dark":     [(.04, .03), (.02, .02), (.72, .10), (.78, .10), (.82, .10), (.50, .15), (.60, .20), (.48, .25)],
    "bird":           [(.04, .03), (.02, .02), (.20, .10), (.35, .12), (.40, .15), (.40, .20), (.15, .12), (.45, .25)],
    "clutter":        [(.45, .20), (.20, .12), (.12, .08), (.10, .08), (.70, .20), (.05, .05), (.10, .10), (.05, .05)],
}

DRONE_CLASSES = {"drone_emitting", "drone_dark"}


def _clamp(x):
    return 0.0 if x < 0 else (1.0 if x > 1 else x)


def generate(n_per_class=400, seed=1337):
    """Return (X, y): physically-motivated synthetic observations and labels."""
    rng = random.Random(seed)
    X, y = [], []
    for cls, params in CLASS_PARAMS.items():
        for _ in range(n_per_class):
            X.append([_clamp(rng.gauss(m, s)) for (m, s) in params])
            y.append(cls)
    order = list(range(len(X)))
    rng.shuffle(order)
    return [X[i] for i in order], [y[i] for i in order]


class GaussianNB:
    """Minimal Gaussian naive Bayes. Baseline on purpose: the point is the
    sensing gap, not the classifier. A stronger model only widens the gap."""

    def __init__(self, var_floor=1e-4):
        self.var_floor = var_floor
        self.classes = []
        self.idx = []
        self.priors, self.means, self.vars = {}, {}, {}

    def fit(self, X, y, idx=None):
        self.idx = idx if idx is not None else list(range(len(X[0])))
        self.classes = sorted(set(y))
        n = len(y)
        for c in self.classes:
            rows = [[X[i][j] for j in self.idx] for i in range(n) if y[i] == c]
            self.priors[c] = math.log(len(rows) / n)
            cols = list(zip(*rows))
            self.means[c] = [statistics.fmean(col) for col in cols]
            self.vars[c] = [max(statistics.pvariance(col), self.var_floor) for col in cols]
        return self

    def _loglik(self, c, xr):
        s = self.priors[c]
        for v, m, var in zip(xr, self.means[c], self.vars[c]):
            s += -0.5 * math.log(2 * math.pi * var) - ((v - m) ** 2) / (2 * var)
        return s

    def predict(self, X):
        out = []
        for row in X:
            xr = [row[j] for j in self.idx]
            out.append(max(self.classes, key=lambda c: self._loglik(c, xr)))
        return out


def radio_only_predict(X, pw=0.5, pm=0.5):
    """What a radio-only sensor actually does: it declares a drone only when
    it hears a drone-like control emission (power present AND the band
    matches a known drone protocol). A drone flying dark emits nothing, so
    this sensor is structurally blind to it, the same way it is blind to a
    bird. Returns a drone class when an emission is seen, else a non-drone
    sentinel, so detection_report can score it like any other sensor."""
    out = []
    for row in X:
        rf_power, rf_band_match = row[0], row[1]
        out.append("drone_emitting" if (rf_power > pw and rf_band_match > pm) else "no_emission")
    return out


def detection_report(y_true, y_pred):
    """Collapse multi-class predictions to the thing that matters: did the
    sensor call a drone a drone, and how often did it cry wolf."""
    def rate(true_cls, want_drone):
        total = sum(1 for t in y_true if t == true_cls)
        if total == 0:
            return 0.0
        hit = sum(1 for t, p in zip(y_true, y_pred)
                  if t == true_cls and ((p in DRONE_CLASSES) == want_drone))
        return hit / total
    return {
        "emitting_detect": rate("drone_emitting", True),
        "dark_detect": rate("drone_dark", True),
        "bird_false_alarm": rate("bird", True),
        "clutter_false_alarm": rate("clutter", True),
    }


def build_track(sample, classification, confidence, node, rng=None):
    """Emit a single fused track in the shape a perimeter node must report:
    heading plus the absolute location of the detecting node. Heading and
    position here are modeled, not measured. The classification is real."""
    rng = rng or random.Random(0)
    return {
        "node_id": node["id"],
        "node_location": {"lat": node["lat"], "lon": node["lon"]},
        "heading_deg": round(rng.uniform(0, 360), 1),
        "classification": classification,
        "confidence": round(confidence, 3),
        "is_threat": classification in DRONE_CLASSES,
        "altitude_band_m": [1, 300],
    }


# BLIND_SPOTS (read before trusting a number out of this):
# 1. The data is synthetic and physically motivated. It is NOT field RF,
#    acoustic, or radar captures. The separability reflects modeling
#    assumptions, so the results demonstrate the method's logic, not a
#    fielded detection rate. Real captures are the next step and the only
#    thing that earns a performance claim.
# 2. Gaussian naive Bayes is a deliberate baseline. Field data is messier.
# 3. Track heading and node position are modeled for format, not estimated
#    from real multi-node geometry. Localization is a separate problem.
# 4. Detection is the whole scope. Mitigation is federally restricted for
#    civilians and is not implemented here. Capability is not permission.
