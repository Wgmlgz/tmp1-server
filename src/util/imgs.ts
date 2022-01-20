import sharp from 'sharp'

export const resizeImg = async (path: string) => {
  const buffer = await sharp(path).resize(100, 100).toBuffer()
  return sharp(buffer).toFile(path)
}
