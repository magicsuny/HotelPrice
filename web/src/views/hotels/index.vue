<template>
  <div class="app-container">
    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
    >
      <el-table-column type="expand" align="center" label="序号" width="95">
        <hotel-detail slot-scope="scope" :data="scope.row">
        </hotel-detail>
      </el-table-column>
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
          <el-tag v-if="scope.row.minPrice.discount>0" class="discountTag" color="#67C23A">{{scope.row.minPrice.discount}}%off</el-tag>
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
      @current-change="pageChange"
      layout="prev, pager, next"
      :total="pagination.total">
    </el-pagination>
  </div>
</template>

<script>
  import {getList} from '@/api/hotel'
  import HotelDetail from './HotelDetail'

  export default {
    components: {HotelDetail},
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
            pageNumber:1,
            pageSize:20,
            total:0,
        },
        conditions:{

        },
      }
    },
    created() {
      this.fetchData()
    },
    methods: {
      fetchData() {
        Object.assign(this.conditions,this.pagination);
        this.listLoading = true
        getList(this.conditions).then(response => {
          this.list = response.data.rows
          this.pagination.total = response.data.total
          this.listLoading = false
        })
      },
      pageChange(page){
        this.pagination.pageNumber = page
        this.fetchData()
      }
    }
  }
</script>
<style>
.discountTag{
  color:black;
}
</style>
