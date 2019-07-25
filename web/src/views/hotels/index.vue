<template>
  <div class="app-container">
    <el-form :inline="true" :model="conditions" class="demo-form-inline">
      <el-form-item label="活动区域">
        <el-select v-model="conditions.cityId" placeholder="城市">
          <el-option v-for="city in conditionsData.cities" :label="city.cityName" :value="city.cityId" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onQuery">查询</el-button>
      </el-form-item>
    </el-form>
    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
    >
      <el-table-column type="expand" align="center" label="" width="95">
        <hotel-detail slot-scope="scope" :data="scope.row" />
      </el-table-column>
      <el-table-column type="index" :index="indexMethod" align="center" label="序号" width="95" />
      <el-table-column label="酒店名称">
        <template slot-scope="scope">
          {{ scope.row.HotelDisplayName }}
        </template>
      </el-table-column>
      <el-table-column class-name="status-col" label="最低价(三个月内)" width="110" align="center">
        <template slot-scope="scope">
          <!--<el-tag :type="scope.row.status | statusFilter">{{ scope.row.status }}</el-tag>-->
          ￥{{ scope.row.minPrice.price }}
        </template>
      </el-table-column>
      <el-table-column class-name="status-col" label="最高折扣(三个月内)" width="110" align="center">
        <template slot-scope="scope">
          <!--<el-tag :type="scope.row.status | statusFilter">{{ scope.row.status }}</el-tag>-->
          <el-tag v-if="scope.row.minPrice.discount>0" class="discountTag" color="#67C23A">
            {{ scope.row.minPrice.discount }}%off
          </el-tag>
          <el-tag v-if="scope.row.minPrice.discount===0" class="discountTag" color="#909399">无折扣</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="最低价日期(三个月内)" width="110" align="center">
        <template slot-scope="scope">
          <el-link :href="scope.row.minPrice.url" type="primary" target="_blank">{{ scope.row.minPrice.date }}</el-link>
        </template>
      </el-table-column>

    </el-table>
    <el-pagination
      :page-size="pagination.pageSize"
      :pager-count="9"
      :current-page="pagination.pageNumber"
      layout="prev, pager, next"
      :total="pagination.total"
      @current-change="pageChange"
    />
  </div>
</template>

<script>
import { getList, initCondition } from '@/api/hotel'
import HotelDetail from './HotelDetail'

export default {
  components: { HotelDetail },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'gray',
        deleted: 'danger'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      list: null,
      listLoading: true,
      pagination: {
        pageNumber: 1,
        pageSize: 50,
        total: 0
      },
      conditionsData: {},
      conditions: {}
    }
  },
  created() {
    this.initQuery()
    this.fetchData()
  },
  methods: {
    initQuery() {
      initCondition().then(response => {
        this.conditionsData.cities = response.data
      })
    },
    fetchData() {
      Object.assign(this.conditions, this.pagination)
      this.listLoading = true
      getList(this.conditions).then(response => {
        this.list = response.data.rows
        this.pagination.total = response.data.total
        this.listLoading = false
      })
    },
    pageChange(page) {
      this.pagination.pageNumber = page
      this.fetchData()
    },
    onQuery() {
      this.fetchData()
    },
    indexMethod(index) {
      return 1 + index + (this.pagination.pageNumber - 1) * this.pagination.pageSize
    }
  }
}
</script>
<style>
  .discountTag {
    color: black;
  }
</style>
