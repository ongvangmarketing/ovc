export const PROJECT_EVENTS = {
  PROJECT_CREATED: "project.created",
  PROJECT_UPDATED: "project.updated",
  PROJECT_DELETED: "project.deleted",
  MEMBER_ADDED: "project.member_added",
  MEMBER_REMOVED: "project.member_removed",
  TASK_CREATED: "project.task_created",
  TASK_UPDATED: "project.task_updated",
  TASK_STATUS_CHANGED: "project.task_status_changed",
  TASK_COMPLETED: "project.task_completed",
  FILE_UPLOADED: "project.file_uploaded",
  DATABASE_CREATED: "project_database.created",
  DATABASE_UPDATED: "project_database.updated",
  DATABASE_RECORD_CREATED: "project_database.record_created",
  DATABASE_RECORD_UPDATED: "project_database.record_updated",
  DATABASE_SHARE_CREATED: "project_database.share_created",
  DATABASE_PUBLIC_EDITED: "project_database.public_edited",
} as const;

export type ProjectEventName = typeof PROJECT_EVENTS[keyof typeof PROJECT_EVENTS];
