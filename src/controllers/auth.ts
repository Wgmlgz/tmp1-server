import jwt from 'jsonwebtoken'
import { Request, Response } from 'express'
import { NextFunction } from 'connect'
import User, { IUser } from '../models/user'
import RefreshToken from '../models/refresh_token'
import bcrypt from 'bcrypt'
import {
  ACCESS_TOKEN_EXPIRES,
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_EXPIRES,
  REFRESH_TOKEN_SECRET,
} from '../config/env'

export const authenticateUser = (
  req: any,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies['access-token']

  if (!token) {
    res.status(401).send('You are not logged in')
  } else {
    jwt.verify(token, ACCESS_TOKEN_SECRET as string, (err: any, user: any) => {
      if (err) res.status(401)
      else req.user = user
      next()
    })
  }
}

export const authenticateAdmin = (
  req: any,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies['access-token']

  if (!token) return res.status(401)
  jwt.verify(token, ACCESS_TOKEN_SECRET as string, (err: any, user: any) => {
    if (err) {
      res.status(401)
    } else if (!user.admin && !user.super_admin) {
      res.status(400).send('You are not super admin')
    } else {
      req.user = user
      next()
    }
  })
}

export const authenticateSuperAdmin = (
  req: any,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies['access-token']

  if (!token) return res.status(401)
  jwt.verify(token, ACCESS_TOKEN_SECRET as string, (err: any, user: any) => {
    if (err) {
      res.status(401)
    } else if (!user.super_admin) {
      res.status(400).send('You are not super admin')
    } else {
      req.user = user
      next()
    }
  })
}

export const generateAccessToken = (user: IUser) => {
  return jwt.sign(user, ACCESS_TOKEN_SECRET as string, {
    expiresIn: ACCESS_TOKEN_EXPIRES,
  })
}
export const generateRefreshToken = (user: IUser) => {
  return jwt.sign(user, REFRESH_TOKEN_SECRET as string, {
    expiresIn: REFRESH_TOKEN_EXPIRES,
  })
}
export const login = async (req: Request, res: Response) => {
  try {
    let { email, password } = req.body

    email = String(email)
    password = String(password)
    if (!email || !password) throw new Error('Please fill in all fields')

    const db_user = await User.findOne({ email: email })
    if (!db_user) throw new Error('email not registered')

    bcrypt.compare(password, db_user.password, async (err, isMatch) => {
      if (err) throw err
      if (!isMatch) {
        res.status(400).send('password is invalid')
      } else {
        const user = {
          id: db_user._id,
          email,
          password,
          admin: db_user.admin,
          super_admin: db_user.super_admin,
        }

        const access_token = generateAccessToken(user)
        const refresh_token = generateRefreshToken(user)

        const new_refresh_token = new RefreshToken({ token: refresh_token })
        await new_refresh_token.save()

        res.cookie('access-token', access_token, { httpOnly: true })
        res.cookie('refresh-token', refresh_token, { httpOnly: true })

        res.json({})
      }
    })
  } catch (err: any) {
    res.status(400).send(err.message)
  }
}

export const token = async (req: Request, res: Response) => {
  const refreshToken = req.cookies['refresh-token']

  if (refreshToken == null) return res.sendStatus(403)

  if (!(await RefreshToken.exists({ token: refreshToken })))
    return res.sendStatus(403)

  jwt.verify(
    refreshToken,
    REFRESH_TOKEN_SECRET as string,
    (err: any, user: any) => {
      if (err) return res.sendStatus(403)
      const access_token = generateAccessToken({
        email: String(user.email),
        password: String(user.password),
        admin: Boolean(user.admin),
        super_admin: Boolean(user.super_admin),
      })
      res.cookie('access-token', access_token, { httpOnly: true })
      res.json()
    }
  )
}

export const logout = (req: Request, res: Response) => {
  res.clearCookie('refresh-token')
  res.clearCookie('access-token')
  RefreshToken.deleteOne({ token: req.cookies['refresh-token'] }).then(() =>
    res.sendStatus(204)
  )
}

export const register = (req: Request, res: Response) => {
  try {
    let { email, password }: IUser = req.body
    email = String(email)
    password = String(password)

    if (!email || !password) throw new Error('Please fill in all fields')
    if (password.length < 3)
      throw new Error('Password must be at least 3 characters')
    if (
      !email.match(
        /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      )
    )
      throw new Error('Email is invalid')

    User.findOne({ email }, async (err: Error, doc: IUser) => {
      if (err) throw err
      if (doc) {
        return res.status(400).send('User Already Exists')
      }
      const hashed_password = await bcrypt.hash(req.body.password, 10)
      const new_user = new User({
        email,
        password: hashed_password,
        admin: false,
        super_admin: false,
      })
      await new_user.save()
      res.send('User Created')
    })
  } catch (err: any) {
    res.status(400).send(err.message)
  }
}
