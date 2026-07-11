export type DigitalOfficeView = "overview" | "documents" | "approvals" | "requests" | "signatures" | "settings";

export type OfficeDocumentStatus =
  | "Draft"
  | "Submitted"
  | "Reviewing"
  | "Approved"
  | "Signing"
  | "Signed"
  | "Archived";

export type OfficeDocument = {
  id: string;
  code: string;
  title: string;
  type: string;
  owner: string;
  department: string;
  status: OfficeDocumentStatus;
  dueAt: string;
  source: string;
};

export type OfficeApproval = {
  id: string;
  title: string;
  requester: string;
  step: string;
  priority: "Low" | "Medium" | "High";
  dueAt: string;
};

export type OfficeWorkRequest = {
  id: string;
  title: string;
  assignee: string;
  status: "New" | "Assigned" | "InProgress" | "WaitingApproval" | "Done";
  dueAt: string;
};

export type OfficeSignature = {
  id: string;
  document: string;
  signer: string;
  provider: "MISA eSign";
  status: "Pending" | "WaitingUserConfirm" | "Success" | "Failed";
};
