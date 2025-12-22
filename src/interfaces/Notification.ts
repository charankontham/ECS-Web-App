export interface Notification {
  userId: number;
  messageId: number;
  type: number;
  priority: number;
  title: string;
  description: string;
  messageLink: string;
  createdAt: Date;
  isRead: boolean;
}
