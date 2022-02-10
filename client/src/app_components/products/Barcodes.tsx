import { FC, useCallback, useEffect, useRef, useState } from 'react'
import jsPDF from 'jspdf'
import JsBarcode from 'jsbarcode'
import { Button, Card, message } from 'antd'

export interface Barcode {
  barcode: string
  name: string
  article: string
  color?: string
}

interface Props {
  barcodes: Barcode[]
}

const Barcodes: FC<Props> = ({ barcodes }) => {
  const [pdf, setPdf] = useState(new jsPDF())
  const canvas_ref = useRef<HTMLCanvasElement>(null)
  const tmp_canvas_ref = useRef<HTMLCanvasElement>(null)

  const renderBarcode = useCallback(
    (barcode: Barcode, x: number, y: number, scale: number) => {
      try {
        JsBarcode(tmp_canvas_ref.current)
          .EAN13(barcode.barcode, {
            width: 1.8 * scale,
            height: 50 * scale,
            fontSize: 15 * scale,
          })
          .render()
        const ctx = canvas_ref.current?.getContext('2d')
        if (!ctx) return
        tmp_canvas_ref.current &&
          ctx.drawImage(tmp_canvas_ref.current, x + 10 * scale, y + 70 * scale)

        ctx.fillStyle = '#000'
        ctx.font = `${15 * scale}px serif`
        if (barcode.color) {
          ctx.fillText(barcode.name, x + 10 * scale, y + 20 * scale, 200)
          ctx.fillText(
            `Артикул: ${barcode.article}`,
            x + 10 * scale,
            y + 40 * scale,
            200 * scale
          )
          ctx.fillText(
            `Цвет: ${barcode.color}`,
            x + 10 * scale,
            y + 60 * scale,
            200 * scale
          )
        } else {
          ctx.fillText(
            barcode.name,
            x + 10 * scale,
            y + 25 * scale,
            200 * scale
          )
          ctx.fillText(
            `Артикул: ${barcode.article}`,
            x + 10 * scale,
            y + 50 * scale,
            200 * scale
          )
        }
        ctx.strokeRect(x, y, 220 * scale, 152 * scale)
      } catch (err: any) {
        message.error(err)
      }
    },
    []
  )

  useEffect(() => {
    const scale = 4
    const pdf = new jsPDF({
      unit: 'mm',
      orientation: 'landscape',
      format: [58 * scale, 40 * scale],
    })
    const canvas = canvas_ref.current
    if (!canvas) return
    const ctx = canvas_ref.current.getContext('2d')
    if (!ctx) return

    canvas.width = 300 * scale
    canvas.height = (barcodes.length * 350 + 40) * scale

    barcodes.forEach((barcode, i) => {
      ctx.fillStyle = '#fff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      renderBarcode(barcode, 0, 0 * i, scale)
      if (i) pdf.addPage()
      const imgData = canvas_ref.current?.toDataURL('image/jpeg', 1.0)
      if (!imgData) return
      pdf.addImage(imgData, 'JPEG', 0, 0, 0, 0)
    })

    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    barcodes.forEach((barcode, i) => {
      renderBarcode(barcode, 0, 190 * i * scale, scale)
    })
    setPdf(pdf)
  }, [barcodes, renderBarcode])

  return (
    <>
      <canvas ref={tmp_canvas_ref} hidden={true} />
      <Card>
        <div
          style={{ width: 'fit-content', height: '60vh', overflowY: 'scroll' }}>
          <canvas ref={canvas_ref} />
        </div>
        <div style={{ display: 'grid', placeItems: 'center' }}>
          <Button
            type='primary'
            onClick={() => {
              // const imgData = canvas_ref.current?.toDataURL('image/jpeg', 1.0)
              // if (!imgData) return

              pdf.save('Labels.pdf')
            }}>
            Download as pdf
          </Button>
        </div>
      </Card>
    </>
  )
}
export default Barcodes
