import { apiClient } from "@/lib/api";
import type { Automation } from "@/data/mockAutomations";

export const AUTOMATIONS_QUERY_KEY = ["automations"] as const;

/**
 * Fetches automations list from API and maps to UI shape.
 */
export async function fetchAutomationsList(): Promise<Automation[]> {
  const response = await apiClient.get<{
    success?: boolean;
    data?: unknown;
    message?: string;
  }>("/automations");

  let automationsList: any[] = [];

  if (response && typeof response === "object") {
    const body = response as Record<string, unknown>;
    if (body.success === true && Array.isArray(body.data)) {
      automationsList = body.data as any[];
    } else if (Array.isArray((body as any).data?.data)) {
      automationsList = (body as any).data.data;
    } else if (Array.isArray(body.data)) {
      automationsList = body.data as any[];
    } else if (Array.isArray(response)) {
      automationsList = response as any[];
    }
  }

  if (automationsList.length === 0) {
    return [];
  }

  return automationsList.map((auto: any) => ({
    id: auto._id,
    name: auto.name,
    status: auto.isActive ? "enabled" : "disabled",
    nodes: auto.nodes || [],
    lastExecuted: auto.lastExecutedAt || null,
    executionCount: auto.executionCount || 0,
    createdAt: auto.createdAt,
  }));
}
