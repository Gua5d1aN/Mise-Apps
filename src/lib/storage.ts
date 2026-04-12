/**
 * Supabase Storage helpers for photo uploads.
 *
 * Handles three upload contexts:
 *   - Task completion photos (checklist flow)
 *   - Example/reference photos (admin edit panel)
 *   - Maintenance issue photos (issue log flow)
 *
 * All uploads go to the 'checklist-photos' bucket under organised path prefixes:
 *   checklist photos → {timestamp}_{loc}_{sec}_{shift}_{idx}.{ext}
 *   example photos   → examples/{timestamp}_{idx}.{ext}
 *   issue photos     → issues/{timestamp}_{item}.{ext}
 *
 * Phase 2 note: Paths will be prefixed with {org_id}/ for per-tenant isolation.
 *
 * @author Joshua Bosen
 */
import { supabase } from './supabase';

const PHOTO_BUCKET = 'checklist-photos';

/** Sanitise a string to be safe for use in a storage path. */
const sanitise = (s: string) => String(s).replace(/[^a-zA-Z0-9_-]/g, '_');

/**
 * Uploads a photo file to Supabase Storage and returns its public URL.
 *
 * The path is constructed from the provided context parameters to ensure
 * uniqueness even under concurrent uploads. Each segment is sanitised
 * to prevent path traversal and storage errors.
 *
 * @param file      - The image file to upload.
 * @param location  - Location context (e.g. 'Kitchen', 'issues', 'examples').
 * @param section   - Section context (e.g. 'Grill', item name for issues).
 * @param shift     - Shift context (e.g. 'Opening', 'issue', 'example').
 * @param index     - Task index or timestamp for uniqueness.
 * @returns         Public URL of the uploaded image.
 * @throws          Error if the upload fails.
 */
export async function uploadPhoto(
  file: File,
  location: string,
  section: string,
  shift: string,
  index: number,
): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'jpg';

  // Build a unique path. The timestamp ensures no two uploads collide.
  const prefix = location === 'examples' ? 'examples' : location === 'issues' ? 'issues' : null;
  const path = prefix
    ? `${prefix}/${Date.now()}_${sanitise(section)}_${index}.${ext}`
    : `${Date.now()}_${sanitise(location)}_${sanitise(section)}_${sanitise(shift)}_${index}.${ext}`;

  const { error } = await supabase.storage
    .from(PHOTO_BUCKET)
    .upload(path, file, { cacheControl: '3600', upsert: false });

  if (error) {
    console.error('[Mise] uploadPhoto:', error.message);
    throw new Error(`Photo upload failed: ${error.message}`);
  }

  const { data } = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
