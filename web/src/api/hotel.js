import request from '@/utils/request'

export function getList(params) {
  const queryData = {
    pagesize: params.pageSize,
    pagenumber: params.pageNumber,
    cityId: params.cityId
  }
  return request({
    url: '/hotels',
    method: 'get',
    params: queryData
  })
}

export function initCondition() {
  return request({
    url: '/cities',
    method: 'get'
  })
}
