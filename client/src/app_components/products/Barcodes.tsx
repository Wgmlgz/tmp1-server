import { FC, useCallback, useEffect, useRef } from 'react'
import jsPDF from 'jspdf'
import JsBarcode from 'jsbarcode'
import { Button, Card, message } from 'antd'

export interface Barcode {
  barcode: string
  name: string
  article: string
}

interface Props {
  barcodes: Barcode[]
}

const Barcodes: FC<Props> = ({ barcodes }) => {
  const canvas_ref = useRef<HTMLCanvasElement>(null)
  const tmp_canvas_ref = useRef<HTMLCanvasElement>(null)

  const renderBarcode = useCallback(
    (barcode: Barcode, x: number, y: number) => {
      try {
        JsBarcode(tmp_canvas_ref.current)
          .EAN13(barcode.barcode, { width: 1.8, height: 50 })
          .render()
        const ctx = canvas_ref.current?.getContext('2d')
        if (!ctx) return
        tmp_canvas_ref.current &&
          ctx.drawImage(tmp_canvas_ref.current, x, y + 60)

        ctx.fillStyle = '#000'
        ctx.font = '15px serif'
        ctx.fillText(barcode.name, x + 10, y + 25, 200)
        ctx.fillText(`Артикул: ${barcode.article}`, x + 10, y + 50, 200)
        ctx.strokeRect(x, y, 220, 152)
      } catch (err: any) {
        message.error(err)
      }
    },
    []
  )

  useEffect(() => {
    const canvas = canvas_ref.current
    if (!canvas) return
    const ctx = canvas_ref.current.getContext('2d')
    if (!ctx) return

    canvas.width = 500
    canvas.height = barcodes.length * 250 + 40

    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    barcodes.forEach((barcode, i) => renderBarcode(barcode, 30, 190 * i + 30))
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
              const imgData = canvas_ref.current?.toDataURL('image/jpeg', 1.0)
              if (!imgData) return
              var pdf = new jsPDF()
              console.log(imgData)

              pdf.addImage(imgData, 'JPEG', 0, 0, 0, 0)
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
