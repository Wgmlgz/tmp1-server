import moment from 'moment'
import winston, { format } from 'winston'
const { combine, timestamp, label, printf } = format

const myFormat = printf(
  ({ level, message, timestamp }) =>
    `${moment(timestamp).format('DD-MM-YYYY:HH:mm')} ${level}: ${message}`
)

const logger = winston.createLogger({
  level: 'info',
  format: combine(timestamp(), myFormat),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
})
export default logger
