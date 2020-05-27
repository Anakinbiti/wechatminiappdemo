// pages/bookform/index.js
import {
  $wuxSelect
} from '../../dist/index'
import {
  $wuxToast
} from '../../dist/index'
import {
  $wuxDialog
} from '../../dist/index'

const db = wx.cloud.database()
const isWhsid = (value) => !/^00\d{6}$/.test(value)

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
    confirmwaitlist: false,
    waitlist: false,
    comment: '',
    ngc_to_whsid: '',
    ngc_to_name: '',
    whsid_error: false,
    submitting: false,
    buttontext: '提交',
  },

  onLoad(options) {
    let trip = JSON.parse(options.trip)
    console.log(trip)
    this.setData({
      options: options.trip,
      trip: trip
    })

    if (options.ngcto != null) {
      console.log(options.ngcto)
      this.setData({
        ngc_to_whsid: options.ngcto
      })
      this.validateNgc(options.ngcto)
    }
    var app = getApp();
    var openid = app.globalData.openid;

    db.collection('booking').where({
      _openid: openid // 填入当前用户 openid
    }).count().then(res => {
      console.log(res.total)
      if (res.total >= 10) {
        db.collection('whitelist').where({
          open_id: openid // 填入当前用户 openid
        }).count().then(res => {
          if (res.total == 0) {
            $wuxDialog().open({
              resetOnClose: true,
              maskClosable: false,
              content: '您的待确认订单过多，请耐心等待我们处理您的现有订单，也可以联系我们放开限制',
              buttons: [{
                  text: '联系我们',
                  openType: 'contact',
                  sendMessageTitle: '申请解除订单数量限制',
                  showMessageCard: true,
                  onTap(e) {
                    wx.navigateBack({
                      delta: 1
                    })
                  },
                },
                {
                  text: '返回',
                  type: 'primary',
                  onTap(e) {
                    wx.navigateBack({
                      delta: 1
                    })
                  },
                },
              ],
            })
          }
        })
      }
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
      });
      else this.setData({
        noguests: false
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
    let title = '我正在预定' + lodge + '基地的直升机滑雪行程，一起看看吧！'
    let tour_alias = this.data.trip.tour_alias

    return {
      title: title,
      path: '/pages/index/index?page=' + 'bookform&param=tour_alias&value=' + tour_alias,
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

  formSubmit(e) {
    console.log('formsubmit:', e)
    let formId = e.detail.formId
    this.setData({
      formId: formId
    })

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
    } else if (intripguests.length > trip.spaces_available) {
      console.log('机位数不足')
      this.setData({
        confirmwaitlist: true,
      })
    } else {
      this.addBooking()
      console.log('form发生了submit事件', trip, intripguests.length)
    }
  },

  addBooking() {
    let formId = this.data.formId
    console.log(formId)

    let guests = this.data.guests
    let trip = this.data.trip
    var intripguests = []
    let comment = this.data.comment
    let waitlist = this.data.waitlist
    let ngc_to = ''
    let ngc_to_whsid = this.data.ngc_to_whsid
    let ngc_to_name = this.data.ngc_to_name
    let whsid_error = this.data.whsid_error

    if (whsid_error == false && ngc_to_name != '') ngc_to = ngc_to_name.slice(1) + ',' + ngc_to_whsid //如果有正确的ngc对应的id，把名字和id组合一起，去掉名字前面的冒号

    for (var i in guests) {
      if (guests[i].intrip) {
        guests[i].created = guests[i].created.toLocaleString()
        if (guests[i].updated) guests[i].updated = guests[i].updated.toLocaleString()
        intripguests.push(guests[i])
        console.log(guests[i].created)
      }
    }

    this.setData({
      submitting: true,
      buttontext: '正在提交',
    })
    console.log(trip, intripguests, comment, waitlist, formId, ngc_to)

    wx.cloud.callFunction({
      name: 'addbooking',
      data: {
        formId: formId,
        trip: trip,
        intripguests: intripguests,
        waitlist: waitlist,
        comment: comment,
        ngc_to: ngc_to
      }
    }).then(res => {
      console.log(res.result);
      this.setData({
        submitting: false,
        buttontext: '提交',
      })

      getApp().globalData.navigate_from = 'bookform' //设置全局参数用于提交后跳转我的行程页面时自动显示待确认订单tab

      let dialog_content = ''
      if (res.result.created_guests != '') dialog_content = dialog_content + res.result.created_guests + '的报名已提交;'
      if (res.result.updated_guests != '') dialog_content = dialog_content + res.result.updated_guests + '的报名已更新;'
      if (res.result.existing_guests != '') dialog_content = dialog_content + res.result.existing_guests + '已经报名了此行程，无须重复报名;'

      $wuxDialog().open({
        resetOnClose: true,
        maskClosable: false,
        content: dialog_content,
        buttons: [{
          text: '确定',
          type: 'primary',
          onTap(e) {
            wx.switchTab({
              url: '../mytrip/index'
            })
          },
        }],
      })
    }).catch(err => {
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

  },

  confirmPopup() {
    this.setData({
      confirmwaitlist: false,
      waitlist: true,
    })
    this.addBooking()
  },
  closePopup() {
    this.setData({
      confirmwaitlist: false
    })
  },
  onComment(e) {
    console.log(e)
    this.setData({
      comment: e.detail.value
    })
  },
  onNgcChange(e) {
    //console.log(e)
    this.setData({
      whsid_error: false,
      ngc_to_whsid: e.detail.value
    })
  },
  onNgcFocus(e) {
    this.setData({
      whsid_error: false
    })
    console.log('onNgcFocus', e)
  },
  onNgcBlur(e) {
    let whsid = e.detail.value

    this.setData({
      ngc_to_name: ''
    })

    if (whsid != '') {
      if (isWhsid(whsid)) {
        this.setData({
          whsid_error: true,
        })
      } else this.validateNgc(whsid)
    }
    console.log('onNgcBlur', e)
  },
  onNgcError() {
    wx.showModal({
      title: '请输入有效客户编号(可以联系推荐人在小程序中我的行程界面查看)',
      showCancel: !1,
    })
  },
  validateNgc(whsid) {
    console.log('查询并展示推荐人姓名')
    db.collection('guest').where({
      cmhwhsid: whsid // 查询是否存在此whsid的客户
    }).get().then(res => {
      console.log(res)
      if (res.data.length == 0) {
        this.setData({
          whsid_error: true,
          ngc_to_name: '：查找不到此编号的客户'
        })
      } else if (res.data.length == 1) {
        this.setData({
          ngc_to_name: '：' + res.data[0].name
        })
      } else console.log('guest data error')
    })
  },
})