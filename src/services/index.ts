export type { ApiResult } from './helpers';

export type { Profile } from './profile.service';
export { getProfile, upsertProfile } from './profile.service';

export type { About } from './about.service';
export { getAbout, upsertAbout, deleteAbout } from './about.service';

export type { Skill } from './skills.service';
export { getSkills, upsertSkill, deleteSkill } from './skills.service';

export type { Education } from './education.service';
export { getEducation, upsertEducation, deleteEducation } from './education.service';

export type { Internship } from './internships.service';
export { getInternships, upsertInternship, deleteInternship } from './internships.service';

export type { Project } from './projects.service';
export { getProjects, upsertProject, deleteProject } from './projects.service';

export type { Certification } from './certifications.service';
export { getCertifications, upsertCertification, deleteCertification } from './certifications.service';

export type { Journey } from './journey.service';
export { getJourney, upsertJourneyEntry, deleteJourneyEntry } from './journey.service';

export type { ContactInfo } from './contact.service';
export { getContactInfo, upsertContactInfo } from './contact.service';

export type { SiteSettings } from './settings.service';
export { getSiteSettings, upsertSiteSettings } from './settings.service';

export { logAuditAction } from './audit.service';

export type { Notification } from './notifications.service';
export {
  createNotification,
  getNotifications,
  getUnreadNotificationCount,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotificationById,
  deleteAllNotifications,
  syncMissingNotifications,
} from './notifications.service';
