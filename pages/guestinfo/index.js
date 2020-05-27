// pages/guestinfo/index.js
import {
  $wuxToast
} from '../../dist/index'
import {
  $wuxDialog
} from '../../dist/index'

const db = wx.cloud.database()

const isTel = (value) => !/^1[34578]\d{9}$/.test(value)
const isEmail = (value) => !/^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/.test(value)

Page({
  data: {
    popup: false,
    show_delete: false,
    name: '',
    _id: '',
    // guestindex: 0,
    emailvalue: '',
    gender: 'male',
    birthday: '',
    mobilevalue: '',
    gendervalue: [{
        type: 'male',
        value: '男',
        checked: 'true'
      },
      {
        type: 'female',
        value: '女'
      },
    ],
    submitting: false,
    buttontext: '提交'
  },
  onLoad(options) {
    //let guestindex = options.guestindex  //不再处理guestindex，roomtype和intrip，将客户信息修改页面与bookform页面解开耦合

    // console.log(options.guestinfo, guestindex)
    // if (typeof(guestindex) != "undefined") {
    let guestinfo = JSON.parse(options.guestinfo)
    var app = getApp();
    var openid = app.globalData.openid;

    if (guestinfo._id != '') this.setData({
      show_delete: true
    });
    else {
      //新建联系人时检查总共contact的数量，超过10个且不在白名单则弹窗提示删除不用的联系人或者联系
      db.collection('contact').where({
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
                content: '您的常用客户过多，请删除不用的联系人后再新建，也可以联系我们放开限制',
                buttons: [{
                    text: '联系我们',
                    openType: 'contact',
                    sendMessageTitle: '申请解除联系人数量限制',
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
    }
    this.setData({
      name: guestinfo.name,
      _id: guestinfo._id,
      birthday: guestinfo.birthday,
      emailvalue: guestinfo.emailvalue,
      gender: guestinfo.gender,
      height: guestinfo.height,
      mobilevalue: guestinfo.mobilevalue,
      weight: guestinfo.weight,
      /*
      roomtype: guestinfo.roomtype,
      intrip: guestinfo.intrip,
      guestindex: guestindex,
      */
    })
    if (guestinfo.gender == 'female') {
      this.setData({
        'gendervalue[0].checked': 'false',
        'gendervalue[1].checked': 'true',
      })
    }
    // }
  },

  onShareAppMessage: function () {
    let title = '查看常用客户资料'

    return {
      title: title,
      path: '/pages/mytrip/index?current_tab=mycontact'
    }
  },

  deleteContact() {
    let that = this
    $wuxDialog().confirm({
      resetOnClose: true,
      closable: true,
      title: '',
      content: '请确认删除该客户的资料，删除后将无法恢复',
      onConfirm(e) {
        console.log('确认删除')
        let id = that.data._id
        db.collection('contact').doc(id).remove().then(res => {
            $wuxToast().show({
              type: 'success',
              duration: 1500,
              color: '#fff',
              text: '已完成',
              success: () => {
                console.log('已完成')
                wx.navigateBack({
                  delta: 1
                })
              }
            })
          })
          .catch(console.error)
      },
      onCancel(e) {
        console.log('取消删除')
      },
    })
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
  genderChange(e) {
    console.log('gender', e)
    this.setData({
      gender: e.detail.value,
    })
  },
  DateChange(e) {
    console.log("date change", e)
    this.setData({
      birthday: e.detail.value,
    })
  },
  onheightFocus(e) {
    this.setData({
      heighterror: false
    })
    console.log('onheightFocus', e)
  },
  onheightChange(e) {
    //console.log('onheightChange', e)
    this.setData({
      heighterror: false,
      height: e.detail.value,
    })
  },
  onheightBlur(e) {
    console.log('height', e)
    if (e.detail.value == '' || e.detail.value < 100 || e.detail.value > 230) this.setData({
      heighterror: true,
    })
    else this.setData({
      height: e.detail.value,
    })
  },
  onweightFocus(e) {
    this.setData({
      weighterror: false
    })
    console.log('onweightFocus', e)
  },
  onweightChange(e) {
    //console.log('onweightChange', e)
    this.setData({
      weighterror: false,
      weight: e.detail.value,
    })
  },
  onweightBlur(e) {
    console.log('weight', e)
    if (e.detail.value == '' || e.detail.value < 20 || e.detail.value > 200) this.setData({
      weighterror: true,
    })
    else this.setData({
      weight: e.detail.value,
    })
  },
  onEmpty() {
    wx.showModal({
      title: '必填项',
      showCancel: !1,
    })
  },
  //邮箱输入框验证
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
  //手机号输入框验证
  onChange(e) {
    //console.log('onChange', e)
    this.setData({
      mobileerror: false,
      mobilevalue: e.detail.value,
    })
  },
  onFocus(e) {
    this.setData({
      mobileerror: false
    })
    console.log('onFocus', e)
  },
  onBlur(e) {
    this.setData({
      mobileerror: isTel(e.detail.value),
    })
    console.log('onBlur', e)
  },
  onConfirm(e) {
    this.setData({
      mobileerror: isTel(e.detail.value),
    })
    console.log('onConfirm', e)
  },
  onClear(e) {
    console.log('onClear', e)
    this.setData({
      mobileerror: true,
      value: '',
    })
  },
  onError() {
    wx.showModal({
      title: '请输入有效的11位手机号码',
      showCancel: !1,
    })
  },
  onSubmit() {
    //需要校验各个字段合法
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
    } else if (this.data.emailerror) {
      $wuxToast().show({
        type: 'forbidden',
        duration: 1500,
        color: '#fff',
        text: '请输入正确的邮箱',
        success: () => console.log('请输入正确的邮箱')
      })
    } else if (this.data.birthday == '') {
      $wuxToast().show({
        type: 'forbidden',
        duration: 1500,
        color: '#fff',
        text: '请输入生日',
        success: () => console.log('请输入生日')
      })
    } else if (this.data.height == '') {
      $wuxToast().show({
        type: 'forbidden',
        duration: 1500,
        color: '#fff',
        text: '请输入身高',
        success: () => console.log('请输入身高')
      })
    } else if (this.data.heighterror) {
      $wuxToast().show({
        type: 'forbidden',
        duration: 1500,
        color: '#fff',
        text: '请输入正确的身高',
        success: () => console.log('请输入正确的身高')
      })
    } else if (this.data.weight == '') {
      $wuxToast().show({
        type: 'forbidden',
        duration: 1500,
        color: '#fff',
        text: '请输入体重',
        success: () => console.log('请输入体重')
      })
    } else if (this.data.weighterror) {
      $wuxToast().show({
        type: 'forbidden',
        duration: 1500,
        color: '#fff',
        text: '请输入正确的体重',
        success: () => console.log('请输入正确的体重')
      })
    } else if (this.data.mobilevalue == '') {
      $wuxToast().show({
        type: 'forbidden',
        duration: 1500,
        color: '#fff',
        text: '请输入手机号码',
        success: () => console.log('请输入手机号码')
      })
    } else if (this.data.mobileerror) {
      $wuxToast().show({
        type: 'forbidden',
        duration: 1500,
        color: '#fff',
        text: '请输入正确的手机号码',
        success: () => console.log('请输入正确的手机号码')
      })
    } else {
      this.setData({
        submitting: true,
        buttontext: '正在提交',
      })

      if (this.data._id == '') { //_id为空则新建
        db.collection('contact').add({
          data: {
            "name": this.data.name,
            "emailvalue": this.data.emailvalue,
            "gender": this.data.gender,
            "birthday": this.data.birthday,
            "height": this.data.height,
            "weight": this.data.weight,
            "mobilevalue": this.data.mobilevalue,
            "updated": db.serverDate(),
            "created": db.serverDate(),
            "synced": false  //标记成需要同步
          },
        }).then(res => {
            console.log(res);
            this.setData({
              submitting: false,
              buttontext: '提交',
              popup: true,
              _id: res._id,
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
      } else {
        db.collection('contact').doc(this.data._id).update({
          data: {
            "name": this.data.name,
            "emailvalue": this.data.emailvalue,
            "gender": this.data.gender,
            "birthday": this.data.birthday,
            "height": this.data.height,
            "weight": this.data.weight,
            "mobilevalue": this.data.mobilevalue,
            "updated": db.serverDate(),
            "synced": false //标记成需要同步
          },
        }).then(res => {
            console.log(res);
            this.setData({
              submitting: false,
              buttontext: '提交',
              popup: true,
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
    }
  },
  onpopupClose() {
    /*
    let pages = getCurrentPages();
    let prevPage = pages[pages.length - 2];

    let guestindex = this.data.guestindex
    var prevname = 'guests[' + guestindex + '].name';
    var prevemailvalue = 'guests[' + guestindex + '].emailvalue';
    var prevgender = 'guests[' + guestindex + '].gender';
    var prevbirthday = 'guests[' + guestindex + '].birthday';
    var prevheight = 'guests[' + guestindex + '].height';
    var prevweight = 'guests[' + guestindex + '].weight';
    var prevmobilevalue = 'guests[' + guestindex + '].mobilevalue';
    var prev_id = 'guests[' + guestindex + ']._id';
    var prevroomtype = 'guests[' + guestindex + '].roomtype';
    var previntrip = 'guests[' + guestindex + '].intrip';

    prevPage.setData({ // 将我们想要传递的参数在这里直接setData。上个页面就会执行这里的操作。
      [prevname]: this.data.name,
      [prevemailvalue]: this.data.emailvalue,
      [prevgender]: this.data.gender,
      [prevbirthday]: this.data.birthday,
      [prevheight]: this.data.height,
      [prevweight]: this.data.weight,
      [prevmobilevalue]: this.data.mobilevalue,
      [prev_id]: this.data._id,
      [prevroomtype]: this.data.roomtype||'双人标间',
      [previntrip]: this.data.intrip,
      noguests: false,
    })
    */

    wx.navigateBack({
      delta: 1
    });
  }
})