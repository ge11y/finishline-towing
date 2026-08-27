import { getSupabaseAdmin } from '@/lib/supabase-admin'

export const ADD_ON_CASE_IMAGE_BUCKET = 'add-on-case-images'

export function getAddOnCaseImageStoragePath(id: string, imageId = 'front') {
  return `${id}/${imageId}`
}

export function getAddOnCaseImageProxyUrl(id: string, imageId?: string) {
  const base = `/api/add-ons/image/${id}`
  return imageId && imageId !== 'front' ? `${base}?image=${encodeURIComponent(imageId)}` : base
}

export async function ensureAddOnCaseImageBucket() {
  const supabase = getSupabaseAdmin()
  if (!supabase) return

  const { data: buckets } = await supabase.storage.listBuckets()
  const existingBucket = buckets?.find((entry) => entry.name === ADD_ON_CASE_IMAGE_BUCKET)
  if (existingBucket) {
    await supabase.storage.updateBucket(ADD_ON_CASE_IMAGE_BUCKET, {
      public: false,
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
    })
    return
  }

  await supabase.storage.createBucket(ADD_ON_CASE_IMAGE_BUCKET, {
    public: false,
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
  })
}
