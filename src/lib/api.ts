export type { ApiResult } from '../services';

export type { Profile } from '../services';
export { getProfile, upsertProfile } from '../services';

export type { About } from '../services';
export { getAbout, upsertAbout, deleteAbout } from '../services';

export type { Skill } from '../services';
export { getSkills, upsertSkill, deleteSkill } from '../services';

export type { Education } from '../services';
export { getEducation, upsertEducation, deleteEducation } from '../services';

export type { Internship } from '../services';
export { getInternships, upsertInternship, deleteInternship } from '../services';

export type { Project } from '../services';
export { getProjects, upsertProject, deleteProject } from '../services';

export type { Certification } from '../services';
export { getCertifications, upsertCertification, deleteCertification } from '../services';

export type { Journey } from '../services';
export { getJourney, upsertJourneyEntry, deleteJourneyEntry } from '../services';

export { logAuditAction } from '../services';

export type { ContactInfo } from '../services';
export { getContactInfo, upsertContactInfo } from '../services';

export type { SiteSettings } from '../services';
export { getSiteSettings, upsertSiteSettings } from '../services';

export type { Notification } from '../services';
export {
  createNotification,
  getNotifications,
  getUnreadNotificationCount,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotificationById,
  deleteAllNotifications,
  syncMissingNotifications,
} from '../services';
