export enum ChatType {
  DIRECT = "DIRECT",
  GROUP = "GROUP",
  ENTITY = "ENTITY",
}

export enum ParticipantRole {
  ADMIN = "ADMIN",
  MEMBER = "MEMBER",
}

export enum MessageType {
  TEXT = "TEXT",
  FILE = "FILE",
  SYSTEM = "SYSTEM",
  OVC_CARD = "OVC_CARD",
}

export interface IChatConversation {
  id: string;
  organizationId: string;
  type: ChatType;
  name?: string | null;
  description?: string | null;
  avatarUrl?: string | null;
  entityType?: string | null;
  entityId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IChatParticipant {
  id: string;
  organizationId: string;
  conversationId: string;
  userId: string;
  role: ParticipantRole;
  lastReadAt?: Date | null;
  joinedAt: Date;
}

export interface IChatMessage {
  id: string;
  organizationId: string;
  conversationId: string;
  senderId: string;
  content?: string | null;
  type: MessageType;
  metadata?: any | null; // For OVC_CARD details
  replyToId?: string | null;
  isEdited: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
