import sharp from 'sharp'

export const resizeImg100 = async (in_path: string) => {
  const buffer = await sharp(in_path).resize(100, 100).toBuffer()
  return sharp(buffer).toFile(in_path)
}

export const resizeImg1024 = async (in_path: string, out_path: string) => {
  const buffer = await sharp(in_path)
    .resize({
      fit: sharp.fit.contain,
      width: 1024,
    })
    .toBuffer()
  await sharp(buffer).toFile(out_path)
}

export const resizeImg150 = async (in_path: string, out_path: string) => {
  const buffer = await sharp(in_path).resize(150, 150).toBuffer()
  await sharp(buffer).toFile(out_path)
}