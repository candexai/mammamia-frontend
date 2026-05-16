import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';

export interface OutboundCallRequest {
  agent_id: string;
  agent_phone_number_id: string;
  to_number: string;
  customer_info?: { name?: string; email?: string; [key: string]: any };
  /** Merged with customer_info server-side; explicit keys override customer_info when both are sent. */
  dynamic_variables?: Record<string, string | number | boolean | null | undefined>;
  /** When true, sender_email is not auto-fetched from Gmail and any body sender_email is ignored. */
  omit_sender_email?: boolean;
  sender_email?: string;
  provider?: 'sip' | 'twilio'; // Optional provider parameter
}

export interface OutboundCallResponse {
  success?: boolean;
  message?: string;
  [key: string]: any;
}

/**
 * Mutation to initiate a single outbound call (test call or one-off).
 * Calls POST /api/v1/sip-trunk/outbound-call.
 * Twilio vs SIP routing is resolved server-side from the selected phone number.
 */
export function useOutboundCall() {
  return useMutation({
    mutationFn: async (data: OutboundCallRequest) => {
      const { provider: _provider, ...requestData } = data;
      const endpoint = '/sip-trunk/outbound-call';
      console.log('📞 [useOutboundCall] POST', endpoint, _provider ? `(provider hint: ${_provider})` : '');

      const response = await apiClient.post<OutboundCallResponse>(endpoint, requestData);
      return response;
    },
    onError: (error: any) => {
      console.error('❌ [useOutboundCall] Error:', error);
      toast.error(error.response?.data?.error?.message || error.message || 'Failed to initiate outbound call');
    },
  });
}
