import time
from collections import defaultdict
from threading import Lock
from typing import Dict, Any

class MetricsCollector:
    def __init__(self):
        self.lock = Lock()
        self.request_count = 0
        self.auth_failures = 0
        self.route_latencies = defaultdict(list)
        self.route_counts = defaultdict(int)

    def record_request(self, route: str, latency: float):
        with self.lock:
            self.request_count += 1
            self.route_counts[route] += 1
            # Keep only the last 100 latency records per route to limit memory
            self.route_latencies[route].append(latency)
            if len(self.route_latencies[route]) > 100:
                self.route_latencies[route].pop(0)

    def record_auth_failure(self):
        with self.lock:
            self.auth_failures += 1

    def get_summary(self) -> Dict[str, Any]:
        with self.lock:
            avg_latencies = {}
            for route, latencies in self.route_latencies.items():
                avg_latencies[route] = round(sum(latencies) / len(latencies), 4) if latencies else 0.0

            return {
                "total_requests": self.request_count,
                "auth_failures_count": self.auth_failures,
                "route_counts": dict(self.route_counts),
                "average_latencies_seconds": avg_latencies
            }

# Global metrics collector instance
metrics_collector = MetricsCollector()
