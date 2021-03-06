import { Request, Response } from 'express'
import multer from 'multer'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import Product, { IProduct, IProductExcel } from '../models/product'
import { IUser } from '../models/user'
import { downloadImage, resizeImg1024, resizeImg150 } from '../util/imgs'
import mongoose from 'mongoose'
import RemainModel from '../models/remains'
import ExcelImport from '../models/excel_import'
import CategoryModel from '../models/category'
import logger from '../util/logger'
import parseWbPage from '../util/wb_page_parser'

const UPLOAD_FILES_DIR = './upload/products'

const genOrigPath = () => `${uuidv4()}-${Date.now()}-orig.jpg`
const genSmallPath = () => `${uuidv4()}-${Date.now()}-small.jpg`
const genBigPath = () => `${uuidv4()}-${Date.now()}-big.jpg`

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, UPLOAD_FILES_DIR)
  },
  filename(req, file, cb) {
    cb(null, genOrigPath())
  },
})

export const upload = multer({ storage })

const parseReqToProduct = (req: Request) => {
  let {
    type,
    category,
    article,
    name,
    description,
    color,
    tags,
    videos,
    buy_price,
    delivery_price,
    update_price,
    height,
    length,
    width,
    weight,
    brand,
    provider,
    mark,
    marketplace_data,
    country,
    barcode,
    addresses,
  } = req.body

  let imgs: string[] | undefined = [],
    imgs_big: string[] | undefined = [],
    imgs_small: string[] | undefined = []

  // @ts-ignore
  req.files?.forEach(i => {
    const orig_path = i.filename,
      small_path = genSmallPath(),
      big_path = genBigPath()
    resizeImg1024(i.path, i.destination + '/' + big_path)
    resizeImg150(i.path, i.destination + '/' + small_path)

    imgs?.push(orig_path)
    imgs_big?.push(big_path)
    imgs_small?.push(small_path)
  })

  if (!req.files?.length) {
    imgs = undefined
    imgs_big = undefined
    imgs_small = undefined
  }
  const user: IUser & { id: string } = (req as any).user
  let product = {
    type,
    category,
    article: article || uuidv4(),
    name,
    description,
    color,
    tags: tags && JSON.parse(tags),
    imgs,
    imgs_big,
    imgs_small,
    videos: videos && JSON.parse(videos),
    marketplace_data: marketplace_data && JSON.parse(marketplace_data),
    addresses: addresses && JSON.parse(addresses),
    buy_price,
    delivery_price,
    update_price,
    height,
    length,
    width,
    weight,
    brand,
    provider,
    mark,
    country,
    changed: new Date(),
    user_changed_id: user.id,
    barcode,
  }
  product.videos.forEach((video: string) => {
    if (
      !video.match(
        /http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-\_]*)(&(amp;)???????[\w\???????=]*)?/
      )
    ) {
      throw new Error('Invalid youtube link')
    }
  })
  return product
}

export const createProduct = async (req: Request, res: Response) => {
  try {
    const doc1 = await Product.findOne({ name: req.body.name })
    if (doc1) return res.status(400).send('Product already Exists')

    const doc2 = await Product.findOne({ article: req.body.article })
    if (doc2) return res.status(400).send('Product already Exists')

    const product = parseReqToProduct(req)

    const new_product = new Product(product)
    new_product.created = new Date()
    const user: IUser & { id: string } = (req as any).user
    new_product.user_creator_id = user.id
    await new_product.save()

    res.send('Product created')
  } catch (err: any) {
    logger.error(err.message)
    res.status(400).send(err.message)
  }
}

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(404).send(`No product with id: ${id}`)
    const old_product = await Product.findById(id)
    if (!old_product) return res.status(400).send(`Product doens't Exists`)

    const updated_product = parseReqToProduct(req)

    Object.keys(updated_product).forEach(key =>
      // @ts-ignore
      updated_product[key] === undefined ? delete updated_product[key] : {}
    )

    await Product.findByIdAndUpdate(id, updated_product, {
      new: true,
      runValidators: true,
      context: 'query',
    })
    res.send('Product updated')
  } catch (err: any) {
    logger.error(err.message)
    res.status(400).send(err.message)
  }
}

