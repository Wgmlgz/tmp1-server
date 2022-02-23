import { Response } from 'express'
import UserModel, { IUser } from '../models/user'
import logger from '../util/logger'

export const getUser = (req: any, res: Response) => {
  res.json(req.user)
}

export const getSetting = async (req: any, res: Response) => {
  try {
    let setting = req.query['0']

    const req_user: IUser & { id: string } = (req as any).user

    const user = await UserModel.findById(req_user.id)
    res.status(200).json(user?.columns_settings?.get(setting) ?? new Map())
  } catch (err: any) {
    logger.error(err.message)
    res.status(400).send(err.message)
  }
}

export const setSetting = async (req: any, res: Response) => {
  try {
    let setting = req.query['0']
    let { new_val }: any = req.body

    const req_user: IUser & { id: string } = (req as any).user

    await UserModel.findByIdAndUpdate(req_user.id, {
      [`columns_settings.${setting}`]: new_val,
    })
  } catch (err: any) {
    logger.error(err.message)
    res.status(400).send(err.message)
  }
}
