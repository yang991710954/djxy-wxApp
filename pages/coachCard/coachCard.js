// pages/coachCard/coachCard.js
import {
  APIHOST,
  phoneReg,
  showMessage,
  httpRequest,
} from '../../utils/util.js';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    coachName: '未知',
    drivingschool: '未知',
    drivingage: 0
  },

  unBindCoach: function () {
    let _this = this;

    wx.showModal({
      title: '温馨提示',
      content: '如果解绑教练您当前购买的课程也会作废,您确定现在解绑教练吗？',
      success: function (res) {
        if (res.confirm) {
          httpRequest({
            url: APIHOST + 'api/v3/driving/driving/student/unbind_coach',
            success: function ({ data }) {
              wx.setStorageSync('isUnbind', 'unbind');
              wx.removeStorageSync('coachId');

              if (data.result) {
                wx.showToast({
                  title: '解绑教练成功',
                  icon: 'success',
                  duration: 2000
                })

                setTimeout(function () {
                  wx.switchTab({
                    url: '/pages/home/home',
                  })
                }, 1000)
              } else {
                showMessage('解绑教练失败');
              }
            },
            error: function () {
              showMessage('解绑教练出错');
            }
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },

  // 联系客服
  contactCustomerService: function () {
    wx.navigateTo({
      url: '/pages/customerService/customerService',
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let coachInfo = JSON.parse(wx.getStorageSync('COACH_INFO')) || {};

    this.setData({
      coachName: coachInfo.name || '未知',
      drivingschool: coachInfo.drivingschool || '未知',
      drivingage: coachInfo.drivingage || 0
    })
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
  onShareAppMessage: function () {

  }
})