export const updateManyProducts = async (req: Request, res: Response) => {
  try {
    const { ids, data } = req.body

    console.log(ids, data)

    const {
      brand,
      category,
      country,
      description,
      height,
      length,
      mark,
      provider,
      weight,
      width,
      buy_price,
      buy_price_option,
      delivery_price,
      delivery_price_option,
    } = data

    await Promise.allSettled(
      ids.map(async (id: string) => {
        const old_product = await Product.findById(id)

        let new_buy_price = Number(old_product?.buy_price)
        if (buy_price) {
          if (buy_price_option === 'percent') {
            new_buy_price += new_buy_price * (buy_price / 100)
          } else if (buy_price_option === 'add') {
            new_buy_price += buy_price
          } else {
            new_buy_price = buy_price
          }
        }

        let new_delivery_price = Number(old_product?.delivery_price)
        if (delivery_price) {
          if (delivery_price_option === 'percent') {
            new_delivery_price += new_delivery_price * (delivery_price / 100)
          } else if (delivery_price_option === 'add') {
            new_delivery_price += delivery_price
          } else {
            new_delivery_price = delivery_price
          }
        }
        await Product.findByIdAndUpdate(id, {
          brand,
          category,
          country,
          description,
          height,
          length,
          mark,
          provider,
          weight,
          width,
          buy_price: new_buy_price,
          delivery_price: new_delivery_price,
        })
      })
    )

    res.send('Products updated')
  } catch (err: any) {
    logger.error(err.message)
    res.status(400).send(err.message)
  }
}

export const getProduct = async (req: Request, res: Response) => {
  try {
    let { id } = req.params

    const product = await Product.findById(id)
    res.status(200).json(product)
  } catch (err: any) {
    logger.error(err.message)
    res.status(400).send(err.message)
  }
}

export const removeProducts = async (req: Request, res: Response) => {
  try {
    const { products } = req.body

    await Promise.all(
      products.map(async (product: string) => {
        await Product.findByIdAndRemove(product)
        await RemainModel.deleteMany({ product })
      })
    )
    res.status(200).json('Products deleated')
  } catch (err: any) {
    logger.error(err.message)
    res.status(400).send(err.message)
  }
}

export const getProducts = async (req: Request, res: Response) => {
  try {
    let { pageNumber, nPerPage }: any = req.params

    pageNumber = parseInt(pageNumber)
    nPerPage = parseInt(nPerPage)

    const products = await Product.find()
      .skip(pageNumber > 0 ? (pageNumber - 1) * nPerPage : 0)
      .limit(nPerPage)
    res.status(200).json(products)
  } catch (err: any) {
    logger.error(err.message)
    res.status(400).send(err.message)
  }
}
export const getCount = async (req: Request, res: Response) => {
  try {
    const products = await Product.count()
    res.status(200).json(products)
  } catch (err: any) {
    logger.error(err.message)
    res.status(400).send(err.message)
  }
}

export const searchProducts = async (req: Request, res: Response) => {
  try {
    const { str, options }: { str: string; options: string[] } = req.body

    let { pageNumber, nPerPage }: any = req.params

    pageNumber = parseInt(pageNumber)
    nPerPage = parseInt(nPerPage)

    const search_options: any[] = [
      { name: new RegExp(str, 'i') },
      { article: new RegExp(str, 'i') },
      { barcode: new RegExp(str, 'i') },
    ]

    if (options.includes('brand'))
      search_options.push({ brand: new RegExp(str, 'i') })

    if (options.includes('provider'))
      search_options.push({ provider: new RegExp(str, 'i') })

    if (str) {
      const products = await Product.find({
        $or: search_options,
      })
        .skip(pageNumber > 0 ? (pageNumber - 1) * nPerPage : 0)
        .limit(nPerPage)

      res.status(200).json(products)
    } else {
      res.status(200).json([])
    }
  } catch (err: any) {
    logger.error(err.message)
    res.status(400).send(err.message)
  }
}

export const getImg = async (req: Request, res: Response) => {
  const { id } = req.params
  res.sendFile(`./upload/products/${id}`, { root: process.cwd() })
}

