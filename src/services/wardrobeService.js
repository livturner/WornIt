import { supabase } from './supabase'

export async function saveOutfitLog(photoUri, confirmedItems) {
  // Get the current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // 1. Upload photo to Supabase Storage
  const photoUrl = await uploadPhoto(photoUri, user.id)

  // 2. Create the log entry
  const { data: log, error: logError } = await supabase
    .from('logs')
    .insert({ user_id: user.id, photo_url: photoUrl })
    .select()
    .single()

  if (logError) throw logError

  // 3. Save each confirmed item
  for (const item of confirmedItems) {
    const savedItem = await saveOrUpdateItem(item, user.id)

    // 4. Link item to log
    const { error: linkError } = await supabase
      .from('log_items')
      .insert({ log_id: log.id, item_id: savedItem.id })

    if (linkError) throw linkError
  }

  return log
}

async function uploadPhoto(photoUri, userId) {
  const response = await fetch(photoUri)
  const arraybuffer = await response.arrayBuffer()
  const fileName = `${userId}/${Date.now()}.jpg`

  const { error } = await supabase.storage
    .from('outfit-photos')
    .upload(fileName, arraybuffer, { contentType: 'image/jpeg' })

  if (error) throw error

  const { data } = supabase.storage
    .from('outfit-photos')
    .getPublicUrl(fileName)

  return data.publicUrl
}

async function saveOrUpdateItem(item, userId) {
  // Check if item already exists for this user
  const { data: existing } = await supabase
    .from('items')
    .select()
    .eq('user_id', userId)
    .ilike('name', item.name)
    .single()

  if (existing) {
    // Item exists — increment wear count
    const { data: updated, error } = await supabase
      .from('items')
      .update({ wear_count: existing.wear_count + 1 })
      .eq('id', existing.id)
      .select()
      .single()

    if (error) throw error
    return updated
  } else {
    // New item — create it
    const { data: newItem, error } = await supabase
      .from('items')
      .insert({
        user_id: userId,
        name: item.name,
        category: item.category,
        color: item.color,
        wear_count: 1,
      })
      .select()
      .single()

    if (error) throw error
    return newItem
  }
}

export async function fetchTimeline() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('logs')
    .select(`
      id,
      photo_url,
      logged_at,
      log_items (
        items (
          name,
          category,
          color,
          wear_count
        )
      )
    `)
    .eq('user_id', user.id)
    .order('logged_at', { ascending: false })

  if (error) throw error
  return data
}

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