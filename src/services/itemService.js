import { supabase } from './supabase'

export async function fetchWardrobe() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('items')
    .select(`
      id,
      name,
      category,
      color,
      wear_count,
      first_worn_at,
      created_at,
      log_items (
        log_id,
        logs (
          photo_url,
          logged_at
        )
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function fetchItemById(itemId) {
  const { data, error } = await supabase
    .from('items')
    .select(`
      id,
      name,
      category,
      color,
      wear_count,
      created_at,
      log_items (
        logs (
          id,
          photo_url,
          logged_at
        )
      )
    `)
    .eq('id', itemId)
    .single()

  if (error) throw error
  return data
}

export async function deleteItem(itemId) {
  const { error } = await supabase
    .from('items')
    .delete()
    .eq('id', itemId)

  if (error) throw error
}