// pages/cmhlodge/index.js
import {
  $wuxToast
} from '../../dist/index'
const db = wx.cloud.database();

Page({
  data: {
    tour_popup: false,
    show_guide: false,
    lodge_logo: ''
  },

  onLoad: function (options) {
    console.log(options.lodge)
    if (options.lodge == "Valdez") {
      this.setData({
        lodge_name: options.lodge,
        lodge_logo: '../../images/VHSGLogo.png'
      })
    } else {
      this.setData({
        lodge_name: options.lodge,
        lodge_logo: '../../images/CMHLogo.png'
      })
    }

    wx.showLoading()
    db.collection('lodgeinfo').where({
      name: options.lodge
    }).get().then(res => {
      console.log(res.data)
      console.log(res.data[0].guideurl != '')
      console.log(res.data[0].tour != res.data[0].tour.length != 0)
      let show_guide = (res.data[0].guideurl != '') || (res.data[0].tour.length != 0)
      this.setData({
        lodge: res.data[0],
        show_guide: show_guide
      })
      wx.hideLoading()
    })
  },

  onShareAppMessage: function () {
    let lodge = this.data.lodge_name
    let title = '我想去' + lodge + '基地直升机滑雪，一起看看吧！'

    return {
      title: title,
      path: '/pages/index/index?page=' + 'cmhlodge&param=lodge&value=' + lodge
    }
  },

  findTrip(e) {
    let lodge = this.data.lodge_name
    console.log('跳转到' + lodge + '的行程')

    wx.navigateTo({
      url: '../lodgetrip/index?lodge=' + lodge,
    })
  },

  tapGuide(e) {
    let url = this.data.lodge.guideurl

    if (url == '') {
      $wuxToast().show({
        type: 'text',
        duration: 1500,
        color: '#fff',
        text: '暂时没有相关的攻略',
        success: () => console.log('文本提示')
      })
    } else {
      wx.navigateTo({
        url: '../webview/index?url=' + url,
      })
    }
  },

  tapTour(e) {
    let tour = this.data.lodge.tour
    console.log(tour.length)
    if (tour.length > 1) {
      console.log('弹选择列表')
      this.setData({
        tour_popup: true,
      })
    } else if (tour.length == 1) {
      console.log('直接跳转')
      let url = this.data.lodge.tour[0].url

      wx.navigateTo({
        url: '../webview/index?url=' + url,
      })
    } else {
      console.log('没有游记')

      $wuxToast().show({
        type: 'text',
        duration: 1500,
        color: '#fff',
        text: '暂时没有相关的游记',
        success: () => console.log('文本提示')
      })
    }
  },

  onClose() {
    console.log('onClose')
    this.setData({
      tour_popup: false,
    })
  },

  selectTour(e) {
    console.log(e)
  }

})