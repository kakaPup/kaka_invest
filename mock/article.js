const Mock = require('mockjs')
const _512980JS = require('./data/512980')
const _515180JS = require('./data/515180')
const _159938JS = require('./data/159938')
const List = []
const count = 100

const baseContent = '<p>I am testing data, I am testing data.</p><p><img src="https://wpimg.wallstcn.com/4c69009c-0fd4-4153-b112-6cb53d1cf943"></p>'
const image_uri = 'https://wpimg.wallstcn.com/e4558086-631c-425c-9430-56ffb46e70b3'

for (let i = 0; i < count; i++) {
  List.push(Mock.mock({
    id: '@increment',
    timestamp: +Mock.Random.date('T'),
    author: '@first',
    reviewer: '@first',
    title: '@title(5, 10)',
    content_short: 'mock data',
    content: baseContent,
    forecast: '@float(0, 100, 2, 2)',
    importance: '@integer(1, 3)',
    'type|1': ['CN', 'US', 'JP', 'EU'],
    'status|1': ['published', 'draft'],
    display_time: '@datetime',
    comment_disabled: true,
    pageviews: '@integer(300, 5000)',
    image_uri,
    platforms: ['a-platform']
  }))
}
function setAllDataType(type) {
  let data = null
  switch (type) {
    case '中证传媒':
      data = _512980JS._512980JS
      break
    case '中证红利':
      data = _515180JS._515180JS
      break
    case '医药卫生':
      data = _159938JS._159938JS
      break
    default:
      data = _512980JS._512980JS
      break
  }
  return data
}

module.exports = [
  {
    url: '/vue-element-admin/article/listData',
    type: 'get',
    response: config => {
      console.log('获取数据')
      console.log(config.query)
      let rootData = _512980JS._512980JS
      const { dataType } = config.query

      rootData = setAllDataType(dataType)

      const result = getData(rootData, config.query)
      result.sort((a, b) => {
        return new Date(a.buyDate) - new Date(b.buyDate)
      }
      )
      return {
        code: 20000,
        data: {
          total: result.length,
          items: result
        }
      }
    }
  },
  {
    url: '/vue-element-admin/article/list',
    type: 'get',
    response: config => {
      console.log(_512980JS)
      const { importance, type, title, page = 1, limit = 20, sort } = config.query

      let mockList = List.filter(item => {
        if (importance && item.importance !== +importance) return false
        if (type && item.type !== type) return false
        if (title && item.title.indexOf(title) < 0) return false
        return true
      })

      if (sort === '-id') {
        mockList = mockList.reverse()
      }

      const pageList = mockList.filter((item, index) => index < limit * page && index >= limit * (page - 1))

      return {
        code: 20000,
        data: {
          total: mockList.length,
          items: pageList
        }
      }
    }
  },

  {
    url: '/vue-element-admin/article/detail',
    type: 'get',
    response: config => {
      const { id } = config.query
      for (const article of List) {
        if (article.id === +id) {
          return {
            code: 20000,
            data: article
          }
        }
      }
    }
  },

  {
    url: '/vue-element-admin/article/pv',
    type: 'get',
    response: _ => {
      return {
        code: 20000,
        data: {
          pvData: [
            { key: 'PC', pv: 1024 },
            { key: 'mobile', pv: 1024 },
            { key: 'ios', pv: 1024 },
            { key: 'android', pv: 1024 }
          ]
        }
      }
    }
  },

  {
    url: '/vue-element-admin/article/create',
    type: 'post',
    response: _ => {
      return {
        code: 20000,
        data: 'success'
      }
    }
  },

  {
    url: '/vue-element-admin/article/update',
    type: 'post',
    response: _ => {
      return {
        code: 20000,
        data: 'success'
      }
    }
  }
]

function getData(data, params) {
  // 初始化参考值和阈值
  let referencePrice = params?.referencePrice || 0.879 // 初始参考值为第一条数据的最高价
  const buyThreshold = params?.buyThreshold || 0.9 // 买入价格为参考值的 90%
  const sellThreshold = params?.sellThreshold || 1.1111 // 卖出价格为参考值的 111.11%
  const minPrice = params?.minPrice || 0.1 // 监控区间的最低价
  const maxPrice = params?.maxPrice || 5.7 // 监控区间的最高价
  const buyAmount = params?.buyAmount || 10000 // 每次买入金额
  const minStockUnit = 100 // 最小交易单位

  // 管理交易的栈和交易记录
  const stack = [] // 栈记录买入交易
  const transactions = [] // 记录所有交易

  data.forEach((entry) => {
    const { date, highPrice, lowPrice } = entry

    // 买入条件：最低价格 <= 当前参考值的 90%，且在监控区间内
    const buyPrice = parseFloat((referencePrice * buyThreshold).toFixed(3))
    if (
      lowPrice <= buyPrice &&
      buyPrice >= minPrice &&
      buyPrice <= maxPrice
    ) {
      const maxShares = Math.floor(buyAmount / buyPrice) // 买到的最多股数
      const sharesToBuy =
        Math.floor(maxShares / minStockUnit) * minStockUnit // 向下取整为 100 的倍数
      if (sharesToBuy > 0) {
        stack.push({
          date: date,
          price: buyPrice,
          referencePrice: referencePrice, // 买入时参考值
          shares: sharesToBuy // 买入股数
        })
        referencePrice = buyPrice // 更新参考值为买入价格
      }
    }

    // 卖出条件：最高价格 >= 当前参考值的 111.11%，且栈中有买入记录
    while (
      stack.length > 0 &&
      highPrice >= referencePrice * sellThreshold
    ) {
      const sellPrice = parseFloat(
        (referencePrice * sellThreshold).toFixed(3)
      ) // 卖出价格
      const buyRecord = stack.pop() // 出栈最近买入记录（FIFO）
      transactions.push({
        buyDate: buyRecord.date,
        buyPrice: buyRecord.price,
        buyReferencePrice: buyRecord.referencePrice, // 买入时参考值
        buyShares: buyRecord.shares,
        sellDate: date,
        sellPrice: sellPrice,
        sellReferencePrice: referencePrice, // 卖出时参考值
        // sellShares: buyRecord.shares * 0.8 // 卖出股数为买入股数的 80%
        sellShares: Math.floor(buyRecord.shares * 0.8 / 100) * minStockUnit
      })
      referencePrice = sellPrice // 更新参考值为卖出价格
    }
  })

  // 栈中未完成的交易记录保留
  stack.forEach((buyRecord) => {
    transactions.push({
      buyDate: buyRecord.date,
      buyPrice: buyRecord.price,
      buyReferencePrice: buyRecord.referencePrice,
      buyShares: buyRecord.shares,
      sellDate: null, // 未卖出
      sellPrice: null, // 未卖出
      sellReferencePrice: null, // 未卖出
      sellShares: null // 未卖出
    })
  })
  return transactions
  // 输出交易记录
  // console.log('交易记录：', transactions)
}

