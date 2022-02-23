import { Request, Response } from 'express'
import mongoose from 'mongoose'
import User from '../models/user'
import logger from '../util/logger'

export const superAdminUpdateUser = async (req: Request, res: Response) => {
  try {
    const { id, admin } = req.body
    if (!id || admin === undefined) throw new Error('Please fill in all fields')

    if (!mongoose.Types.ObjectId.isValid(id))
      throw new Error(`No user with id: ${id}`)

    const updatedUser = { admin }

    await User.findByIdAndUpdate(id, updatedUser, { new: true })
    res.status(200).json(updatedUser)
  } catch (err: any) {
    logger.error(err.message)
    res.status(400).send(err.message)
  }
}

export const superAdminGetUsers = async (req: any, res: Response) => {
  try {
    res.json(
      (await User.find({})).map(user => ({
        _id: user._id,
        email: user.email,
        admin: user.admin,
        super_admin: user.super_admin,
      }))
    )
  } catch (err: any) {
    logger.error(err.message)
    res.status(400).send(err.message)
  }
}
