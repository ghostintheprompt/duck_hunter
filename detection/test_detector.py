import unittest
from detector import (
    generate, GaussianNB, detection_report, build_track,
    radio_only_predict, FEATURES, RADIO_IDX, FUSION_IDX, DRONE_CLASSES,
)


def _fusion_eval():
    X, y = generate(n_per_class=400, seed=1337)
    cut = int(len(X) * 0.7)
    model = GaussianNB().fit(X[:cut], y[:cut], idx=FUSION_IDX)
    return detection_report(y[cut:], model.predict(X[cut:]))


def _radio_eval():
    X, y = generate(n_per_class=400, seed=1337)
    cut = int(len(X) * 0.7)
    return detection_report(y[cut:], radio_only_predict(X[cut:]))


class TestData(unittest.TestCase):
    def test_shape_and_labels(self):
        X, y = generate(n_per_class=50, seed=1)
        self.assertEqual(len(X), 200)
        self.assertEqual(set(y), {"drone_emitting", "drone_dark", "bird", "clutter"})
        self.assertTrue(all(len(row) == len(FEATURES) for row in X))

    def test_features_bounded(self):
        X, _ = generate(n_per_class=100, seed=2)
        self.assertTrue(all(0.0 <= v <= 1.0 for row in X for v in row))

    def test_deterministic(self):
        self.assertEqual(generate(50, seed=7), generate(50, seed=7))


class TestDetectionGap(unittest.TestCase):
    """The core claim of the whole tool, enforced as a test."""

    def setUp(self):
        self.radio = _radio_eval()
        self.fusion = _fusion_eval()

    def test_radio_is_blind_to_dark_drones(self):
        # Radio-only must largely miss the drone with its radio off.
        self.assertLess(self.radio["dark_detect"], 0.05)

    def test_fusion_sees_dark_drones(self):
        self.assertGreater(self.fusion["dark_detect"], 0.80)

    def test_fusion_beats_radio_on_the_dark_drone(self):
        self.assertGreater(
            self.fusion["dark_detect"] - self.radio["dark_detect"], 0.5)

    def test_both_catch_the_emitting_drone(self):
        self.assertGreater(self.radio["emitting_detect"], 0.80)
        self.assertGreater(self.fusion["emitting_detect"], 0.80)

    def test_fusion_keeps_bird_false_alarms_low(self):
        self.assertLess(self.fusion["bird_false_alarm"], 0.15)


class TestTrack(unittest.TestCase):
    def test_track_carries_heading_and_node_location(self):
        node = {"id": "NODE-07", "lat": 38.8895, "lon": -77.0353}
        t = build_track([0] * len(FEATURES), "drone_dark", 0.9, node)
        self.assertIn("heading_deg", t)
        self.assertEqual(t["node_location"], {"lat": 38.8895, "lon": -77.0353})
        self.assertTrue(t["is_threat"])
        self.assertTrue(0.0 <= t["heading_deg"] <= 360.0)


if __name__ == "__main__":
    unittest.main(verbosity=2)
