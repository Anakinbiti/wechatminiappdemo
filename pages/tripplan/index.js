// pages/tripplan/index.js
const db = wx.cloud.database();

Page({

  data: {
    tripplan: {}
  },

  onLoad: function(options) {
    console.log(options.season)
    wx.showLoading()
    let season_search = '^' + options.season.slice(0, 7)
    console.log(season_search)
    db.collection('tripplan').where({
      season: db.RegExp({
        regexp: season_search,
        options: 'i',
      })
    }).get().then(res => {
      console.log(res.data)
      this.setData({
        tripplan: res.data[0]
      })
      wx.hideLoading()
    })

  },

  onShareAppMessage: function() {
    let season = this.data.tripplan.season
    let title = season + '我想去直升机滑雪，一起看看吧！'

    return {
      title: title,
      path: '/pages/index/index?page=' + 'tripplan&param=season&value=' + season
    }
  },

  joinTrip(e) {
    let plan_type = this.data.tripplan.type
    let that = this
    if (plan_type == 'official') {
      let tour_alias = e.currentTarget.dataset.alias
      console.log(tour_alias)
      let selection = e.currentTarget.dataset.selection
      console.log(selection)
      if (selection.length > 0) {
        let itemList = []
        for (var i in selection) itemList.push(selection[i].trip_name)
        console.log(itemList)
        wx.showActionSheet({
          itemList: itemList,
          success(res) {
            console.log(res.tapIndex)
            let tour_alias = selection[res.tapIndex].tour_alias
            that.bookTrip(tour_alias)
          },
          fail(res) {
            console.log(res.errMsg)
          }
        })
      } else this.bookTrip(tour_alias)
    } else if (plan_type == 'pre-earlybird') {
      let trip_index = e.currentTarget.dataset.index
      console.log(trip_index)
      let trip = JSON.stringify(this.data.tripplan.trips[trip_index])

      console.log('预报名: ', trip)
      wx.navigateTo({
        url: '../prebooking/index?trip=' + trip,
      })
    }
  },

  bookTrip(tour_alias) {
    db.collection('cmhtrip01').where({
      tour_alias: tour_alias
    }).get().then(res => {
      console.log(res.data[0])
      let trip = JSON.stringify(res.data[0])
      console.log('点击报名', trip)
      wx.navigateTo({
        url: '../bookform/index?trip=' + trip,
      })
    })
  }
})