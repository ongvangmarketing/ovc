export type PaymentChannelKey = "company" | "personal";

export type PaymentChannel = {
  key: PaymentChannelKey;
  label: string;
  optionLabel: string;
  accountName: string;
  qrAccountName: string;
  accountNumber: string;
  bankName: string;
  bankBin: string;
};

export const paymentChannels: Record<PaymentChannelKey, PaymentChannel> = {
  company: {
    key: "company",
    label: "Kênh thanh toán Công ty",
    optionLabel: "Công ty - Techcombank 11881189",
    accountName: "Công ty TNHH Truyền thông Đào tạo Du lịch Ong Vàng",
    qrAccountName: "CONG TY TNHH TRUYEN THONG DAO TAO DU LICH ONG VANG",
    accountNumber: "11881189",
    bankName: "Techcombank Bình Thuận",
    bankBin: "TCB",
  },
  personal: {
    key: "personal",
    label: "Kênh thanh toán Cá nhân",
    optionLabel: "Cá nhân - Techcombank 6868686099",
    accountName: "Trần Anh Trung",
    qrAccountName: "TRAN ANH TRUNG",
    accountNumber: "6868686099",
    bankName: "Techcombank Bình Thuận",
    bankBin: "TCB",
  },
};

export const paymentChannelOptions = Object.values(paymentChannels);

export function normalizePaymentChannelKeys(value: unknown): PaymentChannelKey[] {
  if (!value) return ["company"];
  if (Array.isArray(value)) {
    const keys = value.filter((item): item is PaymentChannelKey => item === "company" || item === "personal");
    return keys.length ? keys : ["company"];
  }
  if (typeof value === "string") {
    try {
      return normalizePaymentChannelKeys(JSON.parse(value));
    } catch {
      return value === "personal" ? ["personal"] : ["company"];
    }
  }
  return ["company"];
}

export function getPaymentChannel(key: string | null | undefined) {
  return key === "personal" ? paymentChannels.personal : paymentChannels.company;
}

export function getVietQrUrl(key: string | null | undefined, amount?: number | null, content?: string | null) {
  const channel = getPaymentChannel(key);
  const query = new URLSearchParams({ accountName: channel.qrAccountName });
  if (amount && amount > 0) query.set("amount", String(Math.round(amount)));
  if (content) query.set("addInfo", content);
  return `https://img.vietqr.io/image/${channel.bankBin}-${channel.accountNumber}-compact2.png?${query.toString()}`;
}
