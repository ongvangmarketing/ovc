import { MailAccountStatus, MailPermissionLevel } from "@prisma/client";

export interface CreateMailAccountDto {
  organizationId: string;
  emailAddress: string;
  displayName?: string;
  replyTo?: string;
  alias?: string;
  signature?: string;

  imapHost: string;
  imapPort?: number;
  imapUsername: string;
  imapPassword: string;
  imapSsl?: boolean;

  smtpHost: string;
  smtpPort?: number;
  smtpUsername: string;
  smtpPassword: string;
  smtpSsl?: boolean;

  syncInterval?: number;
  isSystem?: boolean;
}

export interface UpdateMailAccountDto extends Partial<CreateMailAccountDto> {
  status?: MailAccountStatus;
  errorMessage?: string;
}

export interface MailAccountMemberDto {
  userId?: string;
  roleId?: string;
  departmentId?: string;
  permissions: MailPermissionLevel[];
}

export interface SendMailDto {
  fromAccountId: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  bodyHtml?: string;
  bodyText?: string;
  replyToMessageId?: string; // If replying to an existing email
}
