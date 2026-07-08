function removeAccents(str: string) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D");
}

export type PaymentChannelKey = string;

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

// Legacy fallback
export const paymentChannels: Record<string, PaymentChannel> = {
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

export function getDynamicPaymentChannels(paymentMethodsJson: string | undefined | null): PaymentChannel[] {
  if (!paymentMethodsJson) return paymentChannelOptions;
  
  try {
    const methods = JSON.parse(paymentMethodsJson);
    if (!Array.isArray(methods) || methods.length === 0) return paymentChannelOptions;
    
    return methods.map(m => {
      // Find BIN from bank_name (e.g., if bank_name is "Vietcombank", we need "VCB", but if not available we can just use short name or a mapping)
      // For VietQR, bankBin is usually the short name or BIN number. 
      // In the settings form, bank_name is usually the shortName (e.g. "Techcombank", "Vietcombank", "MB").
      // We will just use the bank_name directly as bankBin, VietQR often accepts short names.
      const bankBin = m.bank_name?.split(" ")[0] || "TCB"; 
      
      return {
        key: m.id,
        label: `Kênh thanh toán ${m.type || "Khác"}`,
        optionLabel: `${m.type || "Khác"} - ${m.bank_name} ${m.account_number}`,
        accountName: m.account_name,
        qrAccountName: removeAccents(m.account_name || "").toUpperCase(),
        accountNumber: m.account_number,
        bankName: m.bank_name,
        bankBin: bankBin,
      };
    });
  } catch {
    return paymentChannelOptions;
  }
}

export function normalizePaymentChannelKeys(value: unknown, availableChannels?: PaymentChannel[]): PaymentChannelKey[] {
  const channels = availableChannels || paymentChannelOptions;
  const defaultKey = channels[0]?.key || "company";
  
  if (!value) return [defaultKey];
  
  if (Array.isArray(value)) {
    const keys = value.filter(item => typeof item === "string");
    return keys.length ? keys : [defaultKey];
  }
  
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return normalizePaymentChannelKeys(parsed, availableChannels);
    } catch {
      return [value];
    }
  }
  
  return [defaultKey];
}

export function getPaymentChannel(key: string | null | undefined, availableChannels?: PaymentChannel[]): PaymentChannel {
  const channels = availableChannels || paymentChannelOptions;
  const found = channels.find(c => c.key === key);
  return found || channels[0] || (paymentChannels.company as PaymentChannel);
}

export function getVietQrUrl(key: string | null | undefined, amount?: number | null, content?: string | null, availableChannels?: PaymentChannel[]) {
  const channel = getPaymentChannel(key, availableChannels);
  const query = new URLSearchParams({ accountName: channel.qrAccountName });
  if (amount && amount > 0) query.set("amount", String(Math.round(amount)));
  if (content) query.set("addInfo", content);
  return `https://img.vietqr.io/image/${channel.bankBin}-${channel.accountNumber}-compact2.png?${query.toString()}`;
}
