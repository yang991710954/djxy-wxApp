// pages/welcome/welcome.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    activeUrl: '/images/testImg/test1.jpeg',
    countDown: 5,
    timerId: void (0),
  },

  // 获取首页图片
  getActiveImg: function () {
    this.setData({
      timerId: setInterval(() => {
        this.setData({
          countDown: --this.data.countDown
        })

        if (this.data.countDown <= 0) {
          clearInterval(this.data.timerId);
          this.setData({
            timerId: void (0)
          })

          wx.switchTab({
            url: '/pages/home/home',
          })
        }
        console.log(this.data.countDown)
      }, 1000)
    })
  },

  // 跳转页面
  jumpPage: function () {
    this.setData({
      timerId: void (0)
    })

    wx.switchTab({
      url: '/pages/home/home',
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取首页图片
    this.getActiveImg();
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