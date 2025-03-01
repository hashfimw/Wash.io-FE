export type NotificationRequestType = "read" | "unread" | "all"  


export interface GetNotificationsRequest {
  page?: number;
  limit?: number;
  requestType?: NotificationRequestType ;
}

export interface NotificationRecord {
  id: number;
  userId: number;
  title: string;
  description: string;
  isRead: boolean;
  url: string | null;
  createdAt: string
}

export interface GetNotificationsResponse {
  data: NotificationRecord[];
  meta: {
    page: number;
    limit: number;
    total_pages: number;
    total_data: number;
  };
}
