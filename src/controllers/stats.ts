import { Request, Response } from 'express'
import StatsModel, { IStats } from '../models/stats'
import logger from '../util/logger'

export const addStats = async (stats: IStats) => {
  try {
    const new_stats = new StatsModel(stats)
    await new_stats.save()
  } catch (err: any) {
    logger.error(err.message)
  }
}

export const getStats = async (req: Request, res: Response) => {
  try {
    const { start, end, product } = req.body
    console.log(new Date(start))
    console.log(new Date(end))

    const stats = await StatsModel.find({
      date: {
        $gte: new Date(start),
        $lte: new Date(end),
      },
      product,
    })

    res.status(200).send(stats)
  } catch (err: any) {
    logger.error(err.message)
    res.status(400).send(err.message)
  }
}
