import {
  $wuxToast
} from '../../dist/index'
import {
  $wuxDialog
} from '../../dist/index'

const db = wx.cloud.database();
const _ = db.command;

const App = getApp();

Page({
  data: {
    show_noticebar: false,
    noticebar_content: '',
    trips: [],
    bind_cmhguest: false,
    show_trip_prompt: false,
    trip_prompt: {
      title: '您还没有绑定CMH直滑客户',
      text: '绑定后即可查看您的行程和订单',
      buttons: [{
        text: '马上绑定',
      }],
      click: 'bindCMHguest'
    },
    booking_prompt: {
      title: '没有新的预订',
      text: '现在就预订您的梦幻之旅吧！'
    },
    contact_prompt: {
      title: '没有常用客人',
      text: '添加常用客人后可以在预订界面快捷选择'
    },
    getwechattobind: false,
    current_tab: 'mytrip',
    wxuser: null,
    windowWidth: App.systemInfo.windowWidth,
    windowHeight: App.systemInfo.windowHeight,
    navi_to_roomlist: false
  },

  onLoad(options) {
    console.log('onload开始')
    console.log(options)

    if (options.page == 'roomlist') {
      let roomlist_trip = options.trip_alias
      console.log('跳转到roomlist' + roomlist_trip)
      this.setData({
        roomlist_trip: roomlist_trip,
        navi_to_roomlist: true
      })
    }

    if (options.current_tab != null) this.setData({
      current_tab: options.current_tab
    })

    wx.showLoading()
    this.getUserInfo()
    console.log('getuser完成')
    let openid = getApp().globalData.openid
    console.log('全局数据openid', openid)

    if (openid == null) {
      wx.cloud.callFunction({
        name: 'getopenid'
      }).then(res => {
        console.log('页面重新获取的openid', res.result);
        this.getGuestAndTripInfo(res.result)
        this.setData({
          openid: res.result
        })
      })
    } else {
      console.log('开始获取客户资料和行程', openid)
      this.getGuestAndTripInfo(openid)
      this.setData({
        openid: openid
      })
      console.log('获取客户资料和行程完成')
    }

    /*
    this.setData({
      openid: "openid" //测试管理员面板入口控制使用
    })
    */
  },

  onShow() {
    const app = getApp()

    if (app.globalData.navigate_from == 'bookform') { //如果是bookform提交后跳转过来的，默认tab切换到我的预订 
      console.log(app.globalData.navigate_from)
      this.setData({
        current_tab: 'mybooking'
      })

      app.globalData.navigate_from = ''
    }

    let openid = this.data.openid

    if (this.data.current_tab == 'mybooking') {
      db.collection('booking').where({
        _openid: openid, // 填入当前用户 openid
        fx_lead_status: 'un_processed', //线索状态为待处理
        fx_lifecycle_status: 'normal' //生命周期状态为正常
      }).orderBy('created', 'desc').get().then(res => {
        console.log(res.data)
        this.setData({
          booking: res.data
        })
      })
    }

    if (this.data.current_tab == 'mycontact') {
      db.collection('contact').where({
        _openid: openid // 填入当前用户 openid
      }).orderBy('name', 'asc').get().then(res => {
        console.log(res.data)
        this.setData({
          guests: res.data
        })
      })
    }
  },

  onShareAppMessage: function () {
    let title = '我的直升机滑雪行程，一起看看吧！'

    return {
      title: title,
      path: '/pages/mytrip/index'
    }
  },

  onNoticeClick() {
    console.log('跳转到webview付款指南')
    wx.navigateTo({
      url: '../webview/index?url=https://mp.weixin.qq.com/s/IgnUBB98ooYJ9OyCnsF4vA',
    })
  },

  tapVertical() {
    console.log('显示行程记录')
    let guestid = this.data.user_info.fxaccount_id
    console.log(guestid)

    wx.navigateTo({
      url: '../triprecord/index?guestid=' + guestid,
    })
  },

  getGuestAndTripInfo(openid = '') {
    let that = this

    db.collection('guest').where({
      _openid: openid // 填入当前用户 openid
    }).count().then(res => {
      if (res.total == 1) { //如果只有一个匹配结果说明绑定正确
        db.collection('guest').where({ //获取客户资料数据
          _openid: openid
        }).get().then(res => {
          console.log(res.data)

          if (!res.data[0].verticalfeet) res.data[0].verticalfeet = 0 //如果为null则填成0，方便显示
          if (!res.data[0].tripcount) res.data[0].tripcount = 0

          this.setData({
            user_info: res.data[0],
            bind_cmhguest: true
          })
          let guest_id = res.data[0].fxaccount_id
          that.getTripInfo(guest_id)
        })
      } else { //如果没有绑定结果或者多个绑定结果，说明没有绑定或绑定错误，提示重新绑定，点击后调用bindCMHguest
        console.log(res.total)
        this.setData({
          show_trip_prompt: true,
          navi_to_roomlist: false //没绑定的话无法直接跳转roomlist
        })
        wx.hideLoading()
      }
    })
  },

  getTripInfo(guest_id) {
    let navi_to_roomlist = this.data.navi_to_roomlist
    let roomlist_trip = this.data.roomlist_trip
    let today = new Date()
    console.log(today.valueOf(), 'guest_ID:', guest_id)
    db.collection('order').where({ //获取行程订单数据
      guestid: guest_id,
      end_date: _.gte(today.valueOf()),
      fx_status: 'normal'
    }).orderBy('start_date', 'asc').get().then(res => {

      let trips = res.data
      let today = new Date()
      let noticebar_content = ''

      console.log(trips)
      if (trips.length > 0) {
        for (var i in trips) {
          let start_date = new Date(trips[i].start_date + 15 * 60 * 60 * 1000) //FX的时间是北京时间0点，加15个小时换算成卡尔加里时间，使用对应的UTC日期方便跨时区显示固定的行程日期
          let end_date = new Date(trips[i].end_date + 15 * 60 * 60 * 1000)
          let dpdue = new Date(trips[i].dpdue + 15 * 60 * 60 * 1000)
          let fpdue = new Date(trips[i].fpdue + 15 * 60 * 60 * 1000)
          let actions = []

          console.log(start_date.toUTCString())
          let start_month = start_date.getUTCMonth() + 1
          trips[i].start_date_str = start_date.getUTCFullYear() + '-' + start_month + '-' + start_date.getUTCDate() //转成时间字符,统一时间格式为xxxx-xx-xx
          trips[i].start_date = trips[i].start_date + 15 * 60 * 60 * 1000
          let end_month = end_date.getUTCMonth() + 1
          trips[i].end_date_str = end_date.getUTCFullYear() + '-' + end_month + '-' + end_date.getUTCDate()
          trips[i].end_date = trips[i].end_date + 15 * 60 * 60 * 1000
          let dpdue_month = dpdue.getUTCMonth() + 1
          trips[i].dpdue_str = dpdue.getUTCFullYear() + '-' + dpdue_month + '-' + dpdue.getUTCDate()
          trips[i].dpdue = trips[i].dpdue + 15 * 60 * 60 * 1000
          let fpdue_month = fpdue.getUTCMonth() + 1
          trips[i].fpdue_str = fpdue.getUTCFullYear() + '-' + fpdue_month + '-' + fpdue.getUTCDate()
          trips[i].fpdue = trips[i].fpdue + 15 * 60 * 60 * 1000
          if (trips[i].lodge == 'Valdez') { //如果是Valdez订单金额用美元
            trips[i].trip_logo = '../../images/VHSGLogo.png' //Valdez订单logo
            trips[i].fpdue_str = '2021-2-1' //Valdez订单全款截至日统一到2月1日
            trips[i].deposit_str = trips[i].pricewithtax * 0.5 + '美元'
            trips[i].pricewithtax_str = trips[i].pricewithtax + '美元'
            trips[i].dpactual_str = trips[i].dpactual + '美元'
            trips[i].paymentdue_str = trips[i].paymentdue + '美元'
          } else {
            trips[i].trip_logo = '../../images/CMHLogo.png'
            trips[i].deposit_str = trips[i].deposit + '加币'
            trips[i].pricewithtax_str = trips[i].pricewithtax + '加币'
            trips[i].dpactual_str = trips[i].dpactual + '加币'
            trips[i].paymentdue_str = trips[i].paymentdue + '加币'
          }
          /* 
           //用于测试下面几个选项的逻辑
          actions.push({
            text: '填写免责声明',
            type: 'primary',
          })
          actions.push({
            text: '支付订金',
            type: 'primary',
            bold: true,
          })
          actions.push({
            text: '重新预订',
            type: 'primary',
          })
         */
          if (trips[i].waiver == '未提交')
            actions.push({
              text: '填写免责声明',
              type: 'primary',
            })

          if (trips[i].orderstatus == '订金交付') {

            if (trips[i].lodge == 'Valdez') {
              actions.push({
                text: '出发准备',
                type: 'primary'
              })
            } else {
              actions.push({
                text: '支付全款',
                type: 'primary',
              })
              actions.push({
                text: '出发准备',
                type: 'primary',
              })
            }

            let days_to_fp = (trips[i].fpdue - today.valueOf()) / 24 / 60 / 60 / 1000
            console.log(days_to_fp)
            let paymentdue = parseFloat(trips[i].paymentdue)
            console.log(paymentdue)

            if (days_to_fp <= 31 && paymentdue > 0) {
              noticebar_content = noticebar_content + '请支付' + trips[i].start_date_str + ' ' + trips[i].lodge + '基地' + trips[i].trip_type + '行程的尾款' + trips[i].paymentdue_str + '，付款截止日期为' + trips[i].fpdue_str + '; '
              console.log('提醒付全款：', noticebar_content)
            }

          } else if (trips[i].orderstatus == '全款交付') {
            actions.push({
              text: '出发准备',
              type: 'primary'
            })
          } else if (trips[i].orderstatus == '位置确认') {
            if (trips[i].lodge == 'Valdez') {
              actions.push({
                text: '出发准备',
                type: 'primary'
              })
            } else {
              actions.push({
                text: '支付订金',
                type: 'primary'
              })
            }

            let days_to_fp = (trips[i].fpdue - today.valueOf()) / 24 / 60 / 60 / 1000
            console.log(days_to_fp)
            let paymentdue = parseFloat(trips[i].paymentdue)
            console.log(paymentdue)
            let dpactual = parseInt(trips[i].dpactual)

            if (days_to_fp <= 31 && paymentdue > 0) {
              noticebar_content = noticebar_content + '请支付' + trips[i].start_date_str + ' ' + trips[i].lodge + '基地' + trips[i].trip_type + '行程的全款' + trips[i].paymentdue_str + '，付款截止日期为' + trips[i].fpdue_str + '; '
              console.log('距离全款日期很近，直接提醒付全款：', noticebar_content)
            } else if (dpactual == 0 && paymentdue > 0) {
              noticebar_content = noticebar_content + '请支付' + trips[i].start_date_str + ' ' + trips[i].lodge + '基地' + trips[i].trip_type + '行程的订金' + trips[i].deposit_str + '，付款截止日期为' + trips[i].dpdue_str + '; '
            }
          } else if (trips[i].orderstatus == '已取消') {
            actions.push({
              text: '已取消，点击这里重新预订',
              type: 'primary',
            })
          }

          trips[i].actions = actions
        }

        this.setData({
          show_trip_prompt: false,
        })
      } else {
        this.setData({
          show_trip_prompt: true,
          trip_prompt: {
            title: '没有待出行的直滑行程',
            text: '现在就预订您的下一个梦幻之旅吧！',
            buttons: [{
              text: '马上预订',
            }],
            click: 'newBooking'
          }
        })
      }

      this.setData({
        trips: trips
      })

      if (noticebar_content.length > 0) {
        wx.showTabBarRedDot({
          index: 1
        })

        this.setData({
          show_noticebar: true,
          noticebar_content: noticebar_content
        })
      }
      wx.hideLoading()

      if (navi_to_roomlist) { //检查目前用户的订单中是否有需要跳转roomlist的行程，如果有则跳转
        this.setData({
          navi_to_roomlist: false //设置成false防止返回后重复跳转
        })
        console.log('跳转到roomlist:' + roomlist_trip)
        for (var j in trips) {
          if (trips[j].trip_alias == roomlist_trip) {
            console.log('跳转到roomlist，并附带trip信息参数')
            let trip = JSON.stringify(trips[j])
            wx.navigateTo({
              url: '../roomlist/index?trip=' + trip,
            })
          }
        }
      }
    })
  },

  getUserInfo() { //弹出授权窗函数
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            withCredentials: true, //此处设为true，才会返回encryptedData等敏感信息
            success: res => {
              /*
              // 可以将 res 发送给后台解码出 unionId
              App.globalData.userInfo = res.userInfo;
              App.globalData.encryptedData = res.encryptedData;
              App.globalData.iv = res.iv;
              */
              this.setData({
                wxuser: res.userInfo,
              });
              wx.cloud.callFunction({ //更新云数据库里的用户资料
                name: 'updateuser',
                data: {
                  user_info: res.userInfo
                },
              }).then(res => {
                console.log(res);
              })
            }
          })
        } else { //未授权也不再弹窗，绑定CMH客户时候再要求授权
          console.log('未授权微信公开信息')
          /*
          this.setData({
            isShowAuthorizeWarning: true
          })
          */
        }
      }
    })
  },

  /*
  //进入页面直接邀请客户授权的弹窗，目前使用opendata显示头像和昵称，不需要进入页面时候提醒，所以暂时注释掉
  cancelAuthorize() {
    this.setData({
      isShowAuthorizeWarning: false
    });
    App.globalData.unionid = null;
  },


  getAuthorize(e) { //弹窗获取客户授权
    console.log(e)
    if (e.detail.userInfo) { //获取到微信昵称则进入微信昵称搜索
      this.setData({
        wxuser: e.detail.userInfo,
        isShowAuthorizeWarning: false,
      });
      wx.cloud.callFunction({ //更新云数据库里的用户资料
        name: 'updateuser',
        data: {
          user_info: e.detail.userInfo
        },
      }).then(res => {
        console.log(res);
      })
    } else { //拒绝提供微信昵称则进入手动查找
      this.setData({
        isShowAuthorizeWarning: false,
      });
    }
  },
  */

  bindCMHguest() {
    console.log(this.data.wxuser)
    if (this.data.wxuser == null) {
      this.setData({
        getwechattobind: true,
      });
    } else { //使用微信昵称查找guest，成功则绑定，否则也跳转到手动绑定页面
      this.wechatBind();
    }
  },

  manualBind() {
    wx.navigateTo({ //跳转到手动绑定页面
      url: '../manualbindguest/index'
    })
  },

  wechatBind() {
    console.log('微信昵称查找')

    var current_page = this

    db.collection('guest').where({
      wxnickname: this.data.wxuser.nickName
    }).get().then(res => {
      console.log(res.data)
      if (res.data.length == 0 || res.data.length > 1) { //微信昵称搜不到对应的客户
        $wuxToast().show({
          type: 'text',
          duration: 1500,
          color: '#fff',
          text: '搜索不到对应的客户，请使用姓名和邮箱搜索',
          success: () => console.log('文本提示')
        })
        this.manualBind();
      } else if (res.data.length == 1) { //搜索到了唯一的匹配，提示客户确认绑定
        $wuxDialog().confirm({
          resetOnClose: true,
          closable: true,
          title: '绑定到客户:' + res.data[0].name,
          content: '绑定后即可获取行程和预订信息',
          onConfirm(e) {
            console.log('通过云函数绑定')
            wx.cloud.callFunction({ //更新云数据库里的用户资料
              name: 'bindfxguest',
              data: {
                guestid: res.data[0].fxaccount_id
              },
            }).then(res => {
              console.log(res);
              current_page.onLoad({}) //重新加载页面获取客户和订单数据
            })
          },
          onCancel(e) {
            console.log('取消绑定')
          },
        })
      } else { //数据错误
        console.log('数据错误')
      }
    })
  },

  getWechatBind(e) {
    console.log(e)
    if (e.detail.userInfo) { //获取到微信昵称则进入微信昵称搜索
      this.setData({
        wxuser: e.detail.userInfo,
        getwechattobind: false,
      });
      this.wechatBind();
      wx.cloud.callFunction({ //更新云数据库里的用户资料
        name: 'updateuser',
        data: {
          user_info: e.detail.userInfo
        },
      }).then(res => {
        console.log(res);
      })
    } else { //拒绝提供微信昵称则进入手动查找
      this.setData({
        getwechattobind: false,
      });
      this.manualBind();
    }
  },

  cancelWechatBind() {
    this.setData({
      getwechattobind: false,
    });
    this.manualBind();
  },

  onAction(e) {
    console.log('onAction', 'trip index:', e.target.id, 'action name:', e.detail.action.text)

    if (e.detail.action.text == '出发准备') {
      let trip = JSON.stringify(this.data.trips[e.target.id])
      let lodge = this.data.trips[e.target.id].lodge
      console.log(lodge, '出发准备跳转至攻略')
      if (lodge == 'Valdez') {
        wx.navigateTo({
          url: '../webview/index?url=https://mp.weixin.qq.com/s/xCpNO-UEza1Cgl88DLXvdA',
        })
      } else {
        wx.navigateTo({
          url: '../roomlist/index?trip=' + trip,
        })
      }
    } else if (e.detail.action.text == '已取消，点击这里重新预订') {
      console.log('跳转到bookform，并附带trip信息参数')
      wx.showLoading()
      db.collection('cmhtrip01').where({
        tour_alias: this.data.trips[e.target.id].trip_alias // 从行程数据库查找相应的行程
      }).get().then(res => {
        console.log(res.data)
        let trip = JSON.stringify(res.data[0])
        wx.hideLoading()
        wx.navigateTo({
          url: '../bookform/index?trip=' + trip,
        })
      })

    } else if (e.detail.action.text == '填写免责声明') {
      console.log('跳转到webview免责声明填写指南')
      wx.navigateTo({
        url: '../webview/index?url=https://mp.weixin.qq.com/s/chqBHg903ZhsxDLFD-QYYg',
      })
    } else {
      console.log('跳转到webview付款指南')
      wx.navigateTo({
        url: '../webview/index?url=https://mp.weixin.qq.com/s/IgnUBB98ooYJ9OyCnsF4vA',
      })
    }
  },
  onTabsChange(e) {
    console.log('onChange', e)
    this.setData({
      current_tab: e.detail.key,
    })
    this.onShow()
  },
  newBooking() {
    wx.switchTab({
      url: '../tripfinder/index',
    })
  },

  updateContact(e) {
    console.log(e.target.id)
    if (e.target.id == 'addnew') {
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
      // let guestindex = this.data.guests.length
      wx.navigateTo({
        url: '../guestinfo/index?guestinfo=' + guestinfo
        // + '&guestindex=' + guestindex,
      })
    } else {
      let guestindex = e.target.id
      let guest = this.data.guests[guestindex]

      //guest.roomtype = '双人标间' //兼容guestinfo页面的数据格式，防止报错，没有业务价值
      //guest.intrip = false

      let guestinfo = JSON.stringify(guest)
      console.log('跳转参数', guestinfo, guestindex)
      wx.navigateTo({
        url: '../guestinfo/index?guestinfo=' + guestinfo
        // + '&guestindex=' + guestindex,
      })
    }
  },

  admin() {
    let open_id = this.data.openid
    console.log('点击管理', open_id)
    db.collection('whitelist').where({
      admin: true,
      open_id: open_id
    }).count().then(res => {
      console.log(res)
      if (res.total == 1) {
        wx.navigateTo({
          url: '../admin/index'
        })
      } else {
        $wuxToast().show({
          type: 'text',
          duration: 1500,
          color: '#fff',
          text: '没有权限',
          success: () => console.log('没有权限')
        })
      }
    })
  }

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
  */
})