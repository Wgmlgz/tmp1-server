import mongoose from 'mongoose'

export interface ICategory {
  name: string
  description?: string
  img?: string
  tags?: string[]
  parent?: string
}

const CategorySchema = new mongoose.Schema<ICategory>({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  img: {
    type: String,
  },
  tags: {
    type: [String],
  },
  parent: {
    type: String,
  },
})

const CategoryModel = mongoose.model('Category', CategorySchema)

export default CategoryModel
