import { supabase } from '../../lib/supabase';
import { validateImageFile, validateDocumentFile, generateSafeFileName } from '../../utils/fileValidation';

export interface MediaAsset {
  id: string;
  name: string;
  url: string;
  bucket: string;
  size?: number;
  type?: string;
  created_at: string;
}

export interface MediaResult<T> {
  data: T | null;
  error: string | null;
}

export const BUCKETS = ['certification-logos', 'project-images', 'resume-assets'] as const;

export type MediaBucket = (typeof BUCKETS)[number];

function toResult<T>(data: T | null, error: unknown): MediaResult<T> {
  return {
    data,
    error: error instanceof Error ? error.message : error ? String(error) : null,
  };
}

function getFileType(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  const typeMap: Record<string, string> = {
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  };
  return typeMap[ext] || `application/${ext}`;
}

export async function fetchAssets(bucket?: MediaBucket): Promise<MediaResult<MediaAsset[]>> {
  try {
    const bucketsToFetch = bucket ? [bucket] : [...BUCKETS];
    const results = await Promise.all(
      bucketsToFetch.map(async (b) => {
        const { data, error } = await supabase.storage.from(b).list();
        if (error) throw error;
        return (data ?? []).map((file) => {
          const { data: { publicUrl } } = supabase.storage.from(b).getPublicUrl(file.name);
          return {
            id: file.id ?? `${b}/${file.name}`,
            name: file.name,
            url: publicUrl,
            bucket: b,
            size: file.metadata?.size as number | undefined,
            type: getFileType(file.name),
            created_at: file.created_at ?? file.updated_at ?? new Date().toISOString(),
          };
        });
      }),
    );
    return toResult(results.flat(), null);
  } catch (error) {
    return toResult([] as MediaAsset[], error);
  }
}

export async function uploadAsset(bucket: MediaBucket, file: File): Promise<MediaResult<MediaAsset>> {
  const imageBuckets: MediaBucket[] = ['certification-logos', 'project-images'];
  const validation = imageBuckets.includes(bucket) ? validateImageFile(file) : validateDocumentFile(file);
  if (!validation.valid) {
    return toResult(null as unknown as MediaAsset, validation.error);
  }

  try {
    const path = generateSafeFileName(file.name);
    const { error } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
    return toResult({
      id: path,
      name: file.name,
      url: publicUrl,
      bucket,
      size: file.size,
      type: file.type || getFileType(file.name),
      created_at: new Date().toISOString(),
    }, null);
  } catch (error) {
    return toResult(null as unknown as MediaAsset, error);
  }
}

export async function deleteAsset(bucket: MediaBucket, path: string): Promise<MediaResult<null>> {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  return toResult(null, error);
}

export async function getAssetUrl(bucket: MediaBucket, path: string): Promise<MediaResult<string>> {
  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
  return toResult(publicUrl, null);
}

export async function replaceAsset(bucket: MediaBucket, path: string, file: File): Promise<MediaResult<MediaAsset>> {
  try {
    const { error } = await supabase.storage.from(bucket).update(path, file, {
      cacheControl: '3600',
      upsert: true,
    });
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
    return toResult({
      id: path,
      name: file.name,
      url: publicUrl,
      bucket,
      size: file.size,
      type: file.type || getFileType(file.name),
      created_at: new Date().toISOString(),
    }, null);
  } catch (error) {
    return toResult(null as unknown as MediaAsset, error);
  }
}
