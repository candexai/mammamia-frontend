import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

export interface PlanWarning {
  type: 'callMinutes' | 'chatConversations' | 'automations';
  level: 'warning' | 'critical' | 'exceeded';
  message: string;
  current: number;
  limit: number;
  percentage: number;
}

export interface PlanLockStatus {
  locked: boolean;
  reason: string | null;
}

export interface PlanWarningsResult {
  warnings: PlanWarning[];
  lockStatus: PlanLockStatus;
}

export function usePlanWarnings() {
  return useQuery<PlanWarningsResult>({
    queryKey: ['plan-warnings'],
    queryFn: async () => {
      const response = await apiClient.get<{
        success?: boolean;
        data?: { warnings: PlanWarning[]; lockStatus: PlanLockStatus };
      }>('/plan-warnings');

      const payload = response?.data;
      if (!payload || typeof payload !== 'object') {
        throw new Error('Invalid plan-warnings response');
      }

      return {
        warnings: Array.isArray(payload.warnings) ? payload.warnings : [],
        lockStatus: payload.lockStatus ?? { locked: false, reason: null },
      };
    },
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
    refetchInterval: 5 * 60_000, // Refetch every 5 minutes (plan limits change infrequently)
    staleTime: 5 * 60_000,
  });
}

export async function checkPlanAction(action: 'call' | 'chat' | 'automation'): Promise<{
  allowed: boolean;
  reason?: string;
}> {
  try {
    const response = await apiClient.post<{ data: { allowed: boolean; reason?: string } }>(
      '/plan-warnings/check',
      { action }
    );
    return response.data;
  } catch (error) {
    console.error('Error checking plan action:', error);
    return { allowed: true }; // Allow by default on error
  }
}
