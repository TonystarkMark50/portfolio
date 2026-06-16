import { supabase } from '../../lib/supabase';

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  is_archived: boolean;
  is_spam: boolean;
  is_replied: boolean;
  notes?: string;
  labels?: string[];
  created_at: string;
}

export interface CrmResult<T> {
  data: T | null;
  error: string | null;
  count?: number;
}

export interface FetchOptions {
  status?: 'inbox' | 'archived' | 'spam' | 'replied';
  search?: string;
  page?: number;
  limit?: number;
}

function toResult<T>(
  data: T | null,
  error: unknown,
  count?: number,
): CrmResult<T> {
  return {
    data,
    error:
      error instanceof Error
        ? error.message
        : error
          ? String(error)
          : null,
    count,
  };
}

function buildStatusFilter(
  query: ReturnType<ReturnType<typeof supabase.from>['select']>,
  status?: FetchOptions['status'],
): ReturnType<ReturnType<typeof supabase.from>['select']> {
  if (!status || status === 'inbox') {
    return query
      .eq('is_archived', false)
      .eq('is_spam', false)
      .eq('is_replied', false);
  }
  if (status === 'archived') return query.eq('is_archived', true);
  if (status === 'spam') return query.eq('is_spam', true);
  if (status === 'replied') return query.eq('is_replied', true);
  return query;
}

export async function fetchMessages(
  options?: FetchOptions,
): Promise<CrmResult<ContactMessage[]>> {
  const page = options?.page ?? 1;
  const limit = options?.limit ?? 50;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('contact_submissions')
    .select('*', { count: 'exact' });

  query = buildStatusFilter(query, options?.status);

  if (options?.search) {
    const q = `%${options.search}%`;
    query = query.or(
      `name.ilike.${q},email.ilike.${q},subject.ilike.${q},message.ilike.${q}`,
    );
  }

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(from, to);

  return toResult(data as ContactMessage[] | null, error, count ?? undefined);
}

export async function fetchMessageById(
  id: string,
): Promise<CrmResult<ContactMessage>> {
  const { data, error } = await supabase
    .from('contact_submissions')
    .select('*')
    .eq('id', id)
    .single();

  return toResult(data as ContactMessage | null, error);
}

export async function markAsRead(id: string): Promise<CrmResult<null>> {
  const { error } = await supabase
    .from('contact_submissions')
    .update({ is_read: true })
    .eq('id', id);

  return toResult(null, error);
}

export async function markAsReplied(id: string): Promise<CrmResult<null>> {
  const { error } = await supabase
    .from('contact_submissions')
    .update({
      is_replied: true,
      is_read: true,
      replied_at: new Date().toISOString(),
    })
    .eq('id', id);

  return toResult(null, error);
}

export async function archiveMessage(id: string): Promise<CrmResult<null>> {
  const { error } = await supabase
    .from('contact_submissions')
    .update({ is_archived: true, is_read: true })
    .eq('id', id);

  return toResult(null, error);
}

export async function markAsSpam(id: string): Promise<CrmResult<null>> {
  const { error } = await supabase
    .from('contact_submissions')
    .update({ is_spam: true, is_read: true })
    .eq('id', id);

  return toResult(null, error);
}

export async function addNote(
  id: string,
  note: string,
): Promise<CrmResult<null>> {
  const { data: current } = await supabase
    .from('contact_submissions')
    .select('notes')
    .eq('id', id)
    .single();

  const existingNotes = (current?.notes as string | undefined) ?? '';
  const updatedNotes = existingNotes
    ? `${existingNotes}\n---\n${new Date().toISOString()}: ${note}`
    : `${new Date().toISOString()}: ${note}`;

  const { error } = await supabase
    .from('contact_submissions')
    .update({ notes: updatedNotes })
    .eq('id', id);

  return toResult(null, error);
}

export async function deleteMessage(id: string): Promise<CrmResult<null>> {
  const { error } = await supabase
    .from('contact_submissions')
    .delete()
    .eq('id', id);

  return toResult(null, error);
}

export async function getUnreadCount(): Promise<CrmResult<number>> {
  const { count, error } = await supabase
    .from('contact_submissions')
    .select('*', { count: 'exact', head: true })
    .eq('is_read', false)
    .eq('is_archived', false)
    .eq('is_spam', false);

  return toResult(count ?? 0, error);
}
