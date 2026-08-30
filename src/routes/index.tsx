import { createFileRoute } from "@tanstack/react-router";
import { ActiveInterface } from "@/components/ActiveInterface";

export const Route = createFileRoute("/")({ component: ActiveInterface });
