export function assertSameOriginDownloadPath(path: string) {
  if (!path.startsWith('/api/') || path.startsWith('//') || path.includes('\\')) {
    throw new Error('download path must be a same-origin /api/ path')
  }
  return path
}

export function downloadBlob(blob: Blob, filename: string) {
  const safeFilename = filename.replace(/[\\/:*?"<>|\u0000-\u001f]/g, '_').slice(0, 160)
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = safeFilename || 'download'
  anchor.click()
  queueMicrotask(() => URL.revokeObjectURL(url))
}
