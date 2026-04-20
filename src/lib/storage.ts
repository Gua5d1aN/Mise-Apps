/**
 * Supabase Storage photo upload helper.
 * @author Joshua Bosen
 */
import { supabase } from './supabase';
const PHOTO_BUCKET = 'checklist-photos';
const sanitise = (s: string) => String(s).replace(/[^a-zA-Z0-9_-]/g, '_');
export async function uploadPhoto(file: File, location: string, section: string, shift: string, index: number): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'jpg';
  const prefix = location === 'examples' ? 'examples' : location === 'issues' ? 'issues' : null;
  const path = prefix
    ? `${prefix}/${Date.now()}_${sanitise(section)}_${index}.${ext}`
    : `${Date.now()}_${sanitise(location)}_${sanitise(section)}_${sanitise(shift)}_${index}.${ext}`;
  const { error } = await supabase.storage.from(PHOTO_BUCKET).upload(path, file, { cacheControl: '3600', upsert: false });
  if (error) { console.error('[Mise] uploadPhoto:', error.message); throw new Error(`Photo upload failed: ${error.message}`); }
  const { data } = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
