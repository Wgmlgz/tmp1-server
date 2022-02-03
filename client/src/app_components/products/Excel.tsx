import ExcelJS from 'exceljs'
import { IProductFull } from './ProductsForm'
import { saveAs } from 'file-saver'

async function saveFile(fileName: string, workbook: ExcelJS.Workbook) {
  const xls64 = await workbook.xlsx.writeBuffer({ base64: true } as any)
  saveAs(
    new Blob([xls64], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }),
    fileName
  )
}

export const exportProducts = (selected_products: IProductFull[]) => {
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('My Sheet')

  worksheet.columns = [
    { header: 'type', key: 'type' },
    { header: 'category', key: 'category' },
    { header: 'article', key: 'article' },
    { header: 'name', key: 'name' },
    { header: 'description', key: 'description' },
    { header: 'tags', key: 'tags' },
    { header: 'imgs', key: 'imgs' },
    { header: 'imgs_big', key: 'imgs_big' },
    { header: 'imgs_small', key: 'imgs_small' },
    { header: 'videos', key: 'videos' },
    { header: 'buy_price', key: 'buy_price' },
    { header: 'delivery_price', key: 'delivery_price' },
    { header: 'height', key: 'height' },
    { header: 'length', key: 'length' },
    { header: 'width', key: 'width' },
    { header: 'weight', key: 'weight' },
    { header: 'brand', key: 'brand' },
    { header: 'provider', key: 'provider' },
    { header: 'address', key: 'address' },
    { header: 'mark', key: 'mark' },
    { header: 'country', key: 'country' },
    { header: 'created', key: 'created' },
    { header: 'user_creator_id', key: 'user_creator_id' },
    { header: 'changed', key: 'changed' },
    { header: 'user_changed_id', key: 'user_changed_id' },
    { header: 'barcode', key: 'barcode' },
  ]
  selected_products.forEach((product: any) => {
    worksheet.addRow({
      ...product,
      created: new Date(product.created),
      changed: new Date(product.changed),
      videos: product.videos?.join('; '),
      tags: product.tags?.join('; '),
      imgs: product.imgs?.join('; '),
      imgs_big: product.imgs_big?.join('; '),
      imgs_small: product.imgs_small?.join('; '),
    })
  })
  saveFile('exported_products.xls', workbook)

  console.log(worksheet)
}
