export type NotificationStatus = 'all' | 'read' | 'unread';

export interface Notification {
  id: number;
  caseId: number;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  number: number;
  size: number;
}
