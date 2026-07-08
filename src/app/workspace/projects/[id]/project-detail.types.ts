export type TaskLite = {
  id: string;
  title: string;
  description?: string | null;
  status?: string | null;
  taskListId?: string | null;
  priority?: string | null;
  dueDate?: string | Date | null;
  startDate?: string | Date | null;
  tags?: string[];
  assignee?: { id?: string; name?: string | null; image?: string | null } | null;
  subtasks?: Array<{ id: string; title: string; status?: string | null }>;
  comments?: Array<{ id: string; content: string; createdAt?: string | Date | null; guestName?: string | null; user?: { name?: string | null; email?: string | null } | null }>;
  attachments?: Array<{ id: string; name: string }>;
};

export type TaskListLite = {
  id: string;
  name: string;
  order: number;
  color?: string | null;
};

export type ProjectLite = {
  id: string;
  name: string;
  description?: string | null;
  color?: string | null;
  shareToken?: string | null;
  status?: string | null;
  priority?: string | null;
  startDate?: string | Date | null;
  dueDate?: string | Date | null;
  createdAt?: string | Date | null;
  updatedAt?: string | Date | null;
  members?: Array<{ id: string; userId: string; user?: { name?: string | null; email?: string | null } | null }>;
  availableMembers?: Array<{ userId: string; role?: string | null; user?: { name?: string | null; email?: string | null } | null }>;
  owner?: { id: string; name?: string | null; email?: string | null } | null;
  ownerId?: string | null;
  tasks?: TaskLite[];
  taskLists?: TaskListLite[];
  socialMarketingEnabled?: boolean;
  facebookProjectReport?: {
    pageEnabled: boolean;
    adsEnabled: boolean;
    pageExternalId: string;
    pageName: string;
    adAccountExternalId: string;
    adAccountName: string;
    adIds: string[];
    campaignIds: string[];
    pageTotals: { reach: number; impressions: number; engagements: number; leads: number };
    adsTotals: { spend: number; reach: number; impressions: number; clicks: number; leads: number };
    posts: Array<{ id: string; caption?: string | null; permalinkUrl?: string | null; publishedAt?: string | Date | null }>;
    pageDaily?: Array<{ date: string; reach: number; impressions: number; engagements: number; leads: number }>;
    adsDaily?: Array<{ date: string; spend: number; reach: number; impressions: number; clicks: number; leads: number }>;
    diagnostics?: { pageInsightRows: number; pagePostRows: number; adInsightRows: number };
  } | null;
};
