import { supabase } from './supabaseClient.js'

export async function inviteMember({ email, fullName }) {
  if (!supabase) throw new Error('Supabase is not configured.')
  const { data, error } = await supabase.functions.invoke('admin-invite-user', {
    body: { email, fullName },
  })
  if (error) throw error
  return data
}