import sharp from 'sharp'
import path from 'path'
import fs from 'fs'

const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512]
const ICON_COLOR = '#3b82f6' // Blue color matching our theme

async function generateIcons() {
  // Create icons directory if it doesn't exist
  const iconsDir = path.join(process.cwd(), 'public', 'icons')
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true })
  }

  // Create a base SVG for our icon
  const svgIcon = `
    <svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
      <rect width="512" height="512" fill="${ICON_COLOR}" rx="128"/>
      <circle cx="256" cy="256" r="144" fill="white"/>
      <circle cx="256" cy="256" r="96" fill="${ICON_COLOR}"/>
    </svg>
  `

  // Generate icons for each size
  for (const size of ICON_SIZES) {
    await sharp(Buffer.from(svgIcon))
      .resize(size, size)
      .toFile(path.join(iconsDir, `icon-${size}x${size}.png`))
    
    console.log(`Generated ${size}x${size} icon`)
  }
}

generateIcons().catch(console.error) 