/* Photo helpers for the admin.
   There is no backend yet, so photos are shrunk in the browser and saved as text
   (a "data URL") together with the rest of the data in localStorage.
   Later, when the backend exists, only compressImage() needs to change:
   upload the file to the server and return the URL it gives back. */

const MAX_FILE_SIZE = 10 * 1024 * 1024 // refuse files over 10 MB before shrinking

/* Shrinks a picked file so it fits in browser storage.
   maxSide = longest side in pixels, quality = JPEG quality (0 to 1).
   Gives back a promise of the finished data URL. */
export function compressImage(file, { maxSide = 640, quality = 0.75 } = {}) {
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
      context.fillStyle = '#fff' // PNGs with a see-through background would turn black as JPEG
      context.fillRect(0, 0, canvas.width, canvas.height)
      context.drawImage(image, 0, 0, canvas.width, canvas.height)

      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Could not read that photo. Try a different file.'))
    }
    image.src = url
  })
}

/* Turns a saved picture into something an <img> can show.
   Photos picked in the admin are data URLs, the starting blog posts use paths
   like "images/blog/x.jpg" from the public folder. */
export function imageSrc(image) {
  if (!image) return ''
  return /^(data:|https?:|\/)/.test(image) ? image : `/${image}`
}
