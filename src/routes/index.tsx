import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence } from "framer-motion";
import { AmbientScreen } from "@/components/AmbientScreen";
import { ActiveInterface } from "@/components/ActiveInterface";
import { useWakeTrigger } from "@/hooks/use-wake-trigger";

export const Route = createFileRoute("/")({
  component: SmartClosetDisplay,
});

function SmartClosetDisplay() {
  const { awake, sleep } = useWakeTrigger();

  return (
    <main className="min-h-screen">
      <AnimatePresence mode="wait">
        {awake ? <ActiveInterface onSleep={sleep} /> : <AmbientScreen />}
      </AnimatePresence>
    </main>
  );
}
