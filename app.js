//app.js
App({
  onLaunch: function() {
    const self = this;
    wx.getSystemInfo({
      success(res) {
        self.systemInfo = res;
      },
    });
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true,
        env: 'mvfcminiprogram-k997i'
      })
    }

    this.globalData = {
      hasLogin: false,
      openid: null
    }

    //存储新用户的openid或者更新访问时间
    wx.cloud.callFunction({
      name: 'updateuser'
    }).then(res => {
      console.log(res.result);
      this.globalData.openid = res.result;
    })
  }
})