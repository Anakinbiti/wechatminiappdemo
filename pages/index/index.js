// pages/home/index.js
const db = wx.cloud.database();
const App = getApp();

Page({
  data: {
    swiperList: [
      {
        id: 0,
        type: 'image',
        url: "../../images/planvhsg.jpg",
        season: 'Valdez Heliski Guides'
      },
      {
        id: 1,
        type: 'image',
        url: "../../images/plan2020.jpg",
        season: '2020-21雪季'
      }
    ],
    windowWidth: App.systemInfo.windowWidth,
    //current: '0',
    currentswiper: 0
  },

  onLoad: function (options) {
    console.log(options)
    if (options.page != null) {
      let page = options.page
      let param = options.param
      let value = options.value

      if (page == 'bookform' && param == 'tour_alias') { //使用tour_alias跳转到bookform需要先去数据库查询行程信息再跳转
        let ngcto = ''
        if (options.ngcto != null) ngcto = '&ngcto=' + options.ngcto

        db.collection('cmhtrip01').where({
          tour_alias: value
        }).get().then(res => {
          console.log(res.data[0])
          let trip = JSON.stringify(res.data[0])
          console.log('使用tour_alias跳转报名', trip)
          wx.navigateTo({
            url: '../bookform/index?trip=' + trip + ngcto,
          })
        })
      } else {
        console.log('跳转到' + '../' + page + '/index?' + param + '=' + value)
        wx.navigateTo({
          url: '../' + page + '/index?' + param + '=' + value,
        })
      }
    }
  },

  onShareAppMessage: function () {
    let title = '我想去直升机滑雪，一起看看吧！'

    return {
      title: title,
      path: '/pages/start/index'
    }
  },

  swiperChange(e) {
    this.setData({
      currentswiper: e.detail.current
    })
  },

  swiperClick(e) {
    console.log(e)
    let currentswiper = this.data.currentswiper
    let trip_season = this.data.swiperList[currentswiper].season

    console.log(trip_season)
    wx.navigateTo({
      url: '../tripplan/index?season=' + trip_season,
    })
  },

  /*
  onTabBarChange(e) {

    if (e.detail.key != this.data.current) {
      console.log('onTabChange', e)
      switch (e.detail.key) {
        case '0':
          wx.switchTab({
            url: '../index/index'
          });
          this.setData({
            current:'0'
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
  */

  tapLodge(e) {
    let lodge = e.currentTarget.id
    console.log('跳转到' + lodge)
    wx.navigateTo({
      url: '../cmhlodge/index?lodge=' + lodge,
    })
  }
})