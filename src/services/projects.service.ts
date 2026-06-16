import { getAll, upsert, remove } from './helpers';
import type { ApiResult } from './helpers';

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

export async function getProjects(): Promise<ApiResult<Project[]>> {
  return getAll<Project>('projects', 'display_order');
}

export async function upsertProject(project: Partial<Project>): Promise<ApiResult<Project>> {
  return upsert<Project>('projects', project);
}

export async function deleteProject(id: string): Promise<{ error: import('@supabase/supabase-js').PostgrestError | null }> {
  return remove('projects', id);
}
