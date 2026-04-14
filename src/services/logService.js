import { supabase } from './supabase'

export async function saveOutfitLog(photoUri, confirmedItems) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const photoUrl = await uploadPhoto(photoUri, user.id)

  const { data: log, error: logError } = await supabase
    .from('logs')
    .insert({ user_id: user.id, photo_url: photoUrl })
    .select()
    .single()

  if (logError) throw logError

  await Promise.all(
    confirmedItems.map(async (item) => {
      const savedItem = await saveOrUpdateItem(item, user.id)
      const { error: linkError } = await supabase
        .from('log_items')
        .insert({ log_id: log.id, item_id: savedItem.id })
      if (linkError) throw linkError
    })
  )

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
  const { data: existing } = await supabase
    .from('items')
    .select()
    .eq('user_id', userId)
    .or(`name.ilike."${item.name}",original_name.ilike."${item.name}"`)
    .single()

  if (existing) {
    const { data: updated, error } = await supabase
      .from('items')
      .update({ wear_count: existing.wear_count + 1 })
      .eq('id', existing.id)
      .select()
      .single()

    if (error) throw error
    return updated
  } else {
    const { data: newItem, error } = await supabase
      .from('items')
      .insert({
        user_id: userId,
        name: item.name,
        original_name: item.name,
        aliases: [],
        category: item.category,
        subcategory: item.subcategory || null,
        color: item.color,
        brand: item.brand || null,
        pattern: item.pattern || null,
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

export async function fetchLogById(logId) {
  const { data, error } = await supabase
    .from('logs')
    .select(`
      id,
      photo_url,
      logged_at,
      log_items (
        items (
          id,
          name,
          category,
          color,
          wear_count
        )
      )
    `)
    .eq('id', logId)
    .single()

  if (error) throw error
  return data
}

export async function deleteLog(logId) {
  const { error } = await supabase
    .from('logs')
    .delete()
    .eq('id', logId)

  if (error) throw error
}

export async function fetchStreak() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 0

  const { data, error } = await supabase
    .from('logs')
    .select('logged_at')
    .eq('user_id', user.id)
    .order('logged_at', { ascending: false })

  if (error || !data.length) return 0

  const days = [...new Set(data.map(log =>
    new Date(log.logged_at).toISOString().split('T')[0]
  ))]

  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

  if (days[0] !== today && days[0] !== yesterday) return 0

  const offset = days[0] === yesterday ? 1 : 0
  let streak = 0

  for (let i = 0; i < days.length; i++) {
    const expected = new Date(Date.now() - (i + offset) * 86400000).toISOString().split('T')[0]
    if (days[i] === expected) {
      streak++
    } else {
      break
    }
  }

  return streak
}