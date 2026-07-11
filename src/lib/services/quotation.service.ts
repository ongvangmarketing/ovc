import { getTenantDb } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { randomBytes } from "crypto";

export class QuotationService {
  /**
   * Tạo báo giá mới
   */
  static async createQuotation(data: {
    organizationId: string;
    title: string;
    contactId?: string;
    dealId?: string;
    creatorId: string;
    notes?: string;
  }) {
    // Generate a secure random token for public access
    const token = randomBytes(24).toString('hex');
    
    // Generate a sequential number BG-YYYY-MM-001
    const date = new Date();
    const prefix = `BG-${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    
    // Count existing to generate next number (Simple sequence)
    const count = await getTenantDb().quotation.count({
      where: {
        organizationId: data.organizationId,
        number: { startsWith: prefix }
      }
    });
    
    const number = `${prefix}-${(count + 1).toString().padStart(3, '0')}`;

    return getTenantDb().quotation.create({
      data: {
        organizationId: data.organizationId,
        number,
        title: data.title,
        status: "DRAFT",
        contactId: data.contactId,
        dealId: data.dealId,
        creatorId: data.creatorId,
        notes: data.notes,
        token,
        subtotal: 0,
        total: 0,
        validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // Default 14 days validity
      }
    });
  }

  /**
   * Tính toán lại tổng tiền của Báo giá
   */
  static async recalculateQuotation(quotationId: string) {
    const items = await getTenantDb().quotationItem.findMany({
      where: { quotationId }
    });

    const quotation = await getTenantDb().quotation.findUnique({
      where: { id: quotationId }
    });

    if (!quotation) return;

    let subtotal = new Prisma.Decimal(0);
    
    items.forEach(item => {
      subtotal = subtotal.add(item.total);
    });

    let total = subtotal;
    
    // Apply Quotation level discount
    if (quotation.discountType === 'percent') {
      const discountAmount = subtotal.mul(quotation.discount).div(100);
      total = total.sub(discountAmount);
    } else {
      total = total.sub(quotation.discount);
    }

    // Apply VAT
    if (quotation.taxRate.greaterThan(0)) {
      const taxAmount = total.mul(quotation.taxRate).div(100);
      total = total.add(taxAmount);
    }

    return getTenantDb().quotation.update({
      where: { id: quotationId },
      data: {
        subtotal,
        total,
      }
    });
  }

  /**
   * Thêm hạng mục vào Báo giá
   */
  static async addItem(quotationId: string, data: {
    name: string;
    description?: string;
    quantity: number;
    unitPrice: number;
  }) {
    const quantity = new Prisma.Decimal(data.quantity);
    const unitPrice = new Prisma.Decimal(data.unitPrice);
    const total = quantity.mul(unitPrice);

    await getTenantDb().quotationItem.create({
      data: {
        quotationId,
        name: data.name,
        description: data.description,
        quantity,
        unitPrice,
        total,
      }
    });

    return this.recalculateQuotation(quotationId);
  }

  /**
   * Cập nhật hạng mục
   */
  static async removeItem(itemId: string) {
    const item = await getTenantDb().quotationItem.delete({
      where: { id: itemId }
    });
    return this.recalculateQuotation(item.quotationId);
  }

  /**
   * Gửi Báo giá cho khách hàng
   */
  static async sendQuotation(quotationId: string) {
    return getTenantDb().quotation.update({
      where: { id: quotationId },
      data: { 
        status: "SENT",
        sentAt: new Date()
      }
    });
  }
}
