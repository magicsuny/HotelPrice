import request from '@/utils/request'

export function getList(params) {

  return request({
    url: '/hotels',
    method: 'get',
    params: {
      pagesize: params.pageSize,
      pagenumber: params.pageNumber,
    }
  })
}
