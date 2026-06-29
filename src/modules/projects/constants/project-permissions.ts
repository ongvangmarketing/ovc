export const PROJECT_PERMISSIONS = {
  READ: "projects.read",
  CREATE: "projects.create",
  UPDATE: "projects.update",
  DELETE: "projects.delete",
  MANAGE_MEMBERS: "projects.manage_members",
  MANAGE_TASKS: "projects.manage_tasks",
  MANAGE_FILES: "projects.manage_files",
  MANAGE_DATABASE: "projects.manage_database",
  SHARE_PUBLIC: "projects.share_public",
  GUEST_EDIT: "projects.guest_edit",
  MANAGE_SETTINGS: "projects.manage_settings",
} as const;

export type ProjectPermission = typeof PROJECT_PERMISSIONS[keyof typeof PROJECT_PERMISSIONS];
