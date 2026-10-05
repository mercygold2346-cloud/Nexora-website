import { supabase } from './supabaseClient.js'

const bucketName = 'profile-images'
const maximumAvatarBytes = 5 * 1024 * 1024
const allowedImageTypes = new Map([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
])
const profileColumns = 'user_id,full_name,email,role,avatar_path,created_at'

function requireSupabase() {
  if (!supabase) throw new Error('Supabase is not configured.')
}

function validateImage(file) {
  if (!file || !allowedImageTypes.has(file.type)) {
    throw new Error('Choose a JPEG, PNG, or WebP image.')
  }
  if (file.size > maximumAvatarBytes) {
    throw new Error('Profile images must be 5 MB or smaller.')
  }
}

async function createAvatarUrl(path) {
  if (!path) return null
  const { data, error } = await supabase.storage.from(bucketName).createSignedUrl(path, 60)
  if (error) throw error
  return data.signedUrl
}

export async function getMyProfile() {
  requireSupabase()
  const { data, error } = await supabase.from('profiles').select(profileColumns).single()
  if (error) throw error
  return { ...data, avatar_signed_url: await createAvatarUrl(data.avatar_path) }
}

export async function listVisibleProfiles() {
  requireSupabase()
  const { data, error } = await supabase.rpc('list_visible_profiles')
  if (error) throw error

  return Promise.all(data.map(async profile => {
    try {
      return { ...profile, avatar_signed_url: await createAvatarUrl(profile.avatar_path) }
    } catch {
      return { ...profile, avatar_path: null, avatar_signed_url: null }
    }
  }))
}

export async function uploadMyAvatar(file) {
  requireSupabase()
  validateImage(file)
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError) throw userError
  if (!user) throw new Error('Sign in again before changing your profile image.')

  const previousProfile = await getMyProfile()
  const extension = allowedImageTypes.get(file.type)
  const path = `${user.id}/avatar-${crypto.randomUUID()}.${extension}`
  const storage = supabase.storage.from(bucketName)
  const { error: uploadError } = await storage.upload(path, file, {
    cacheControl: '60',
    contentType: file.type,
    upsert: false,
  })
  if (uploadError) throw uploadError

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .update({ avatar_path: path })
    .eq('user_id', user.id)
    .select(profileColumns)
    .single()

  if (profileError) {
    await storage.remove([path])
    throw profileError
  }

  if (previousProfile.avatar_path && previousProfile.avatar_path !== path) {
    await storage.remove([previousProfile.avatar_path])
  }
  return { ...profile, avatar_signed_url: await createAvatarUrl(path) }
}

export async function deleteMyAvatar() {
  requireSupabase()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError) throw userError
  if (!user) throw new Error('Sign in again before changing your profile image.')

  const profile = await getMyProfile()
  if (!profile.avatar_path) return profile

  const storage = supabase.storage.from(bucketName)
  const { error: deleteError } = await storage.remove([profile.avatar_path])
  if (deleteError) throw deleteError

  const { data, error } = await supabase
    .from('profiles')
    .update({ avatar_path: null })
    .eq('user_id', user.id)
    .select(profileColumns)
    .single()
  if (error) throw error
  return { ...data, avatar_signed_url: null }
}
