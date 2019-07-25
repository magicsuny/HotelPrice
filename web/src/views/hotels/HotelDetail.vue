<template >
  <el-row :gutter="20" type="flex" justify="space-around">
    <el-col :span="4">
      <el-image :src="data.MainPhotoUrl" />
      <div class="block">
        <el-rate
          v-model="data.StarRating"
          disabled
          show-score
          :colors="colors"
        />
      </div>
      <el-tag v-for="highlight in data.Highlights" type="success" effect="plain">{{ highlight.title }}</el-tag>
    </el-col>
    <el-col :span="2" >
      <el-divider direction="vertical" class="hotelDetail"></el-divider>
    </el-col>
    <el-col :span="16">
      <ve-line :data="chartData" :data-zoom="dataZoom" :settings="chartSettings" :events="chartEvents" :mark-line="markLine" :mark-point="markPoint" />
    </el-col>
  </el-row>

</template>

<script>
import VeLine from 'v-charts/lib/line.common'
import 'echarts/lib/component/markLine'
import 'echarts/lib/component/markPoint'

export default {
  name: 'HotelDetail',
  components: {
    've-line': VeLine
  },
  props: {
    data: {
      type: Object,
      default: () => {}
    },
  },
  data() {
    const priceList = Object.values(this.data.Prices)
    priceList.sort(function(a, b) {
      if (a.formatDate < b.formatDate) {
        return -1
      }
      if (a.formatDate > b.formatDate) {
        return 1
      }
      return 0
    })
    const rows = []
    for (const item of priceList) {
      rows.push({
        '日期': item.formatDate,
        '价格': Math.round(item.DisplayPrice)
      })
    }
    this.chartSettings = {
      metrics: ['价格'],
      dimension: ['日期']
    }
    this.markLine = {
      data: [
        {
          name: '平均线',
          type: 'average'
        }
      ]
    }
    this.markPoint = {
      data: [
        {
          name: '最小值',
          type: 'min'
        }
      ]
    }
    this.dataZoom = [
      {
        type: 'slider',
        start: 0,
        end: 20
      }
    ]
    this.chartEvents = {
      click: (e) => {
        window.open(`https://www.agoda.com${this.data.Prices[e.name].url}`)
      }
    }
    return {
      chartData: {
        columns: ['日期', '价格', 'url'],
        rows: rows
      },
      colors: ['#99A9BF', '#F7BA2A', '#FF9900']
    }
  }
}
</script>

<style scoped>
  .el-divider--vertical{
    height:100%
  }
</style>
