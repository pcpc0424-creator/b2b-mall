import { supabasePublic } from '../lib/supabase'

/**
 * Supabase Storage 서비스
 * 이미지 업로드, base64 변환 업로드, 삭제 기능 제공
 */

/** 파일을 Supabase Storage 버킷에 업로드하고 공개 URL을 반환 */
export async function uploadImage(
  bucket: string,
  file: File,
  path?: string
): Promise<string> {
  const fileName = path || `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`

  const { data, error } = await supabasePublic.storage
    .from(bucket)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    console.error('이미지 업로드 실패:', error)
    throw new Error(`이미지 업로드 실패: ${error.message}`)
  }

  const { data: urlData } = supabasePublic.storage
    .from(bucket)
    .getPublicUrl(data.path)

  return urlData.publicUrl
}

/** base64 문자열을 File로 변환 후 업로드, 공개 URL 반환. 이미 URL이면 그대로 반환 */
export async function uploadBase64Image(
  bucket: string,
  base64: string
): Promise<string> {
  // 이미 URL인 경우 그대로 반환
  if (!base64.startsWith('data:')) {
    return base64
  }

  // base64 → Blob → File 변환
  const [meta, data] = base64.split(',')
  const mimeMatch = meta.match(/data:(.*?);/)
  const mime = mimeMatch ? mimeMatch[1] : 'image/png'
  const ext = mime.split('/')[1] || 'png'

  const byteCharacters = atob(data)
  const byteNumbers = new Array(byteCharacters.length)
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }
  const byteArray = new Uint8Array(byteNumbers)
  const blob = new Blob([byteArray], { type: mime })

  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`
  const file = new File([blob], fileName, { type: mime })

  return uploadImage(bucket, file, fileName)
}

/** Supabase Storage에서 이미지 삭제. URL에서 경로를 추출하여 삭제 */
export async function deleteImage(
  bucket: string,
  url: string
): Promise<void> {
  // URL에서 버킷 이후의 경로를 추출
  const bucketPath = `/storage/v1/object/public/${bucket}/`
  const index = url.indexOf(bucketPath)
  if (index === -1) return

  const path = url.substring(index + bucketPath.length)
  if (!path) return

  const { error } = await supabasePublic.storage
    .from(bucket)
    .remove([path])

  if (error) throw error
}
