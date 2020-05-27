// pages/webview/index.js
Page({
  data: {

  },
  onLoad: function(options) {
    this.setData({
      url: options.url
    })
  },

  onShareAppMessage: function () {
    let url=this.data.url

    return {
      path: '/pages/index/index?page=' + 'webview&param=url&value=' + url
    }
  },

})