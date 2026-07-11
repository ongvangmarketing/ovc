import imap, { ImapSimple, Message } from "imap-simple";
import { simpleParser, ParsedMail } from "mailparser";
import { getSystemDb } from "@/lib/db";
import { StorageGateway } from "@/modules/core-storage/services/StorageGateway";

export class ImapSyncService {
  /**
   * Syncs emails for a given MailAccount.
   */
  static async syncAccount(accountId: string) {
    const db = getSystemDb();
    const account = await db.mailAccount.findUnique({
      where: { id: accountId }
    });

    if (!account) {
      throw new Error(`MailAccount ${accountId} not found`);
    }

    if (!account.imapHost || !account.imapUsername || !account.imapPassword) {
      throw new Error(`MailAccount ${accountId} missing IMAP credentials`);
    }

    const config = {
      imap: {
        user: account.imapUsername,
        password: account.imapPassword,
        host: account.imapHost,
        port: account.imapPort || 993,
        tls: account.imapPort === 993,
        authTimeout: 10000,
        tlsOptions: { rejectUnauthorized: false }
      }
    };

    let connection: ImapSimple | null = null;
    try {
      connection = await imap.connect(config);
      const boxes = await connection.getBoxes();
      
      const foldersToSync = [];
      for (const [key, value] of Object.entries(boxes)) {
        const attribs = value.attribs || [];
        const upperKey = key.toUpperCase();
        if (upperKey === 'INBOX' || upperKey.includes('INBOX')) {
          foldersToSync.push({ name: key, standard: 'inbox' });
        } else if (attribs.includes('\\Sent')) {
          foldersToSync.push({ name: key, standard: 'sent' });
        } else if (attribs.includes('\\Drafts')) {
          foldersToSync.push({ name: key, standard: 'draft' });
        } else if (attribs.includes('\\Trash')) {
          foldersToSync.push({ name: key, standard: 'trash' });
        } else if (attribs.includes('\\Junk')) {
          foldersToSync.push({ name: key, standard: 'spam' });
        } else if (attribs.includes('\\Archive')) {
          foldersToSync.push({ name: key, standard: 'archive' });
        }
      }
      
      let totalSyncedCount = 0;

      for (const folder of foldersToSync) {
        try {
          await connection.openBox(folder.name);

          // Sync emails from the last 30 days if this is the first sync, otherwise since the last email receivedAt
          const lastMessage = await db.mailMessage.findFirst({
            where: { mailAccountId: accountId, folder: { equals: folder.standard, mode: "insensitive" } },
            orderBy: { receivedAt: 'desc' }
          });

          let searchCriteria: any[] = [];
          if (lastMessage) {
            searchCriteria = [['SINCE', new Date(lastMessage.receivedAt)]];
            console.log(`[IMAP Sync - ${folder.standard}] Searching emails since:`, new Date(lastMessage.receivedAt));
          } else {
            // Lần đầu đồng bộ: Kéo TOÀN BỘ thư về
            searchCriteria = ['ALL'];
            console.log(`[IMAP Sync - ${folder.standard}] Searching ALL emails...`);
          }
          
          const fetchOptions = {
            bodies: ['HEADER', 'TEXT', ''],
            markSeen: false,
            struct: true
          };

          let messages = await connection.search(searchCriteria, fetchOptions);
          console.log(`[IMAP Sync - ${folder.standard}] Found ${messages.length} messages on server`);
          
          // Đảo ngược để lưu thư mới nhất vào DB trước (nếu bị timeout thì những thư mới nhất vẫn vào được)
          messages = messages.reverse();
          
          for (const msg of messages) {
            const isSynced = await this.saveMessage(account, msg, folder.standard);
            if (isSynced) totalSyncedCount++;
          }
        } catch (err) {
          console.error(`Error syncing folder ${folder.name}:`, err);
        }
      }
      
      return { success: true, syncedCount: totalSyncedCount };
    } catch (error: any) {
      console.error(`Error syncing IMAP for account ${accountId}:`, error);
      return { success: false, error: error.message };
    } finally {
      if (connection) {
        connection.end();
      }
    }
  }

