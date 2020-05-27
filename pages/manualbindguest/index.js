// pages/manualbindguest/index.js
import {
  $wuxToast
} from '../../dist/index'
import {
  $wuxDialog
} from '../../dist/index'

const db = wx.cloud.database()

const isEmail = (value) => !/^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/.test(value)

Page({

  data: {
    name: '',
    emailvalue: '',
    submitting: false,
    buttontext: '提交'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
  },

  onShareAppMessage: function () {
    let title = '我想去直升机滑雪，一起看看吧！'

    return {
      title: title,
      path: '/pages/start/index',
      imageUrl: '/images/sharecover.jpg'
    }
  },

  onnameFocus(e) {
    this.setData({
      nameerror: false
    })
    console.log('onnameFocus', e)
  },
  onnameChange(e) {
    //console.log('onnameChange', e)
    this.setData({
      nameerror: false,
      name: e.detail.value,
    })
  },
  onnameBlur(e) {
    console.log('name', e)
    if (e.detail.value == '') this.setData({
      nameerror: true,
    })
    else this.setData({
      name: e.detail.value,
      nameerror: false,
    })
  },
  onemailChange(e) {
    //console.log('onemailChange', e)
    this.setData({
      emailerror: false,
      emailvalue: e.detail.value,
    })
  },
  onemailFocus(e) {
    this.setData({
      emailerror: false
    })
    console.log('onemailFocus', e)
  },
  onemailBlur(e) {
    this.setData({
      emailerror: isEmail(e.detail.value),
    })
    console.log('onemailBlur', e)
  },
  onemailConfirm(e) {
    this.setData({
      emailerror: isEmail(e.detail.value),
    })
    console.log('onemailConfirm', e)
  },
  onemailClear(e) {
    console.log('onemailClear', e)
    this.setData({
      emailerror: true,
      value: '',
    })
  },
  onemailError() {
    wx.showModal({
      title: '请输入有效的Email地址',
      showCancel: !1,
    })
  },

  onSubmit() {
    console.log('姓名邮箱查找')
    if (this.data.name == '') {
      $wuxToast().show({
        type: 'forbidden',
        duration: 1500,
        color: '#fff',
        text: '请输入姓名',
        success: () => console.log('请输入姓名')
      })
    } else if (this.data.emailvalue == '') {
      $wuxToast().show({
        type: 'forbidden',
        duration: 1500,
        color: '#fff',
        text: '请输入邮箱',
        success: () => console.log('请输入邮箱')
      })
    } else {
      this.setData({
        submitting: true,
        buttontext: '正在提交',
      })

      db.collection('guest').where({
        name: this.data.name,
        email: this.data.emailvalue
      }).get().then(res => {
        console.log(res.data)
        /*
          $wuxToast().show({
            type: 'text',
            duration: 1500,
            color: '#fff',
            text: '搜索不到对应的客户，请确认您的姓名和邮箱',
            success: () => console.log('文本提示')
          })
        */
        this.setData({
          submitting: false,
          buttontext: '提交',
        })

        if (res.data.length != 1) { //搜不到对应的客户
          $wuxDialog().open({
            resetOnClose: true,
            title: '搜索不到对应的客户',
            content: '请重新确认您的姓名和邮箱或者联系我们并提供预订邮件截图等信息进行人工绑定',
            buttons: [{
                text: '确认姓名和邮箱',
                type: 'primary',
              },
              {
                text: '联系我们',
                openType: 'contact',
                onContact(e) {
                  console.log(e)
                },
              },
            ],
          })
        } else { //搜索到了唯一的匹配，提示客户确认绑定
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
                //返回mytrip并且重新加载页面获取客户和订单数据
                let pages = getCurrentPages();
                let prevPage = pages[pages.length - 2];

                wx.navigateBack({
                  success: function() {
                    prevPage.onLoad({}); // 执行前一个页面的onLoad方法
                  }
                });
                console.log(res);
              })
            },
            onCancel(e) {
              console.log('取消绑定')
            },
          })
        }
      })
    }
  },
})