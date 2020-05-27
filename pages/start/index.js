// pages/start/index.js
const App = getApp();

Page({
  data: {

  },
  onLoad() {
    this.bindload();
  },

  onShow() {
    var title_animation = wx.createAnimation({
      duration: 3000
    })

    title_animation.opacity(1).step({
      duration: 1500
    })

    var image_animation = wx.createAnimation({
      duration: 3000
    })

    image_animation.scale(1.1).step({
      duration: 3000
    })

    this.setData({
      title_animation: title_animation.export(),
      image_animation: image_animation.export()
    })
  },

  onShareAppMessage: function () {
    let title = '我想去直升机滑雪，一起看看吧！'

    return {
      title: title,
      path: '/pages/start/index',
      imageUrl: '/images/sharecover.jpg'
    }
  },

  bindload() {
    setTimeout(this.goIndex,
      3000)
  },
  goIndex() {
    console.log('goindex')
    wx.switchTab({
      url: '/pages/index/index'
    })
  }
})