const createProductExcel = async (
  product: IProductExcel,
  import_id: string,
  user: IUser & { id: string }
) => {
  try {
    product.imgs = []
    product.imgs_small = []
    product.imgs_big = []

    await Promise.allSettled(
      product.upload_imgs.map(async url => {
        try {
          const orig_path = genOrigPath(),
            small_path = genSmallPath(),
            big_path = genBigPath()

          await downloadImage(url, `${UPLOAD_FILES_DIR}/${orig_path}`)
          await resizeImg1024(
            `${UPLOAD_FILES_DIR}/${orig_path}`,
            `${UPLOAD_FILES_DIR}/${big_path}`
          )
          await resizeImg150(
            `${UPLOAD_FILES_DIR}/${orig_path}`,
            `${UPLOAD_FILES_DIR}/${small_path}`
          )
          product.imgs?.push(orig_path)
          product.imgs_small?.push(small_path)
          product.imgs_big?.push(big_path)
        } catch (err: any) {
          logger.error(err.message)
          await ExcelImport.findByIdAndUpdate(import_id, {
            $push: {
              import_errors: `???????????? ?? ???????????? ${product.excel_row} : ???????????????? ?????????????????????? ${url} ???? ??????????????`,
            },
          })
        }
      })
    )
    product.category = (await CategoryModel.findOne({ name: product.category }))
      ? product.category
      : ''
    product.height = Number(product.height)
    product.length = Number(product.length)
    product.width = Number(product.width)
    product.weight = Number(product.weight)
    product.changed = new Date()
    product.created = new Date()
    product.user_creator_id = user.id
    const new_product = new Product(product)
    await new_product.save()
    await ExcelImport.findByIdAndUpdate(import_id, {
      $push: { done: new_product.id },
    })
  } catch (err: any) {
    logger.error(err.message)
    try {
      let msg = `???????????? ?? ???????????? ${product.excel_row} : `
      if (err instanceof mongoose.Error) {
        msg += `${err.message}`
      } else if (err instanceof Error) {
        msg += `${err.message}`
      }
      await ExcelImport.findByIdAndUpdate(import_id, {
        $push: { import_errors: msg },
        $inc: { failed: 1 },
      })
      import_id
    } catch (err: any) {
      logger.error(err.message)
    }
  }
}

export const createExcelProducts = async (req: Request, res: Response) => {
  try {
    const { products }: { products: any[] } = req.body

    const new_excel_import = new ExcelImport({
      date: new Date(),
      done: [],
      import_errors: [],
      total: products.length,
      failed: 0,
    })
    await new_excel_import.save()
    const to_remove = await Promise.all(
      (
        await ExcelImport.find({}).sort('-date').skip(5)
      ).map(async item => await ExcelImport.findByIdAndRemove(item.id))
    )

    products.forEach((product: any) =>
      createProductExcel(product, new_excel_import._id, (req as any).user)
    )
    res.status(200).json('Import started')
  } catch (err: any) {
    logger.error(err.message)
    res.status(400).send(err.message)
  }
}

export const getExcelImports = async (req: Request, res: Response) => {
  try {
    const excel_imports = await ExcelImport.find({})

    res.status(200).json(excel_imports)
  } catch (err: any) {
    logger.error(err.message)
    res.status(400).send(err.message)
  }
}

export const createWbUrlProduct = async (req: Request, res: Response) => {
  try {
    const { url } = req.body

    const data = await parseWbPage(url)

    const raw_product = {
      width: data.width,
      height: data.height,
      length: data.length,
      weight: data.weight,
      name: data.name,
      country: data.country,
      description: data.description,
      marketplace_data: {
        '???????????????????????? Wildberries FBS': data.article,
      },
      imgs: [] as string[],
      imgs_big: [] as string[],
      imgs_small: [] as string[],
      buy_price: '1',
      delivery_price: '1',
      update_price: true,
    }

    await Promise.allSettled(
      data.imgUrl.map(async url => {
        try {
          const orig_path = genOrigPath(),
            small_path = genSmallPath(),
            big_path = genBigPath()

          await downloadImage(url, `${UPLOAD_FILES_DIR}/${orig_path}`)
          await resizeImg1024(
            `${UPLOAD_FILES_DIR}/${orig_path}`,
            `${UPLOAD_FILES_DIR}/${big_path}`
          )
          await resizeImg150(
            `${UPLOAD_FILES_DIR}/${orig_path}`,
            `${UPLOAD_FILES_DIR}/${small_path}`
          )
          raw_product.imgs.push(orig_path)
          raw_product.imgs_small.push(small_path)
          raw_product.imgs_big.push(big_path)
        } catch (err: any) {
          logger.error(err.message)
        }
      })
    )

    const product = new Product(raw_product)
    await product.save()
    res.status(200).json('Import started')
  } catch (err: any) {
    logger.error(err.message)
    res.status(400).send(err.message)
  }
}
