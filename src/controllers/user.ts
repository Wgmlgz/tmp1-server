import { Response } from "express"

export const getUser = (req: any, res: Response) => {
  res.json(req.user.email)
}
