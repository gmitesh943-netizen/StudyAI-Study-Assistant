import time
from fastapi import HTTPException, Request, status

class SlidingWindowRateLimiter:
    def __init__(self, limit: int, window: int):
        """
        :param limit: Maximum number of requests allowed in the window.
        :param window: Time window in seconds.
        """
        self.limit = limit
        self.window = window
        self.history = {}  # Format: {ip: [timestamp1, timestamp2, ...]}

    def __call__(self, request: Request):
        client_ip = request.client.host if request.client else "unknown"
        now = time.time()
        
        # Get history for IP and filter old requests
        timestamps = self.history.get(client_ip, [])
        timestamps = [t for t in timestamps if now - t < self.window]
        
        # Check if limit exceeded
        if len(timestamps) >= self.limit:
            # Calculate retry-after header time
            retry_after = int(self.window - (now - timestamps[0]))
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Too many requests. Please try again in {retry_after} seconds.",
                headers={"Retry-After": str(retry_after)}
            )
        
        # Add current request timestamp and save
        timestamps.append(now)
        self.history[client_ip] = timestamps