  private static async saveMessage(account: any, msg: Message, folderName: string = 'inbox'): Promise<boolean> {
    try {
      const db = getSystemDb();
      const allParts = msg.parts.find(part => part.which === '');
      if (!allParts) return false;

      const parsed: ParsedMail = await simpleParser(allParts.body);
      
      const messageId = parsed.messageId || `${msg.attributes.uid}@local`;
      
      // Check if message already exists
      const existing = await db.mailMessage.findFirst({
        where: { messageId, mailAccountId: account.id }
      });
      
      if (existing) return false; // Already synced

      const fromEmail = parsed.from?.value[0]?.address || "unknown@ovc.vn";
      const fromName = parsed.from?.value[0]?.name || null;
      
      const to = parsed.to ? (Array.isArray(parsed.to) ? parsed.to.flatMap(t => t.value.map(v => v.address || '')) : parsed.to.value.map(v => v.address || '')) : [];
      const cc = parsed.cc ? (Array.isArray(parsed.cc) ? parsed.cc.flatMap(t => t.value.map(v => v.address || '')) : parsed.cc.value.map(v => v.address || '')) : [];
      const bcc = parsed.bcc ? (Array.isArray(parsed.bcc) ? parsed.bcc.flatMap(t => t.value.map(v => v.address || '')) : parsed.bcc.value.map(v => v.address || '')) : [];

      // Create MailThread if we don't have one
      const cleanSubject = (parsed.subject || "No Subject").replace(/^(Re|Fwd|Fw|Trả lời|Chuyển tiếp):\s*/i, '').trim();
      
      let thread = await db.mailThread.findFirst({
        where: {
          mailAccountId: account.id,
          subject: { contains: cleanSubject }
        }
      });

      if (!thread) {
        thread = await db.mailThread.create({
          data: {
            organizationId: account.organizationId,
            mailAccountId: account.id,
            subject: cleanSubject,
            snippet: parsed.text?.substring(0, 100) || "",
            lastMessageAt: parsed.date || new Date(),
            messageCount: 0
          }
        });
      }

      const createdMessage = await db.mailMessage.create({
        data: {
          organizationId: account.organizationId,
          mailAccountId: account.id,
          threadId: thread.id,
          messageId: messageId,
          folder: folderName,
          fromEmail,
          fromName,
          to,
          cc,
          bcc,
          subject: parsed.subject || "No Subject",
          bodyHtml: parsed.html || "",
          bodyText: parsed.text || "",
          isRead: false,
          receivedAt: parsed.date || new Date(),
          hasAttachments: parsed.attachments && parsed.attachments.length > 0
        }
      });

      if (parsed.attachments && parsed.attachments.length > 0) {
        for (const att of parsed.attachments) {
          const fileName = att.filename || `attachment-${Date.now()}`;
          const mimeType = att.contentType || "application/octet-stream";
          
          try {
            // Upload to Storage Center
            const storageFile = await StorageGateway.upload(
              att.content,
              fileName,
              mimeType,
              "MAIL_ATTACHMENT", // category
              "MAIL", // module
              account.organizationId,
              createdMessage.id
            );
            
            await db.mailAttachment.create({
              data: {
                messageId: createdMessage.id,
                fileName: fileName,
                mimeType: mimeType,
                size: att.size,
                fileUrl: `/api/storage/download?fileId=${storageFile.id}`
              }
            });
          } catch (err) {
            console.error(`Failed to upload attachment ${fileName} to Storage Center:`, err);
            // Ignore error so it doesn't crash the whole sync if storage is not configured properly
          }
        }
      }

      // Update thread
      await db.mailThread.update({
        where: { id: thread.id },
        data: {
          messageCount: { increment: 1 },
          lastMessageAt: parsed.date || new Date(),
          snippet: parsed.text?.substring(0, 100) || ""
        }
      });

      return true;
    } catch (e) {
      console.error("Error parsing/saving message:", e);
      return false;
    }
  }
}
