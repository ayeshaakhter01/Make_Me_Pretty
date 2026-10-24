import { assetUrl } from '../../api.js'

/* Compress locally; ImageField uploads the resulting binary to the backend. */

const MAX_FILE_SIZE = 10 * 1024 * 1024 // refuse files over 10 MB before shrinking

/* Shrinks a picked file before upload.
   maxSide = longest side in pixels, quality = JPEG quality (0 to 1).
   format  = 'image/jpeg' (smaller, the default) or 'image/png' (keeps a see-through background, used for the logo).
   Gives back a promise of a compressed image Blob. */
export function compressImage(file, { maxSide = 640, quality = 0.75, format = 'image/jpeg' } = {}) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) return reject(new Error('Please choose an image (JPG, PNG or WEBP).'))
    if (file.size > MAX_FILE_SIZE) return reject(new Error('That photo is over 10 MB. Please pick a smaller one.'))

    const url = URL.createObjectURL(file)
    const image = new Image()

    image.onload = () => {
      const scale = Math.min(1, maxSide / Math.max(image.width, image.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(image.width * scale)
      canvas.height = Math.round(image.height * scale)

      const context = canvas.getContext('2d')
      if (format === 'image/jpeg') {
        context.fillStyle = '#fff' // PNGs with a see-through background would turn black as JPEG
        context.fillRect(0, 0, canvas.width, canvas.height)
      }
      context.drawImage(image, 0, 0, canvas.width, canvas.height)

      canvas.toBlob((blob) => {
        URL.revokeObjectURL(url)
        if (blob) resolve(blob)
        else reject(new Error('Could not compress that image.'))
      }, format, quality)
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Could not read that photo. Try a different file.'))
    }
    image.src = url
  })
}

/* Turns stored image paths into something an <img> can show. */
export function imageSrc(image) {
  if (!image) return ''
  if (/^(data:|https?:|blob:)/.test(image)) return image
  const path = `/${image.replace(/^\//, '')}`
  return path.startsWith('/uploads/') ? assetUrl(path) : path
}
