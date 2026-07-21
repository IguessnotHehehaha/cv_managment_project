export async function uploadFile(file: File, folder: 'avatars' | 'attribute-images'): Promise<string> {
    const res = await fetch('/api/uploads/signed-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: file.name, contentType: file.type, folder }),
    })
    if (!res.ok) throw new Error('Could not get upload URL')
    const { uploadUrl, publicUrl } = await res.json()

    const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
    })
    if (!uploadRes.ok) throw new Error('Upload failed')

    return publicUrl
}