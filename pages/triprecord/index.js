// pages/triprecord/index.js
const db = wx.cloud.database();

Page({
  data: {
    no_record: false,
    prompt: {
      title: '没有已经完成的行程记录',
      text: '现在就预订您的梦幻之旅吧！',
      buttons: [{
        text: '马上预定',
      }],
    },
  },

  onLoad: function(options) {
    let guestid = options.guestid

    console.log(guestid)
    this.setData({
      guestid: guestid
    })

    db.collection('triprecord').where({ //获取行程记录数据
      guestid: guestid,
      fx_status: 'normal'
    }).orderBy('start_date', 'desc').get().then(res => {

      let triprecord = res.data
      let today = new Date()

      console.log(triprecord)
      if (triprecord.length > 0) {
        for (var i in triprecord) {
          let start_date = new Date(triprecord[i].start_date)
          let end_date = new Date(triprecord[i].end_date)

          triprecord[i].start_date_str = start_date.toLocaleDateString().replace(/\//g, '-') //转成时间字符后把'/'替换成'-'，统一时间格式为xxxx-xx-xx
          triprecord[i].end_date_str = end_date.toLocaleDateString().replace(/\//g, '-')
        }
        console.log(triprecord)
        this.setData({
          triprecord: triprecord
        })
      } else {
        console.log('没有记录')
        this.setData({
          no_record: true
        })
      }
    })
  },

  onShareAppMessage: function() {
    let guestid = this.data.guestid

    return {
      title: '我在CMH直升机滑雪的行程记录，一起看看吧！',
      path: '/pages/index/index?page=' + 'triprecord&param=guestid&value=' + guestid
    }
  },

  newBooking() {
    wx.switchTab({
      url: '../tripfinder/index',
    })
  },
})