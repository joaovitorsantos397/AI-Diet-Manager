const MAX_DIMENSION_PX = 1600
const JPEG_QUALITY = 0.85

// Phone camera photos can be several MB at full resolution — far more
// detail than a nutrition label or plate photo needs for estimation.
// Downscaling client-side keeps uploads fast without losing anything
// the model actually uses.
export async function resizeImageForUpload(file: File): Promise<Blob> {
  const objectUrl = URL.createObjectURL(file)

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = objectUrl
    })

    const scale = Math.min(
      1,
      MAX_DIMENSION_PX / Math.max(image.width, image.height),
    )
    const width = Math.round(image.width * scale)
    const height = Math.round(image.height * scale)

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height

    const context = canvas.getContext('2d')
    if (!context) {
      return file
    }
    context.drawImage(image, 0, 0, width, height)

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY),
    )
    return blob ?? file
  } catch {
    return file
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}
