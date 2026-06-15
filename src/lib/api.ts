import { supabase } from './supabase';
import type { PostgrestError } from '@supabase/supabase-js';

// ============================================================
// Types
// ============================================================

export interface Profile {
  id: string;
  name: string;
  title: string;
  subtitle: string | null;
  location: string;
  email: string;
  linkedin: string;
  github: string;
  portfolio_url: string | null;
  profile_photo_url: string | null;
  resume_url: string | null;
}

export interface About {
  id: string;
  title: string;
  subtitle: string | null;
  paragraphs: string[];
  display_order: number;
}

export interface Skill {
  id: string;
  category: string;
  skills: string[];
  gradient: string;
  display_order: number;
}

export interface Internship {
  id: string;
  organization: string;
  department: string | null;
  role: string;
  duration: string | null;
  location: string | null;
  type: string;
  description: string[];
  responsibilities: string[];
  learnings: string[];
  impact: string[];
  certificate_url: string | null;
  completed: boolean;
  display_order: number;
}

export interface Education {
  id: string;
  degree: string;
  field: string | null;
  institution: string;
  period: string | null;
  location: string | null;
  gpa: string | null;
  status: string | null;
  current: boolean;
  description: string | null;
  display_order: number;
}

export interface Certification {
  id: string;
  title: string;
  organization: string;
  platform: string | null;
  issue_date: string | null;
  credential_id: string | null;
  certificate_url: string | null;
  embed_url: string | null;
  description: string | null;
  category: string | null;
  skills: string[];
  status: string;
  display_order: number;
  logo_url: string | null;
}

export interface Journey {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  date: string | null;
  type: string;
  icon: string;
  display_order: number;
}

export interface ContactInfo {
  id: string;
  email: string;
  github: string;
  linkedin: string;
  location: string;
  portfolio_url: string | null;
  phone: string | null;
}

export interface Project {
  id: string;
  name: string;
  type: string;
  status: string;
  completed_date: string | null;
  description: string | null;
  highlights: string[];
  technologies: string[];
  report_url: string | null;
  image_url: string | null;
  github_url: string | null;
  demo_url: string | null;
  featured: boolean;
  display_order: number;
}

export interface SiteSettings {
  id: string;
  site_title: string;
  favicon_url: string | null;
  seo_description: string | null;
  seo_keywords: string | null;
  theme: string;
}

// ============================================================
// Generic helpers
// ============================================================

type ApiResult<T> = { data: T | null; error: PostgrestError | null };

async function getSingle<T>(table: string): Promise<ApiResult<T>> {
  const { data, error } = await supabase.from(table).select('*').limit(1).maybeSingle();
  return { data: data as T | null, error };
}

async function getAll<T>(table: string, order?: string): Promise<ApiResult<T[]>> {
  let query = supabase.from(table).select('*');
  if (order) query = query.order(order, { ascending: true });
  const { data, error } = await query;
  return { data: data as T[] | null, error };
}

async function upsert<T>(table: string, record: Partial<T>): Promise<ApiResult<T>> {
  const { data, error } = await supabase.from(table).upsert(record).select().maybeSingle();
  return { data: data as T | null, error };
}

async function remove(table: string, id: string): Promise<{ error: PostgrestError | null }> {
  const { error } = await supabase.from(table).delete().eq('id', id);
  return { error };
}

// ============================================================
// Profile
// ============================================================

export async function getProfile() {
  return getSingle<Profile>('profile');
}

export async function upsertProfile(profile: Partial<Profile>) {
  return upsert<Profile>('profile', profile);
}

// ============================================================
// About
// ============================================================

export async function getAbout() {
  return getAll<About>('about', 'display_order');
}

export async function upsertAbout(about: Partial<About>) {
  return upsert<About>('about', about);
}

export async function deleteAbout(id: string) {
  return remove('about', id);
}

// ============================================================
// Skills
// ============================================================

export async function getSkills() {
  return getAll<Skill>('skills', 'display_order');
}

export async function upsertSkill(skill: Partial<Skill>) {
  return upsert<Skill>('skills', skill);
}

export async function deleteSkill(id: string) {
  return remove('skills', id);
}

// ============================================================
// Internships
// ============================================================

export async function getInternships() {
  return getAll<Internship>('internships', 'display_order');
}

export async function upsertInternship(internship: Partial<Internship>) {
  return upsert<Internship>('internships', internship);
}

export async function deleteInternship(id: string) {
  return remove('internships', id);
}

// ============================================================
// Education
// ============================================================

export async function getEducation() {
  return getAll<Education>('education', 'display_order');
}

export async function upsertEducation(edu: Partial<Education>) {
  return upsert<Education>('education', edu);
}

export async function deleteEducation(id: string) {
  return remove('education', id);
}

// ============================================================
// Certifications
// ============================================================

export async function getCertifications() {
  return getAll<Certification>('certifications', 'display_order');
}

export async function upsertCertification(cert: Partial<Certification>) {
  return upsert<Certification>('certifications', cert);
}

export async function deleteCertification(id: string) {
  return remove('certifications', id);
}

// ============================================================
// Journey
// ============================================================

export async function getJourney() {
  return getAll<Journey>('journey', 'display_order');
}

export async function upsertJourneyEntry(entry: Partial<Journey>) {
  return upsert<Journey>('journey', entry);
}

export async function deleteJourneyEntry(id: string) {
  return remove('journey', id);
}

// ============================================================
// Contact Info
// ============================================================

export async function getContactInfo() {
  return getSingle<ContactInfo>('contact_info');
}

export async function upsertContactInfo(contact: Partial<ContactInfo>) {
  return upsert<ContactInfo>('contact_info', contact);
}

// ============================================================
// Projects
// ============================================================

export async function getProjects() {
  return getAll<Project>('projects', 'display_order');
}

// ============================================================
// Site Settings
// ============================================================

export async function getSiteSettings() {
  return getSingle<SiteSettings>('site_settings');
}

export async function upsertSiteSettings(settings: Partial<SiteSettings>) {
  return upsert<SiteSettings>('site_settings', settings);
}
