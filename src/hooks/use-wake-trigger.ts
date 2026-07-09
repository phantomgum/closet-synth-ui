import { useEffect, useState } from "react";

/**
 * Wake trigger hook — stub for the local motion-sensor bridge.
 *
 * ARCHITECTURE NOTE:
 * A local Python script (motion sensor on the closet door) will eventually
 * run a small WebSocket server on the LAN, e.g. ws://closet-pi.local:8765.
 * When motion is detected it sends: { "event": "WAKE" }
 * After a period of inactivity it sends: { "event": "SLEEP" }
 *
 * For now the connection is stubbed:
 *  - Press [Space] or tap/click anywhere to simulate a WAKE trigger.
 *  - Press [Escape] to simulate a SLEEP trigger.
 */
const SENSOR_WS_URL = "ws://closet-pi.local:8765"; // future Python bridge

export function useWakeTrigger() {
  const [awake, setAwake] = useState(false);

  useEffect(() => {
    let ws: WebSocket | null = null;

    // --- Real WebSocket wiring (disabled until the Python bridge exists) ---
    const ENABLE_SENSOR_SOCKET = false;
    if (ENABLE_SENSOR_SOCKET) {
      ws = new WebSocket(SENSOR_WS_URL);
      ws.onmessage = (msg) => {
        try {
          const data = JSON.parse(msg.data as string);
          if (data.event === "WAKE") setAwake(true);
          if (data.event === "SLEEP") setAwake(false);
        } catch {
          /* ignore malformed frames */
        }
      };
    }

    // --- Simulated triggers for development ---
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space") setAwake(true);
      if (e.code === "Escape") setAwake(false);
    };
    const onPointer = () => setAwake(true);

    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer);

    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
      ws?.close();
    };
  }, []);

  return { awake, sleep: () => setAwake(false) };
}
