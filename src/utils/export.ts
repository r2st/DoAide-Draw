import type Konva from 'konva'
import { saveAs } from 'file-saver'
import type { CanvasState } from '../types'

const WATERMARK = 'Created with DoAide Draw — draw.doaide.com'

function addWatermark(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.save()
  ctx.font = '14px sans-serif'
  ctx.fillStyle = 'rgba(99,102,241,0.6)'
  ctx.textAlign = 'right'
  ctx.fillText(WATERMARK, width - 16, height - 16)
  ctx.restore()
}

export function exportPNG(stage: Konva.Stage) {
  const pixelRatio = 2
  const dataURL = stage.toDataURL({ pixelRatio })

  const img = new Image()
  img.onload = () => {
    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(img, 0, 0)
    addWatermark(ctx, canvas.width, canvas.height)
    canvas.toBlob((blob) => {
      if (blob) saveAs(blob, 'doaide-drawing.png')
    })
  }
  img.src = dataURL
}

export function exportSVG(stage: Konva.Stage) {
  const width = stage.width()
  const height = stage.height()

  const dataURL = stage.toDataURL({ pixelRatio: 2 })

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <image href="${dataURL}" width="${width}" height="${height}"/>
  <text x="${width - 16}" y="${height - 16}" text-anchor="end" font-size="14" fill="rgba(99,102,241,0.6)">${WATERMARK}</text>
</svg>`

  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
  saveAs(blob, 'doaide-drawing.svg')
}

export function exportJSON(canvasState: CanvasState) {
  const data = JSON.stringify(canvasState, null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  saveAs(blob, 'doaide-drawing.json')
}

export function importJSON(file: File): Promise<CanvasState> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string) as CanvasState
        resolve(data)
      } catch {
        reject(new Error('Invalid JSON file'))
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}

export function shareWhatsApp(stage: Konva.Stage) {
  const dataURL = stage.toDataURL({ pixelRatio: 1 })

  const img = new Image()
  img.onload = () => {
    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(img, 0, 0)
    addWatermark(ctx, canvas.width, canvas.height)
    canvas.toBlob(async (blob) => {
      if (!blob) return
      if (navigator.share) {
        try {
          const file = new File([blob], 'doaide-drawing.png', { type: 'image/png' })
          await navigator.share({ files: [file], title: 'DoAide Draw', text: 'Check out my drawing! Made with DoAide Draw — draw.doaide.com' })
        } catch {
          window.open(`https://wa.me/?text=${encodeURIComponent('Check out DoAide Draw — Free Online Whiteboard! draw.doaide.com')}`, '_blank')
        }
      } else {
        window.open(`https://wa.me/?text=${encodeURIComponent('Check out DoAide Draw — Free Online Whiteboard! draw.doaide.com')}`, '_blank')
      }
    })
  }
  img.src = dataURL
}

export function shareTwitter() {
  const text = encodeURIComponent('Check out my sketch on DoAide Draw — Free Online Whiteboard! draw.doaide.com')
  window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank')
}
