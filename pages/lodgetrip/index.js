// pages/lodgetrip/index.js
import {
  $wuxToast
} from '../../dist/index'

const db = wx.cloud.database();
const _ = db.command;

Page({
  data: {
    count: 0,
    scrollTop: 0,
    lodge: '',
    notrip: false,
    neterror: false,
    reloadbutton: [{
      text: '点击刷新',
    }],
    items: [{
        type: 'sort',
        label: '开始时间',
        value: 'start_date',
        groups: ['001'],
      },
      {
        type: 'sort',
        label: '价格',
        value: 'price',
        groups: ['002'],
      },
      {
        type: 'filter',
        label: '筛选',
        value: 'filter',
        children: [{
            type: 'checkbox',
            label: '雪季',
            value: 'season',
            children: [{
                label: '2019-20雪季',
                value: 'S20',
              },
              {
                label: '2020-21雪季',
                value: 'S21',
              },
            ],
          },
          {
            type: 'checkbox',
            label: '月份',
            value: 'startmonth',
            children: [{
                label: '12月',
                value: '12',
              },
              {
                label: '1月',
                value: '01',
              },
              {
                label: '2月',
                value: '02',
              },
              {
                label: '3月',
                value: '03',
              },
              {
                label: '4月',
                value: '04',
              },
            ],
          },
          {
            type: 'checkbox',
            label: '行程类型',
            value: 'trip_type',
            children: [{
                label: '经典直滑',
                value: '经典直滑',
              },
              {
                label: '深粉入门',
                value: '深粉入门',
              },
              {
                label: '小组直滑',
                value: '小组直滑',
              },
              {
                label: '极陡坡与枕头包',
                value: '极陡坡与枕头包',
              },
              {
                label: '专属包机',
                value: '专属包机',
              },
              {
                label: '深粉大师',
                value: '深粉大师',
              },
              {
                label: '家庭直滑',
                value: '家庭直滑',
              },
              {
                label: '登山滑雪',
                value: '直升机辅助的登山滑雪',
              },
              {
                label: '直滑登滑混合',
                value: '直滑登滑混合',
              },
            ],
          },
          {
            type: 'checkbox',
            label: '只显示有位置的行程',
            value: 'spaces_available',
            children: [{
              label: '是',
              value: 'Y',
            }, ],
          },
        ],
        groups: ['001', '002'],
      },
    ]
  },

  onLoad(params = {}) {
    console.log(params)
    this.setData({
      lodge: params.lodge
    })

    params.trip_activity = 'ski'

    this.getTrips(params)
  },

  onShareAppMessage: function () {
    let lodge = this.data.lodge
    let title = '我正搜索' + lodge + '基地的直升机滑雪行程，一起看看吧！'

    return {
      title: title,
      path: '/pages/index/index?page=' + 'lodgetrip&param=lodge&value=' + lodge
    }
  },

  reloadPage() {

    let params = this.data.params
    console.log('reload, param', params)
    this.onLoad(params)
  },

  onChange(e) {
    const {
      checkedItems,
      items
    } = e.detail

    console.log('事件详情', e)
    const params = {}

    console.log(checkedItems, items)

    checkedItems.forEach((n) => {
      if (n.checked) {
        if (n.value === 'start_date') {
          params.sort = n.value
          params.order = n.sort === 1 ? 'asc' : 'desc'
        } else if (n.value === 'price') {
          params.sort = n.value
          params.order = n.sort === 1 ? 'asc' : 'desc'
        } else if (n.value === 'filter') {
          n.children.filter((n) => n.selected).forEach((n) => {
            if (n.value === 'season') {
              const selected = n.children.filter((n) => n.checked).map((n) => n.value).join(',')
              params.season = selected
            } else if (n.value === 'startmonth') {
              const selected = n.children.filter((n) => n.checked).map((n) => n.value).join(',')
              params.startmonth = selected
            } else if (n.value === 'trip_type') {
              const selected = n.children.filter((n) => n.checked).map((n) => n.value).join(',')
              params.trip_type = selected
            } else if (n.value === 'spaces_available') {
              const selected = n.children.filter((n) => n.checked).map((n) => n.value).join(',')
              params.spaces_available = selected
            }
          })
        }
      }
    })
    params.trip_activity = 'ski' //目前只支持查看滑雪行程
    params.lodge = this.data.lodge //lodge使用当前页面参数
    this.getTrips(params)
    this.setData({
      count: 0 //分页数据重置
    })
  },
  getTrips(params = {}) {
    const sort = params.sort || 'start_date'
    const order = params.order || 'asc'
    var tripfilter = {}

    console.log(params)
    this.setData({
      params: params
    })

    for (var i in params) {
      switch (i) {
        case 'season':
          var list = params[i].split(",");
          tripfilter[i] = _.in(list);
          break;
        case 'startmonth':
          var list = params[i].split(",");
          tripfilter[i] = _.in(list);
          break;
        case 'lodge':
          var list = params[i].split(",");
          tripfilter[i] = _.in(list);
          break;
        case 'trip_activity':
          tripfilter[i] = params[i];
          break;
        case 'trip_type':
          var list = params[i].split(",");
          if (list.indexOf('深粉入门') != -1) list.push('深粉入门（女士专场）');
          if (list.indexOf('直升机辅助的登山滑雪') != -1) list.push('小组登滑');
          if (list.indexOf('家庭直滑') != -1) {
            list.push('家庭直滑（深粉入门）');
            list.push('家庭小组直滑');
          }
          tripfilter[i] = _.in(list);
          break;
        case 'spaces_available':
          tripfilter[i] = _.gt(0);
          break;
        default:
          break;
      }
    }
    console.log(tripfilter)


    wx.showLoading()
    db.collection('cmhtrip01').orderBy(sort, order).where(
      tripfilter
    ).get().then(res => {
      if (res.data.length == 0) this.setData({
        notrip: true,
        neterror: false,
      });
      else this.setData({
        notrip: false,
        neterror: false,
      })
      this.setData({
        tripdata: res.data,
        sort: sort,
        order: order,
        tripfilter: tripfilter,
        newdata: res.data.length
      })
      wx.hideLoading()
    }, err => {
      this.setData({
        neterror: true,
        tripdata: [],
        sort: sort,
        order: order,
        tripfilter: tripfilter,
        notrip: false,
      })
      wx.hideLoading()
      $wuxToast().show({
        type: 'forbidden',
        duration: 1500,
        color: '#fff',
        text: '查询失败，请重试',
        success: () => {
          console.log('查询失败')
        }
      });
    })
  },
  onOpen(e) {
    this.setData({
      pageStyle: 'height: 100%; overflow: hidden',
    })
    console.log('onOpen', e)
  },
  onClose(e) {
    this.setData({
      pageStyle: '',
    })
    console.log('onClose', e)
  },

  onReachBottom() {
    const sort = this.data.sort
    const order = this.data.order
    const tripfilter = this.data.tripfilter
    let count = this.data.count + 20;
    console.log('onLoadmore', count, sort, order, tripfilter)

    if (this.data.newdata == 20) { //newdata=20说明可能有下一页行程数据
      wx.showLoading()
      db.collection('cmhtrip01').orderBy(sort, order).where(
        tripfilter
      ).skip(count).get().then(res => {
        wx.hideLoading()
        let newdata = res.data
        let olddata = this.data.tripdata

        this.setData({
          tripdata: olddata.concat(newdata),
          count: count,
          newdata: newdata.length
        })
      })
    } else {
      $wuxToast().show({
        type: 'forbidden',
        duration: 1500,
        color: '#fff',
        text: '只有这些符合条件的行程',
        success: () => console.log('没有更多行程')
      })
    }
  },
  ontripTap(e) {
    let trip = JSON.stringify(e.currentTarget.dataset)
    console.log('tripclick', trip)
    wx.navigateTo({
      url: '../bookform/index?trip=' + trip,
    })
  },
  onTabBarChange(e) {

    if (e.detail.key != this.data.current) {
      console.log('onTabChange', e)
      switch (e.detail.key) {
        case '0':
          wx.switchTab({
            url: '../index/index'
          });
          this.setData({
            current: '0'
          });
          break;
        case '1':
          wx.switchTab({
            url: '../mytrip/index'
          });
          this.setData({
            current: '1'
          });
          break;
        case '2':
          wx.switchTab({
            url: '../tripfinder/index'
          });
          this.setData({
            current: '2'
          });
          break;
      }

    }
    this.setData({
      current: e.detail.key,
    })
  },
})