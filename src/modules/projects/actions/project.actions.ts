"use server";

import { ProjectService } from "../services/project.service";

export async function getProjects(...args: Parameters<typeof ProjectService.getProjects>): Promise<ReturnType<typeof ProjectService.getProjects>> {
  return ProjectService.getProjects(...args);
}

export async function getProjectTasksDashboard(...args: Parameters<typeof ProjectService.getProjectTasksDashboard>): Promise<ReturnType<typeof ProjectService.getProjectTasksDashboard>> {
  return ProjectService.getProjectTasksDashboard(...args);
}

export async function getProjectById(...args: Parameters<typeof ProjectService.getProjectById>): Promise<ReturnType<typeof ProjectService.getProjectById>> {
  return ProjectService.getProjectById(...args);
}

export async function uploadProjectThumbnail(...args: Parameters<typeof ProjectService.uploadProjectThumbnail>): Promise<ReturnType<typeof ProjectService.uploadProjectThumbnail>> {
  return ProjectService.uploadProjectThumbnail(...args);
}

export async function createProject(...args: Parameters<typeof ProjectService.createProject>): Promise<ReturnType<typeof ProjectService.createProject>> {
  return ProjectService.createProject(...args);
}

export async function updateProject(...args: Parameters<typeof ProjectService.updateProject>): Promise<ReturnType<typeof ProjectService.updateProject>> {
  return ProjectService.updateProject(...args);
}

export async function addProjectMember(...args: Parameters<typeof ProjectService.addProjectMember>): Promise<ReturnType<typeof ProjectService.addProjectMember>> {
  return ProjectService.addProjectMember(...args);
}

export async function updateProjectOwner(...args: Parameters<typeof ProjectService.updateProjectOwner>): Promise<ReturnType<typeof ProjectService.updateProjectOwner>> {
  return ProjectService.updateProjectOwner(...args);
}

export async function removeProjectMember(...args: Parameters<typeof ProjectService.removeProjectMember>): Promise<ReturnType<typeof ProjectService.removeProjectMember>> {
  return ProjectService.removeProjectMember(...args);
}

export async function updateProjectFacebookAds(...args: Parameters<typeof ProjectService.updateProjectFacebookAds>): Promise<ReturnType<typeof ProjectService.updateProjectFacebookAds>> {
  return ProjectService.updateProjectFacebookAds(...args);
}

export async function updateProjectSocialReportSetup(...args: Parameters<typeof ProjectService.updateProjectSocialReportSetup>): Promise<ReturnType<typeof ProjectService.updateProjectSocialReportSetup>> {
  return ProjectService.updateProjectSocialReportSetup(...args);
}

export async function createTask(...args: Parameters<typeof ProjectService.createTask>): Promise<ReturnType<typeof ProjectService.createTask>> {
  return ProjectService.createTask(...args);
}

export async function updateTaskDetails(...args: Parameters<typeof ProjectService.updateTaskDetails>): Promise<ReturnType<typeof ProjectService.updateTaskDetails>> {
  return ProjectService.updateTaskDetails(...args);
}

export async function updateTaskStatus(...args: Parameters<typeof ProjectService.updateTaskStatus>): Promise<ReturnType<typeof ProjectService.updateTaskStatus>> {
  return ProjectService.updateTaskStatus(...args);
}

export async function createTaskList(...args: Parameters<typeof ProjectService.createTaskList>): Promise<ReturnType<typeof ProjectService.createTaskList>> {
  return ProjectService.createTaskList(...args);
}

export async function updateTaskList(...args: Parameters<typeof ProjectService.updateTaskList>): Promise<ReturnType<typeof ProjectService.updateTaskList>> {
  return ProjectService.updateTaskList(...args);
}

export async function deleteTaskList(...args: Parameters<typeof ProjectService.deleteTaskList>): Promise<ReturnType<typeof ProjectService.deleteTaskList>> {
  return ProjectService.deleteTaskList(...args);
}

export async function updateTaskColumn(...args: Parameters<typeof ProjectService.updateTaskColumn>): Promise<ReturnType<typeof ProjectService.updateTaskColumn>> {
  return ProjectService.updateTaskColumn(...args);
}

export async function generateProjectShareToken(...args: Parameters<typeof ProjectService.generateProjectShareToken>): Promise<ReturnType<typeof ProjectService.generateProjectShareToken>> {
  return ProjectService.generateProjectShareToken(...args);
}

export async function revokeProjectShareToken(...args: Parameters<typeof ProjectService.revokeProjectShareToken>): Promise<ReturnType<typeof ProjectService.revokeProjectShareToken>> {
  return ProjectService.revokeProjectShareToken(...args);
}

export async function getPublicProjectByShareToken(...args: Parameters<typeof ProjectService.getPublicProjectByShareToken>): Promise<ReturnType<typeof ProjectService.getPublicProjectByShareToken>> {
  return ProjectService.getPublicProjectByShareToken(...args);
}

export async function publicAddComment(...args: Parameters<typeof ProjectService.publicAddComment>): Promise<ReturnType<typeof ProjectService.publicAddComment>> {
  return ProjectService.publicAddComment(...args);
}

export async function addTaskComment(...args: Parameters<typeof ProjectService.addTaskComment>): Promise<ReturnType<typeof ProjectService.addTaskComment>> {
  return ProjectService.addTaskComment(...args);
}

export async function publicUpdateTaskStatus(...args: Parameters<typeof ProjectService.publicUpdateTaskStatus>): Promise<ReturnType<typeof ProjectService.publicUpdateTaskStatus>> {
  return ProjectService.publicUpdateTaskStatus(...args);
}

export async function publicUpdateTaskColumn(...args: Parameters<typeof ProjectService.publicUpdateTaskColumn>): Promise<ReturnType<typeof ProjectService.publicUpdateTaskColumn>> {
  return ProjectService.publicUpdateTaskColumn(...args);
}

export async function publicApproveContentPlan(...args: Parameters<typeof ProjectService.publicApproveContentPlan>): Promise<ReturnType<typeof ProjectService.publicApproveContentPlan>> {
  return ProjectService.publicApproveContentPlan(...args);
}

