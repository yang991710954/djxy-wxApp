// pages/bindCoach/SearchPhone/SearchPhone.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  bindHideKeyboard: function (e) {
    if (e.detail.value.length >= 11) {
      // 收起键盘
      wx.hideKeyboard()
    }
  },

  bindCoachFormPhone: function () {
    wx.showModal({
      title: '温馨提示',
      content: '确定绑定该教练吗',
      success: function (res) {
        if (res.confirm) {
          wx.showToast({
            title: '绑定教练成功',
          })
          setTimeout(function () {
            wx.switchTab({
              url: '/pages/home/home',
            })
          }, 1000)
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
  onShareAppMessage: function () {

  }
})