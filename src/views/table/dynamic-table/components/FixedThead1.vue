<template>
  <div class="app-container">
    <div class="filter-container">
      <el-checkbox-group v-model="checkboxVal">
        <el-checkbox label="apple"> apple </el-checkbox>
        <el-checkbox label="banana"> banana </el-checkbox>
        <el-checkbox label="orange"> orange </el-checkbox>
      </el-checkbox-group>
    </div>

    <el-table
      :key="key"
      :data="tableData"
      border
      fit
      highlight-current-row
      style="width: 100%"
    >
      <el-table-column prop="buyDate" label="购买日期" />
      <el-table-column prop="buyPrice" label="购买价格" />
      <el-table-column prop="buyReferencePrice" label="参考值" />
      <el-table-column prop="buyShares" label="购买股数" />
      <el-table-column prop="sellDate" label="卖出日期" />
      <el-table-column prop="sellPrice" label="卖出价格" />
      <el-table-column prop="sellReferencePrice" label="参考值" />
      <el-table-column prop="sellShares" label="卖出股数" />
    <!-- <el-table-column v-for="fruit in formThead" :key="fruit" :label="fruit">
      <template slot-scope="scope">
          {{ scope.row[fruit] }}
        </template>
      </el-table-column> -->
    </el-table>
  </div>
</template>

<script>
import _512980JS from '../json/512980.js'
const defaultFormThead = ['apple', 'banana']

export default {
  data() {
    return {
      tableData: [
        {
          name: 'fruit-1',
          apple: 'apple-10',
          banana: 'banana-10',
          orange: 'orange-10'
        },
        {
          name: 'fruit-2',
          apple: 'apple-20',
          banana: 'banana-20',
          orange: 'orange-20'
        }
      ],
      key: 1, // table key
      formTheadOptions: ['apple', 'banana', 'orange'],
      checkboxVal: defaultFormThead, // checkboxVal
      formThead: defaultFormThead // 默认表头 Default header
    }
  },
  watch: {
    // checkboxVal(valArr) {
    //   this.formThead = this.formTheadOptions.filter(
    //     (i) => valArr.indexOf(i) >= 0
    //   )
    //   this.key = this.key + 1 // 为了保证table 每次都会重渲 In order to ensure the table will be re-rendered each time
    // }
  },
  created() {
    this.test3()
  },
  methods: {
    test3() {
      const data = _512980JS._512980JS

      // 初始化参考值和阈值
      let referencePrice = 1.328 // 初始参考值为第一条数据的最高价
      const buyThreshold = 0.9 // 买入价格为参考值的 90%
      const sellThreshold = 1.1111 // 卖出价格为参考值的 111.11%
      const minPrice = 0.1 // 监控区间的最低价
      const maxPrice = 5.7 // 监控区间的最高价
      const buyAmount = 10000 // 每次买入金额
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
            sellShares: Math.floor(buyRecord.shares * 0.8 / 100) * minStockUnit // 卖出股数为买入股数的 80%
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
      this.tableData = transactions
      // 输出交易记录
      console.log('交易记录：', transactions)
    }
  }
}
</script>
