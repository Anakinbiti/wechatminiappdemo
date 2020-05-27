// pages/roomlist/index.js
import {
  $wuxCalendar
} from '../../dist/index'
import {
  $wuxToast
} from '../../dist/index'
import {
  $wuxForm
} from '../../dist/index'

const db = wx.cloud.database()

Page({
  data: {
    popup: false,
    update_popup: false,
    pretrip_flight_number: '',
    pretrip_flight_date: [],
    pretrip_flight_time: '',
    pretrip_hotel: false,
    pretrip_shuttle: false,
    pretrip_hotel_choice: '',
    pretrip_hotel_date_in: [],
    pretrip_hotel_date_out: [],
    pretrip_hotel_room_type: '双人标间',
    pretrip_hotel_roommate: '',
    lodge_roommate: '',
    posttrip_flight_number: '',
    posttrip_flight_date: [],
    posttrip_flight_time: '',
    posttrip_hotel: false,
    posttrip_shuttle: false,
    posttrip_hotel_choice: '',
    posttrip_hotel_date_in: [],
    posttrip_hotel_date_out: [],
    posttrip_hotel_room_type: '双人标间',
    posttrip_hotel_roommate: '',
    comment: '',
    draft: true,
    room_options: ['双人标间', '单人间', '双人大床'],
    hotel_options: ['卡尔加里机场万豪酒店', 'Kelowna机场Four Point喜来登酒店'],
    submitting: false,
    buttontext: '提交'
  },
  onLoad: function(options) {

    let trip = JSON.parse(options.trip)
    this.setData({
      trip: trip,
    })

    db.collection('roomlist').where({
        trip_alias: trip.trip_alias
      }).orderBy('created', 'desc').limit(1)
      .get().then(res => {
        console.log(res.data)

        if (res.data.length == 1) {
          let pretrip_flight_date = []
          let pretrip_hotel_date_in = []
          let pretrip_hotel_date_out = []
          let posttrip_flight_date = []
          let posttrip_hotel_date_in = []
          let posttrip_hotel_date_out = []

          if (res.data[0].pretrip_flight_date != "" && res.data[0].pretrip_flight_date != null) pretrip_flight_date.push(res.data[0].pretrip_flight_date)
          if (res.data[0].pretrip_hotel_date_in != "" && res.data[0].pretrip_hotel_date_in != null) pretrip_hotel_date_in.push(res.data[0].pretrip_hotel_date_in)
          if (res.data[0].pretrip_hotel_date_out != "" && res.data[0].pretrip_hotel_date_out != null) pretrip_hotel_date_out.push(res.data[0].pretrip_hotel_date_out)
          if (res.data[0].posttrip_flight_date != "" && res.data[0].posttrip_flight_date != null) posttrip_flight_date.push(res.data[0].posttrip_flight_date)
          if (res.data[0].posttrip_hotel_date_in != "" && res.data[0].posttrip_hotel_date_in != null) posttrip_hotel_date_in.push(res.data[0].posttrip_hotel_date_in)
          if (res.data[0].posttrip_hotel_date_out != "" && res.data[0].posttrip_hotel_date_out != null) posttrip_hotel_date_out.push(res.data[0].posttrip_hotel_date_out)

          this.setData({
            pretrip_flight_number: res.data[0].pretrip_flight_number,
            pretrip_flight_date: pretrip_flight_date,
            pretrip_flight_time: res.data[0].pretrip_flight_time,
            pretrip_hotel: res.data[0].pretrip_hotel,
            pretrip_shuttle: res.data[0].pretrip_shuttle,
            pretrip_hotel_choice: res.data[0].pretrip_hotel_choice,
            pretrip_hotel_date_in: pretrip_hotel_date_in,
            pretrip_hotel_date_out: pretrip_hotel_date_out,
            pretrip_hotel_room_type: res.data[0].pretrip_hotel_room_type,
            pretrip_hotel_roommate: res.data[0].pretrip_hotel_roommate,
            lodge_roommate: res.data[0].lodge_roommate,
            posttrip_flight_number: res.data[0].posttrip_flight_number,
            posttrip_flight_date: posttrip_flight_date,
            posttrip_flight_time: res.data[0].posttrip_flight_time,
            posttrip_hotel: res.data[0].posttrip_hotel,
            posttrip_shuttle: res.data[0].posttrip_shuttle,
            posttrip_hotel_choice: res.data[0].posttrip_hotel_choice,
            posttrip_hotel_date_in: posttrip_hotel_date_in,
            posttrip_hotel_date_out: posttrip_hotel_date_out,
            posttrip_hotel_room_type: res.data[0].posttrip_hotel_room_type,
            posttrip_hotel_roommate: res.data[0].posttrip_hotel_roommate,
            comment: res.data[0].comment,
            draft: res.data[0].draft,
            _id: res.data[0]._id
          })
        }
      })
  },

  onShareAppMessage: function() {
    let lodge = this.data.trip.lodge
    let start_date = this.data.trip.start_date_str
    let title = '出发准备:' + start_date + ' ' + lodge + '基地行程信息！'
    let trip_alias = this.data.trip.trip_alias

    console.log(trip_alias)

    return {
      title: title,
      path: '/pages/mytrip/index?page=roomlist&trip_alias=' + trip_alias
    }
  },

  onUnload() {
    const {
      getFieldsValue,
      getFieldValue,
      setFieldsValue
    } = $wuxForm()
    var value = getFieldsValue()
    console.log('unload roomlist', value)

    if (this.data.trip.roomtype == '单人间') value.lodge_roommate = ''

    if (value.pretrip_flight_number != '' || this.data.pretrip_flight_date.length == 1 || value.pretrip_flight_time != '' || this.data.pretrip_hotel || this.data.pretrip_shuttle || value.lodge_roommate != '' || value.posttrip_flight_number != '' || this.data.posttrip_flight_date.length == 1 || value.posttrip_flight_time != '' || this.data.posttrip_hotel || this.data.posttrip_shuttle || value.comment != '') {
      console.log('保存草稿')
      /*
      console.log('pretrip_flight_number', value.pretrip_flight_number != '', 'pretrip_flight_date', this.data.pretrip_flight_date.length == 1, 'pretrip_flight_time', value.pretrip_flight_time != '', 'pretrip_hotel', this.data.pretrip_hotel, 'pretrip_shuttle', this.data.pretrip_shuttle, 'lodge_roommate', value.lodge_roommate != '', 'comment', value.comment != '')
      */

      this.setData({
        draft: true
      })
      this.uploadRoomlist()
    }
  },

  onpopupClose() {
    wx.navigateBack({
      delta: 1
    });
  },

  onChange(e) {
    const {
      form,
      changedValues,
      allValues
    } = e.detail

    console.log('onChange \n', changedValues, allValues)

    if (changedValues.pretrip_hotel_room_type) this.setData({
      pretrip_hotel_room_type: changedValues.pretrip_hotel_room_type
    })
    if (changedValues.posttrip_hotel_room_type) this.setData({
      posttrip_hotel_room_type: changedValues.posttrip_hotel_room_type
    })
  },

  pretripflightDate() { //航班日期
    let minDate = this.data.trip.start_date - 30 * 24 * 60 * 60 * 1000
    let maxDate = this.data.trip.start_date

    let default_value = this.data.pretrip_flight_date

    if (default_value.length == 0) default_value.push(maxDate - 24 * 60 * 60 * 1000);

    console.log(minDate, maxDate, default_value)
    $wuxCalendar().open({
      value: default_value,
      minDate,
      maxDate,
      onChange: (values, displayValues) => {
        console.log('onChange', values, displayValues)
        this.setData({
          pretrip_flight_date: displayValues,
        })
      },
    })
  },

  onTimePickerChange(e) { //航班时刻
    console.log(e)
    if (e.target.id == 'pretrip_flight_time') {
      let pretrip_flight_time = e.detail.displayValue[0] + e.detail.displayValue[1]
      this.setData({
        pretrip_flight_time: pretrip_flight_time
      });
    } else if (e.target.id == 'posttrip_flight_time') {
      let posttrip_flight_time = e.detail.displayValue[0] + e.detail.displayValue[1]
      this.setData({
        posttrip_flight_time: posttrip_flight_time
      });
    }
  },

  onPretripHotelChange(e) { //是否预订酒店的开关
    this.setData({
      pretrip_hotel: e.detail.value
    })
  },

  onPretripHotelSelect(e) { //酒店选择
    this.setData({
      pretrip_hotel_choice: e.detail.value
    })
  },

  onPretripHotelRoomSelect(e) { //酒店选择
    this.setData({
      pretrip_hotel_room_type: e.detail.value
    })
  },

  pretriphotelDatein() { //酒店入住日期
    let minDate = this.data.trip.start_date - 30 * 24 * 60 * 60 * 1000
    let maxDate = this.data.trip.start_date - 24 * 60 * 60 * 1000
    if (this.data.pretrip_hotel_date_out.length == 1) {
      let maxDate_value = new Date(this.data.pretrip_hotel_date_out[0])
      console.log(maxDate_value)
      maxDate = maxDate_value.getTime() - 8 * 60 * 60 * 1000 - 24 * 60 * 60 * 1000; //退房时间先换算成GTM时间再减去1天设置为入住时间的上限
    }


    let default_value = this.data.pretrip_hotel_date_in

    if (default_value.length == 0) default_value.push(maxDate);

    console.log(minDate, maxDate, default_value)
    $wuxCalendar().open({
      value: default_value,
      minDate,
      maxDate,
      onChange: (values, displayValues) => {
        console.log('onChange', values, displayValues)
        this.setData({
          pretrip_hotel_date_in: displayValues,
        })
      },
    })
  },

  pretriphotelDateout() { //酒店退房日期
    let minDate = this.data.trip.start_date - 29 * 24 * 60 * 60 * 1000
    let maxDate = this.data.trip.start_date
    if (this.data.pretrip_hotel_date_in.length == 1) {
      let minDate_value = new Date(this.data.pretrip_hotel_date_in[0])
      console.log(minDate_value)
      minDate = minDate_value.getTime() - 8 * 60 * 60 * 1000 + 24 * 60 * 60 * 1000; //入住时间先换算成GTM时间再加上1天设置为入住时间的上限
    }


    let default_value = this.data.pretrip_hotel_date_out

    if (default_value.length == 0) default_value.push(maxDate);
    $wuxCalendar().open({
      value: default_value,
      minDate,
      maxDate,
      onChange: (values, displayValues) => {
        console.log('onChange', values, displayValues)
        this.setData({
          pretrip_hotel_date_out: displayValues,
        })
      },
    })
  },

  onPretripShuttleChange(e) { //是否需要CMH班车的开关
    this.setData({
      pretrip_shuttle: e.detail.value
    })
  },

  //以下是返程信息表单对应的方法

  posttripflightDate() { //航班日期
    let minDate = this.data.trip.end_date - 24*60*60*1000
    let maxDate = this.data.trip.end_date + 30 * 24 * 60 * 60 * 1000

    let default_value = this.data.posttrip_flight_date

    if (default_value.length == 0) default_value.push(minDate + 48 * 60 * 60 * 1000);

    console.log(minDate, maxDate, default_value)
    $wuxCalendar().open({
      value: default_value,
      minDate,
      maxDate,
      onChange: (values, displayValues) => {
        console.log('onChange', values, displayValues)
        this.setData({
          posttrip_flight_date: displayValues,
        })
      },
    })
  },

  onPosttripHotelChange(e) { //是否预订酒店的开关
    this.setData({
      posttrip_hotel: e.detail.value
    })
  },

  onPosttripHotelSelect(e) { //酒店选择
    this.setData({
      posttrip_hotel_choice: e.detail.value
    })
  },

  onPosttripHotelRoomSelect(e) { //酒店选择
    this.setData({
      posttrip_hotel_room_type: e.detail.value
    })
  },

  posttriphotelDatein() { //酒店入住日期
    let minDate = this.data.trip.end_date
    let maxDate = this.data.trip.end_date + 29 * 24 * 60 * 60 * 1000
    if (this.data.posttrip_hotel_date_out.length == 1) {
      let maxDate_value = new Date(this.data.posttrip_hotel_date_out[0])
      console.log(maxDate_value)
      maxDate = maxDate_value.getTime() - 8 * 60 * 60 * 1000 - 24 * 60 * 60 * 1000; //退房时间先换算成GTM时间再减去1天设置为入住时间的上限
    }


    let default_value = this.data.posttrip_hotel_date_in

    if (default_value.length == 0) default_value.push(minDate);

    console.log(minDate, maxDate, default_value)
    $wuxCalendar().open({
      value: default_value,
      minDate,
      maxDate,
      onChange: (values, displayValues) => {
        console.log('onChange', values, displayValues)
        this.setData({
          posttrip_hotel_date_in: displayValues,
        })
      },
    })
  },

  posttriphotelDateout() { //酒店退房日期
    let minDate = this.data.trip.end_date + 24 * 60 * 60 * 1000
    let maxDate = this.data.trip.end_date + 30 * 24 * 60 * 60 * 1000
    if (this.data.posttrip_hotel_date_in.length == 1) {
      let minDate_value = new Date(this.data.posttrip_hotel_date_in[0])
      console.log(minDate_value)
      minDate = minDate_value.getTime() - 8 * 60 * 60 * 1000 + 24 * 60 * 60 * 1000; //入住时间先换算成GTM时间再加上1天设置为入住时间的上限
    }


    let default_value = this.data.posttrip_hotel_date_out

    if (default_value.length == 0) default_value.push(minDate);
    $wuxCalendar().open({
      value: default_value,
      minDate,
      maxDate,
      onChange: (values, displayValues) => {
        console.log('onChange', values, displayValues)
        this.setData({
          posttrip_hotel_date_out: displayValues,
        })
      },
    })
  },

  onPosttripShuttleChange(e) { //是否需要CMH班车的开关
    this.setData({
      posttrip_shuttle: e.detail.value
    })
  },

  onSubmit() { //form提交按钮
    const {
      getFieldsValue,
      getFieldValue,
      setFieldsValue
    } = $wuxForm()
    const value = getFieldsValue()

    //校验字段是否填写完全
    if (value.pretrip_flight_number == '') this.showErrorMsg('请输入去程航班号');
    else if (this.data.pretrip_flight_date.length == 0) this.showErrorMsg('请输入去程航班日期');
    else if (value.pretrip_flight_time == '') this.showErrorMsg('请输入去程航班到达时间');
    else if (this.data.pretrip_hotel && value.pretrip_hotel_choice == '') this.showErrorMsg('请选择去程的机场酒店');
    else if (this.data.pretrip_hotel && this.data.pretrip_hotel_date_in.length == 0) this.showErrorMsg('请填写去程机场酒店的入住时间');
    else if (this.data.pretrip_hotel && this.data.pretrip_hotel_date_out.length == 0) this.showErrorMsg('请填写去程机场酒店的退房时间');
    else if (this.data.pretrip_hotel && value.pretrip_hotel_room_type != '单人间' && value.pretrip_hotel_roommate == '') this.showErrorMsg('去程酒店为双人间，请填写室友姓名或者预订单人间');
    else if ((this.data.trip.roomtype == '双人标间' || this.data.trip.roomtype == '双人大床') && value.lodge_roommate == '') this.showErrorMsg('请填写在基地的室友姓名');
    else if (value.posttrip_flight_number == '') this.showErrorMsg('请输入返程航班号');
    else if (this.data.posttrip_flight_date.length == 0) this.showErrorMsg('请输入返程航班日期');
    else if (value.posttrip_flight_time == '') this.showErrorMsg('请输入返程航班到达时间');
    else if (this.data.posttrip_hotel && value.posttrip_hotel_choice == '') this.showErrorMsg('请选择返程的机场酒店');
    else if (this.data.posttrip_hotel && this.data.posttrip_hotel_date_in.length == 0) this.showErrorMsg('请填写返程机场酒店的入住时间');
    else if (this.data.posttrip_hotel && this.data.posttrip_hotel_date_out.length == 0) this.showErrorMsg('请填写返程机场酒店的退房时间');
    else if (this.data.posttrip_hotel && value.posttrip_hotel_room_type != '单人间' && value.posttrip_hotel_roommate == '') this.showErrorMsg('返程酒店为双人间，请填写室友姓名或者预订单人间');
    else {
      this.setData({
        draft: false
      })

      this.uploadRoomlist()
    }

    console.log('Wux Form Submit \n', value)
  },

  uploadRoomlist() {
    const {
      getFieldsValue,
      getFieldValue,
      setFieldsValue
    } = $wuxForm()
    const value = getFieldsValue()

    this.setData({
      submitting: true,
      buttontext: '正在提交',
    })

    //如果没有预订机场酒店则将相应字段置空
    let pretrip_hotel_choice = ''
    let pretrip_hotel_date_in = ''
    let pretrip_hotel_date_out = ''
    let pretrip_hotel_room_type = ''
    let pretrip_hotel_roommate = ''


    if (this.data.pretrip_hotel) {
      pretrip_hotel_choice = this.data.pretrip_hotel_choice
      pretrip_hotel_date_in = this.data.pretrip_hotel_date_in[0]
      pretrip_hotel_date_out = this.data.pretrip_hotel_date_out[0]
      pretrip_hotel_room_type = this.data.pretrip_hotel_room_type
      pretrip_hotel_roommate = value.pretrip_hotel_roommate
    }

    let posttrip_hotel_choice = ''
    let posttrip_hotel_date_in = ''
    let posttrip_hotel_date_out = ''
    let posttrip_hotel_room_type = ''
    let posttrip_hotel_roommate = ''

    if (this.data.posttrip_hotel) {
      posttrip_hotel_choice = this.data.posttrip_hotel_choice
      posttrip_hotel_date_in = this.data.posttrip_hotel_date_in[0]
      posttrip_hotel_date_out = this.data.posttrip_hotel_date_out[0]
      posttrip_hotel_room_type = this.data.posttrip_hotel_room_type
      posttrip_hotel_roommate = value.posttrip_hotel_roommate
    }

    //提交至云数据库
    if (!this.data._id) {
      db.collection('roomlist').add({
        data: {
          "client_id": this.data.trip.guestwhsid,
          "client_name": this.data.trip.guestname,
          "lodge": this.data.trip.lodge,
          "start_date": this.data.trip.start_date_str,
          "trip_alias": this.data.trip.trip_alias,
          "season": this.data.trip.season,
          "lodge_roomtype": this.data.trip.roomtype,
          "lodge_roommate": value.lodge_roommate,
          "pretrip_flight_number": value.pretrip_flight_number,
          "pretrip_flight_date": this.data.pretrip_flight_date[0],
          "pretrip_flight_time": this.data.pretrip_flight_time,
          "pretrip_hotel": this.data.pretrip_hotel,
          "pretrip_hotel_choice": pretrip_hotel_choice,
          "pretrip_hotel_date_in": pretrip_hotel_date_in,
          "pretrip_hotel_date_out": pretrip_hotel_date_out,
          "pretrip_hotel_room_type": pretrip_hotel_room_type,
          "pretrip_hotel_roommate": pretrip_hotel_roommate,
          "pretrip_shuttle": this.data.pretrip_shuttle,
          "posttrip_flight_number": value.posttrip_flight_number,
          "posttrip_flight_date": this.data.posttrip_flight_date[0],
          "posttrip_flight_time": this.data.posttrip_flight_time,
          "posttrip_hotel": this.data.posttrip_hotel,
          "posttrip_hotel_choice": posttrip_hotel_choice,
          "posttrip_hotel_date_in": posttrip_hotel_date_in,
          "posttrip_hotel_date_out": posttrip_hotel_date_out,
          "posttrip_hotel_room_type": posttrip_hotel_room_type,
          "posttrip_hotel_roommate": posttrip_hotel_roommate,
          "posttrip_shuttle": this.data.posttrip_shuttle,
          "comment": value.comment,
          "created": db.serverDate(),
          "draft": this.data.draft
        },
      }).then(res => {
          console.log(res);
          this.setData({
            submitting: false,
            buttontext: '提交',
            popup: true
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
      db.collection('roomlist').doc(this.data._id).update({
        data: {
          "client_id": this.data.trip.guestwhsid,
          "client_name": this.data.trip.guestname,
          "lodge": this.data.trip.lodge,
          "start_date": this.data.trip.start_date_str,
          "trip_alias": this.data.trip.trip_alias,
          "season": this.data.trip.season,
          "lodge_roomtype": this.data.trip.roomtype,
          "lodge_roommate": value.lodge_roommate,
          "pretrip_flight_number": value.pretrip_flight_number,
          "pretrip_flight_date": this.data.pretrip_flight_date[0],
          "pretrip_flight_time": this.data.pretrip_flight_time,
          "pretrip_hotel": this.data.pretrip_hotel,
          "pretrip_hotel_choice": pretrip_hotel_choice,
          "pretrip_hotel_date_in": pretrip_hotel_date_in,
          "pretrip_hotel_date_out": pretrip_hotel_date_out,
          "pretrip_hotel_room_type": pretrip_hotel_room_type,
          "pretrip_hotel_roommate": pretrip_hotel_roommate,
          "pretrip_shuttle": this.data.pretrip_shuttle,
          "posttrip_flight_number": value.posttrip_flight_number,
          "posttrip_flight_date": this.data.posttrip_flight_date[0],
          "posttrip_flight_time": this.data.posttrip_flight_time,
          "posttrip_hotel": this.data.posttrip_hotel,
          "posttrip_hotel_choice": posttrip_hotel_choice,
          "posttrip_hotel_date_in": posttrip_hotel_date_in,
          "posttrip_hotel_date_out": posttrip_hotel_date_out,
          "posttrip_hotel_room_type": posttrip_hotel_room_type,
          "posttrip_hotel_roommate": posttrip_hotel_roommate,
          "posttrip_shuttle": this.data.posttrip_shuttle,
          "comment": value.comment,
          "created": db.serverDate(),
          "draft": this.data.draft
        },
      }).then(res => {
          console.log(res);
          this.setData({
            submitting: false,
            buttontext: '提交',
            update_popup: true
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

  },

  showErrorMsg(text) {
    $wuxToast().show({
      type: 'forbidden',
      duration: 1500,
      color: '#fff',
      text: text,
      success: () => console.log(text)
    })
  }

})