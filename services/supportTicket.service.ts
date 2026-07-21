import { apiClient } from '@/lib/api';

export interface SupportTicket {
  _id: string;
  ticketNumber: string;
  category: string;
  priority: string;
  subject: string;
  description: string;
  status: string;
  attachments: Array<{ url: string; filename: string; mimeType: string; size: number }>;
  diagnostics?: Record<string, unknown>;
  resolution?: string;
  satisfactionRating?: number;
  relatedContext?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface SupportTicketDetail {
  ticket: SupportTicket;
  activity: Array<{ action: string; actorType: string; metadata?: Record<string, unknown>; createdAt: string }>;
  messages: Array<{ _id: string; body: string; authorName?: string; authorType: string; attachments: unknown[]; createdAt: string }>;
}

class SupportTicketService {
  async listTickets(params?: { page?: number; limit?: number; status?: string; category?: string; search?: string }) {
    const response = await apiClient.get<{ success: boolean; data: { items: SupportTicket[]; pagination: unknown } }>(
      '/support/tickets',
      { params }
    );
    return response.data?.items ? response.data : { items: [], pagination: {} };
  }

  async getTicket(id: string) {
    const response = await apiClient.get<{ success: boolean; data: SupportTicketDetail }>(`/support/tickets/${id}`);
    return response.data;
  }

  async createTicket(formData: FormData) {
    const response = await apiClient.uploadFile<{ success: boolean; data: SupportTicket }>('/support/tickets', formData);
    return response;
  }

  async addReply(id: string, body: string, files?: File[]) {
    const formData = new FormData();
    formData.append('body', body);
    files?.forEach((f) => formData.append('attachments', f));
    return apiClient.uploadFile(`/support/tickets/${id}/replies`, formData);
  }

  async reopenTicket(id: string) {
    return apiClient.post(`/support/tickets/${id}/reopen`);
  }

  async submitRating(id: string, rating: number) {
    return apiClient.post(`/support/tickets/${id}/rating`, { rating });
  }
}

export const supportTicketService = new SupportTicketService();
