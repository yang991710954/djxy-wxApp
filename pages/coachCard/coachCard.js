// pages/coachCard/coachCard.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  unBindCoach: function () {
    wx.showModal({
      title: '温馨提示',
      content: '如果解绑教练您当前购买的课程也会作废,您确定现在解绑教练吗？',
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定')
          wx.showToast({
            title: '绑定教练成功',
            icon: 'success',
            duration: 2000
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