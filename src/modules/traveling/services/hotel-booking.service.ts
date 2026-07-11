import { getTenantDb } from "@/lib/db";
import { Prisma } from "@prisma/client";

export class HotelBookingService {
  // --- PUBLIC / FRONTEND ---
  static async getPublicBookingInventory(hotelId: string, startDateStr: string, endDateStr: string) {
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);

    return getTenantDb().roomInventory.findMany({
      where: {
        roomType: { hotelId },
        date: {
          gte: start,
          lt: end, // checkout date doesn't need inventory
        }
      },
      select: {
        roomTypeId: true,
        date: true,
        price: true,
        availableRooms: true,
        isClosed: true,
        minStay: true,
        maxStay: true,
        closedToArrival: true,
        closedToDeparture: true,
      }
    });
  }

  static async createPublicBooking(data: {
    hotelId: string;
    roomTypeId: string;
    checkIn: string;
    checkOut: string;
    totalPrice: number;
    guestName: string;
    guestEmail: string;
    guestPhone: string;
    specialRequest: string;
  }) {
    const start = new Date(data.checkIn);
    const end = new Date(data.checkOut);

    // Get hotel to know organizationId
    const hotel = await getTenantDb().hotel.findUnique({
      where: { id: data.hotelId },
      include: { organization: true }
    });
    if (!hotel) throw new Error("Hotel not found");

    // 1. Validate inventory again to prevent double booking
    const inventory = await getTenantDb().roomInventory.findMany({
      where: {
        roomTypeId: data.roomTypeId,
        date: { gte: start, lt: end }
      }
    });

    let current = new Date(start);
    while (current < end) {
      const dateStr = current.toISOString().split('T')[0] ?? "";
      const dayInv = inventory.find(inv => inv.date.toISOString().startsWith(dateStr));
      
      if (dayInv && (dayInv.isClosed || dayInv.availableRooms <= 0)) {
        throw new Error("Rất tiếc, phòng đã hết trống vào ngày " + current.toLocaleDateString('vi-VN'));
      }
      current.setDate(current.getDate() + 1);
    }

    const shortId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const datePrefix = (new Date().toISOString().split('T')[0] ?? "").replace(/-/g, '').substring(2); // e.g. 260708
    const bookingCode = `BK-${datePrefix}-${shortId}`;

    await getTenantDb().$transaction(async (tx) => {
      // 2. CRM: Find or create Contact
      let contact = await tx.contact.findFirst({
        where: {
          organizationId: hotel.organizationId,
          email: data.guestEmail,
        }
      });
      if (!contact && data.guestPhone) {
        contact = await tx.contact.findFirst({
          where: {
            organizationId: hotel.organizationId,
            phone: data.guestPhone,
          }
        });
      }

      if (!contact) {
        contact = await tx.contact.create({
          data: {
            organizationId: hotel.organizationId,
            firstName: data.guestName.split(' ').slice(0, -1).join(' ') || data.guestName,
            lastName: data.guestName.split(' ').slice(-1).join(' '),
            email: data.guestEmail,
            phone: data.guestPhone,
            type: "CUSTOMER", // Type string for ContactType
            status: "ACTIVE"
          }
        });
      }

      // 3. Finance: Create Invoice
      const invoice = await tx.invoice.create({
        data: {
          organizationId: hotel.organizationId,
          number: bookingCode, // Use the same BK code for invoice number
          title: `Đặt phòng khách sạn ${hotel.name}`,
          status: "DRAFT",
          contactId: contact.id,
          creatorId: hotel.organization.ownerId,
          subtotal: data.totalPrice,
          total: data.totalPrice,
          amountDue: data.totalPrice,
          dueDate: start, // Due date is check-in date
          notes: `Tự động tạo từ Landing Page Đặt phòng. Mã: ${bookingCode}`
        }
      });

      // 4. Create Booking
      await tx.hotelBooking.create({
        data: {
          bookingCode,
          hotelId: data.hotelId,
          roomTypeId: data.roomTypeId,
          checkIn: start,
          checkOut: end,
          totalAmount: data.totalPrice,
          guestName: data.guestName,
          guestEmail: data.guestEmail,
          guestPhone: data.guestPhone,
          specialRequest: data.specialRequest,
          status: "PENDING",
          contactId: contact.id,
          invoiceId: invoice.id
        }
      });

      // 5. Decrement inventory
      let curr = new Date(start);
      while (curr < end) {
        const dateStr = curr.toISOString().split('T')[0] ?? "";
        const dayInv = inventory.find(inv => inv.date.toISOString().startsWith(dateStr));
        
        if (dayInv) {
          await tx.roomInventory.update({
            where: { id: dayInv.id },
            data: { availableRooms: { decrement: 1 } }
          });
        }
        curr.setDate(curr.getDate() + 1);
      }
    });

    return bookingCode;
  }

  static async getHotelBookings(orgId: string, hotelId: string) {
    const hotel = await getTenantDb().hotel.findUnique({
      where: { id: hotelId, organizationId: orgId },
    });

    if (!hotel) return null;

    return getTenantDb().hotelBooking.findMany({
      where: { hotelId },
      include: {
        roomType: true,
        invoice: true,
        contact: true,
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async updateBookingStatus(
    orgId: string,
    hotelId: string,
    bookingId: string,
    status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED",
    note?: string
  ) {
    const hotel = await getTenantDb().hotel.findUnique({
      where: { id: hotelId, organizationId: orgId }
    });
    
    if (!hotel) throw new Error("Unauthorized");

    await getTenantDb().hotelBooking.update({
      where: { id: bookingId, hotelId },
      data: {
        status,
        ...(note && { specialRequest: note })
      }
    });

    return { success: true };
  }
}
