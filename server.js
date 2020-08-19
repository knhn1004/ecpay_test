const express = require('express')
const dotenv = require('dotenv')
const morgan = require('morgan')
const connectDB = require('./config/db')
const qs = require('querystring')
const axios = require('axios')
const cryptoRandomString = require('crypto-random-string')
const { format } = require('date-fns')
const { createProxyMiddleware } = require('http-proxy-middleware')

const { generateCheckMacValue } = require('./utils/generateCheckMacValue')
dotenv.config({ path: './config/config.env' })

connectDB()

const app = express()
app.use(express.json({ extended: false }))

// app.use(express.static('public'))

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

app.get('/', (_, res) => {
  res.send('hello world')
})

const url = 'https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5'
const link = 'https://payment-stage.ecpay.com.tw'

app.use('/Content', createProxyMiddleware({ target: link, changeOrigin: true}))
app.use('/Scripts', createProxyMiddleware({ target: link, changeOrigin: true }))
app.use('/bundles', createProxyMiddleware({ target: link, changeOrigin: true }))

app.get('/gen_payment', async (req, res) => {
  const hashkey = '5294y06JbISpM5x9'
  const hashIV = 'v77hoKGq4kWxNNIS'
  const MerchantTradeNo = cryptoRandomString({ length: 20 })
  const body = {
    MerchantID: '2000132',
    // 訂單編號
    MerchantTradeNo,
    MerchantTradeDate: format(new Date(), 'yyyy/MM/dd HH:mm:ss'),
    PaymentType: 'aio',
    TotalAmount: 500,
    TradeDesc: 'ecpay test',
    ItemName: 'iphone 11',
    ReturnURL: `${process.env.PROJECT_URL}/return`,
    ChoosePayment: 'Credit',
    // CheckMacValue: '',
    EncryptType: 1,
  }
  body.CheckMacValue = generateCheckMacValue(body, hashkey, hashIV)
  console.log(body)

  console.log(qs.stringify(body))
  const response = await axios.post(url, qs.stringify(body), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })
  res.send(response.data)
})

// 回傳url （訂單成立）
app.post('return', (req, res) => {
  console.log('訂單建立成功！')
  // 訂單綠界回傳資料
  console.log(req.body)
  res.send('1|ok')
})

app.listen(3000, () => {
  console.log(
    'Server running on port 3000',
    format(new Date(), 'yyyy/MM/dd HH:mm:ss')
  )
})
