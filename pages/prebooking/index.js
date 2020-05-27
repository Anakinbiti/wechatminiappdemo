// pages/prebooking/index.js
import {
  $wuxSelect
} from '../../dist/index'
import {
  $wuxToast
} from '../../dist/index'

const db = wx.cloud.database()

Page({
  data: {
    guests: [],
    noguests: false,
    neterror: false,
    reloadbutton: [{
      text: '点击刷新',
    }],
    addbutton: [{
      text: '点击添加',
    }],
    comment: '',
    confirmpreorder: false,
    submitting: false,
    buttontext: '提交',
  },

  onLoad(options) {
    let trip = JSON.parse(options.trip)
    console.log(trip)
    this.setData({
      trip: trip,
      options: options.trip
    })
  },

  onShow() {

    var app = getApp();
    var openid = app.globalData.openid;

    wx.showLoading()
    db.collection('contact').where({
      _openid: openid // 填入当前用户 openid
    }).get().then(res => {

      console.log(res.data)
      for (var i in res.data) {
        res.data[i].roomtype = '双人标间'
        res.data[i].intrip = false
      }
      this.setData({
        guests: res.data
      })
      if (this.data.guests.length == 0) this.setData({
        noguests: true
      })
      wx.hideLoading()
    }, err => {
      wx.hideLoading()
      if (this.data.guests.length == 0) this.setData({
        neterror: true
      })
      $wuxToast().show({
        type: 'forbidden',
        duration: 1500,
        color: '#fff',
        text: '查询常用客人列表失败，请重试',
        success: () => console.log('查询失败')
      });
    })
  },

  onShareAppMessage: function () {
    let lodge = this.data.trip.lodge
    let title = '我正在预定CMH ' + lodge + '的直升机滑雪行程，一起看看吧！'
    let trip = JSON.stringify(this.data.trip)

    return {
      title: title,
      path: '/pages/index/index?page=' + 'prebooking&param=trip&value=' + trip,
      imageUrl: '/images/sharecover.jpg'
    }
  },

  reloadPage() {
    this.onShow()
  },

  tapLodgeIntro() {
    let lodge = this.data.trip.lodge
    console.log('跳转到', lodge, '介绍')

    wx.navigateTo({
      url: '../cmhlodge/index?lodge=' + lodge,
    })
  },

  addContact() {
    let guest = {
      _id: "",
      _openid: "",
      birthday: "",
      created: "",
      emailvalue: "",
      gender: "male",
      height: "",
      mobilevalue: "",
      name: "",
      updated: "",
      weight: "",
      /*
      roomtype: "双人标间",
      intrip: false
      */
    }
    let guestinfo = JSON.stringify(guest)
    //  let guestindex = this.data.guests.length
    wx.navigateTo({
      url: '../guestinfo/index?guestinfo=' + guestinfo
      // + '&guestindex=' + guestindex,
    })
  },

  onguestSelect(e) {
    console.log('checkbox发生change事件，携带value值为：', e.detail.value)
    let guestindex = e.detail.value
    let currentvalue = this.data.guests[guestindex].intrip

    var tripguestupdate = 'guests[' + guestindex + '].intrip';
    this.setData({
      [tripguestupdate]: !currentvalue,
    })

  },
  onguestClick(e) {
    console.log(e)
    let guestindex = e.target.dataset.guestindex

    $wuxSelect('#wux-roomselect').open({
      value: e.target.dataset.roomtype,
      options: [
        '双人标间',
        '单人间',
        '双人大床',
        '更改客户资料',
      ],
      toolbar: {
        title: '选项',
        cancelText: '取消',
        confirmText: '确定',
      },
      onConfirm: (value, index, options) => {
        console.log('onConfirm', value, index, options)
        if (value == '更改客户资料') //跳转到客户信息编辑界面
        {
          let guestinfo = JSON.stringify(this.data.guests[guestindex])
          console.log('跳转参数', guestinfo, guestindex)
          wx.navigateTo({
            url: '../guestinfo/index?guestinfo=' + guestinfo
            // + '&guestindex=' + guestindex,
          })
        } else if (index !== -1) { //否则更新房间选择数据
          var guestroomupdate = 'guests[' + guestindex + '].roomtype';
          this.setData({
            [guestroomupdate]: value,
          })
        }
      },
    })
  },

  formSubmit() {
    let guests = this.data.guests
    let trip = this.data.trip
    var intripguests = []

    for (var i in guests) {
      if (guests[i].intrip) intripguests.push(guests[i])
    }

    if (intripguests.length == 0) {
      $wuxToast().show({
        type: 'forbidden',
        duration: 1500,
        color: '#fff',
        text: '请勾选参加行程的客人',
        success: () => console.log('请勾选参加行程的客人')
      })
    } else {
      this.setData({
        confirmpreorder: true,
      })
      console.log('form发生了submit事件', trip, intripguests.length)
    }
  },

  addBooking() {
    let guests = this.data.guests
    let tour_alias = this.data.trip.tour_alias
    var intripguests = []

    for (var i in guests) {
      if (guests[i].intrip) intripguests.push(guests[i])
    }

    this.setData({
      submitting: true,
      buttontext: '正在提交',
    })

    let openid = getApp().globalData.openid
    console.log('全局数据openid', openid)

    db.collection('prebooking').where({
      _openid: 'xxx',
      tour_alias: tour_alias
    }).get().then(res => {
      console.log(res.data)
      if (res.data.length == 0) {
        db.collection('prebooking').add({
          data: {
            "tour_alias": tour_alias,
            "intripguests": intripguests,
            "comment": this.data.comment,
            "updated": db.serverDate(),
            "created": db.serverDate(),
          }
        }).then(res => {
            console.log(res);
            this.setData({
              submitting: false,
              buttontext: '提交',
            })
            $wuxToast().show({
              type: 'success',
              duration: 1500,
              color: '#fff',
              text: '意向报名已经提交',
              success: () => {
                wx.navigateBack({
                  delta: 1
                })
              }
            })
          },
          err => {
            $wuxToast().show({
              type: 'forbidden',
              duration: 1500,
              color: '#fff',
              text: '提交失败，请重试',
              success: () => console.log('提交失败')
            });
            this.setData({
              submitting: false,
              buttontext: '提交',
            })
          })
      } else if (res.data.length == 1) {
        let id = res.data[0]._id

        db.collection('prebooking').doc(id).update({
          data: {
            "intripguests": intripguests,
            "comment": this.data.comment,
            "updated": db.serverDate()
          }
        }).then(res => {
            console.log(res);
            this.setData({
              submitting: false,
              buttontext: '提交',
            })
            $wuxToast().show({
              type: 'success',
              duration: 1500,
              color: '#fff',
              text: '意向报名已经更新',
              success: () => {
                wx.navigateBack({
                  delta: 1
                })
              }
            })
          },
          err => {
            $wuxToast().show({
              type: 'forbidden',
              duration: 1500,
              color: '#fff',
              text: '提交失败，请重试',
              success: () => console.log('提交失败')
            });
            this.setData({
              submitting: false,
              buttontext: '提交',
            })
          })
      }
    })
  },

  confirmPopup() {
    this.setData({
      confirmpreorder: false
    })
    this.addBooking()
  },
  closePopup() {
    this.setData({
      confirmpreorder: false
    })
  },

  onComment(e) {
    console.log(e)
    this.setData({
      comment: e.detail.value
    })
  }
})