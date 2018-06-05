// pages/bindCoach/SearchPhone/SearchPhone.js
import {
  APIHOST,
  phoneReg,
  wxCloseApp,
  httpRequest,
  showMessage,
  shareMessage,
  returnUrlObj,
  returnUrlParam
} from '../../../utils/util.js';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    phoneNumber: '',
    coachName: '',
    coachId: '',
    coachPhone: '',
    isShowCoach: false,
  },

  // 自动控制键盘的收放
  bindHideKeyboard: function (e) {
    this.setData({
      phoneNumber: e.detail.value
    })

    if (e.detail.value.length >= 11) {
      // 收起键盘
      wx.hideKeyboard();
    }
  },

  // 搜索教练
  coachPhoneSearch: function () {
    let _this = this;
    let phone = this.data.phoneNumber.trim();

    if (!phone) {
      wx.showToast({
        title: '请输入手机号',
        icon: 'none',
        image: '/images/exclamation.png',
        duration: 2000
      })
      return false;
    }

    if (!phoneReg.test(phone)) {
      wx.showToast({
        title: '手机号码不规范',
        icon: 'none',
        image: '/images/exclamation.png',
        duration: 2000
      })
      return false;
    }

    // 通过手机号码查询教练
    httpRequest({
      loading: true,
      url: APIHOST + 'api/base/coachInfo/search_coach_infomation',
      data: { phone: phone },
      success: function ({ data }) {
        let resObj = data.result;

        if (resObj && resObj.id) {
          _this.setData({
            coachId: resObj.userId,
            coachName: resObj.name,
            coachPhone: resObj.phone,
            isShowCoach: true
          })
        } else {
          _this.setData({
            coachId: '',
            coachName: '',
            coachPhone: '',
            isShowCoach: true
          })
        }

      },
      error: function () {
        showMessage('查询教练失败')
      }
    })
  },

  // 绑定教练
  bindCoachFormPhone: function () {
    let _this = this;
    let coachId = this.data.coachId;

    wx.showModal({
      title: '温馨提示',
      content: '确定绑定该教练吗',
      success: function (res) {
        if (res.confirm) {
          httpRequest({
            url: APIHOST + '/api/base/s_stu_info_api/bind_coach',
            data: { coachId: coachId },
            success: function ({ data }) {
              if (data.result) {

                wx.showToast({
                  title: '绑定教练成功',
                })
                setTimeout(function () {
                  wx.switchTab({
                    url: '/pages/home/home',
                  })
                }, 1000)

              } else {
                showMessage('绑定教练失败')
              }
            },
            error: function () {
              showMessage('绑定教练失败')
            }
          })

        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }

    // 分享信息
    return shareMessage();
  }
})