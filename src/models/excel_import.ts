import mongoose from 'mongoose'

export interface IExcelImport {
  date: Date
  import_errors: string[]
  done: string[]
  failed: number
  total: number
}

const ExcelImportSchema = new mongoose.Schema<IExcelImport>(
  {
    date: {
      type: Date,
      required: true,
    },
    import_errors: {
      type: [String],
      required: true,
    },
    done: {
      type: [String],
      required: true,
    },
    failed: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
  },
  {
    capped: {
      size: 2,
      max: 3,
    },
  }
)

const ExcelImportModel = mongoose.model('ExcelImport', ExcelImportSchema)

export default ExcelImportModel
