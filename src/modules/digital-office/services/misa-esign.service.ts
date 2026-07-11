type MisaESignConfig = {
  baseUrl?: string;
  clientId: string;
  clientKey: string;
};

type MisaLoginInput = MisaESignConfig & {
  userName: string;
  password: string;
};

type MisaLoginResponse = {
  status?: {
    code?: number;
    error?: boolean;
    errorCode?: number | string;
    message?: string;
    userMsg?: string;
    devMsg?: string;
  };
  data?: {
    remoteSigningAccessToken?: string;
    tokenType?: string;
    refreshToken?: string;
    expiresIn?: number;
    user?: {
      id?: string;
      email?: string;
      phoneNumber?: string;
      username?: string;
    };
  };
  error?: string;
  errorCode?: string | number;
  userMsg?: string;
  devMsg?: string;
};

type MisaCertificate = {
  userId?: string;
  keyAlias?: string;
  appName?: string;
  keyStatus?: string;
  certStatus?: string;
  effectiveDate?: string;
  expirationDate?: string;
  emailName?: string;
  isAutoSign?: boolean;
  certificate?: string;
  certiticateChain?: string[];
};

export type SafeMisaCertificate = Omit<MisaCertificate, "certificate" | "certiticateChain"> & {
  hasCertificate: boolean;
  chainLength: number;
};

export type MisaESignConnectResult = {
  success: boolean;
  requiresOtp?: boolean;
  message?: string;
  tokenExpiresIn?: number;
  user?: {
    id?: string;
    email?: string;
    phoneNumber?: string;
    username?: string;
  };
  certificates?: SafeMisaCertificate[];
};

function endpoint(baseUrl: string | undefined, path: string) {
  const root = (baseUrl || process.env.MISA_ESIGN_BASE_URL || "https://esignapp.misa.vn").replace(/\/$/, "");
  return `${root}/${path.replace(/^\//, "")}`;
}

function getMisaMessage(data: MisaLoginResponse) {
  return data.userMsg || data.error || data.status?.userMsg || data.status?.message || data.status?.devMsg || "MISA eSign request failed";
}

function getToken(data: MisaLoginResponse) {
  const token = data.data?.remoteSigningAccessToken;
  if (!token) return null;
  return `${data.data?.tokenType || "Bearer"} ${token}`;
}

function safeCertificate(cert: MisaCertificate): SafeMisaCertificate {
  return {
    userId: cert.userId,
    keyAlias: cert.keyAlias,
    appName: cert.appName,
    keyStatus: cert.keyStatus,
    certStatus: cert.certStatus,
    effectiveDate: cert.effectiveDate,
    expirationDate: cert.expirationDate,
    emailName: cert.emailName,
    isAutoSign: cert.isAutoSign,
    hasCertificate: Boolean(cert.certificate),
    chainLength: cert.certiticateChain?.length ?? 0,
  };
}

export class MisaESignService {
  static async connect(input: MisaLoginInput): Promise<MisaESignConnectResult> {
    if (!input.userName || !input.password) {
      return { success: false, message: "Thiếu user hoặc password MISA eSign." };
    }

    if (!input.clientId || !input.clientKey) {
      return { success: false, message: "Thiếu clientId/clientKey Open API của MISA." };
    }

    const loginResponse = await fetch(endpoint(input.baseUrl, "/api/auth/api/v1/auth/login-api"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-clientId": input.clientId,
        "x-clientKey": input.clientKey,
      },
      body: JSON.stringify({
        userName: input.userName,
        password: input.password,
      }),
    });

    const loginData = (await loginResponse.json().catch(() => null)) as MisaLoginResponse | null;
    if (!loginResponse.ok || !loginData) {
      return { success: false, message: loginData ? getMisaMessage(loginData) : `MISA login HTTP ${loginResponse.status}` };
    }

    const errorCode = loginData.status?.errorCode ?? loginData.errorCode;
    if (String(errorCode) === "122") {
      return { success: false, requiresOtp: true, message: getMisaMessage(loginData) };
    }

    const token = getToken(loginData);
    if (!token) {
      return { success: false, message: getMisaMessage(loginData) };
    }

    const certificatesResponse = await fetch(endpoint(input.baseUrl, "/external/esrm/service/general/api/v1/Certificates/by-userId"), {
      method: "GET",
      headers: {
        "x-clientId": input.clientId,
        "x-clientKey": input.clientKey,
        AuthorizationRM: token,
      },
    });

    const certificatesData = (await certificatesResponse.json().catch(() => null)) as MisaCertificate[] | { error?: string; userMsg?: string } | null;
    if (!certificatesResponse.ok || !Array.isArray(certificatesData)) {
      const message = certificatesData && !Array.isArray(certificatesData)
        ? certificatesData.userMsg || certificatesData.error
        : `MISA certificates HTTP ${certificatesResponse.status}`;
      return { success: false, message };
    }

    return {
      success: true,
      tokenExpiresIn: loginData.data?.expiresIn,
      user: loginData.data?.user,
      certificates: certificatesData.map(safeCertificate),
    };
  }
}
