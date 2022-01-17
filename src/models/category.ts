import mongoose from 'mongoose'

export interface ICategory {
  name: string
  descriptrion?: string
  img?: string
  tags?: string[]
  parent?: string
}

const CategorySchema = new mongoose.Schema<ICategory>({
  name: {
    type: String,
    required: true,
  },
  descriptrion: {
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
