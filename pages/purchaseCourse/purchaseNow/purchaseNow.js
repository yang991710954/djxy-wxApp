// pages/purchaseCourse/purchaseNow/purchaseNow.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    coursePrice: 24,//课程单价
    purchaseQuantity: 1,//购买数量
  },

  getPurchaseNow: function () {
    wx.showToast({
      title: '购买课程成功',
      icon: 'success',
      duration: 2000
    })
    setTimeout(function () {
      wx.switchTab({
        url: '/pages/home/home',
      })
    }, 1000)
  },

  changeIptnum: function (e) {
    let inputValue = parseInt(e.detail.value);
    if (isNaN(inputValue)) {
      this.setData({
        purchaseQuantity: 1
      })
      return;
    }
    if (inputValue < 1) {
      this.setData({
        purchaseQuantity: 1
      })
    } else {
      this.setData({
        purchaseQuantity: inputValue
      })
    }
  },

  // 减少课程
  Degression: function (e) {
    let inputValue = this.data.purchaseQuantity;

    if (inputValue > 1) {
      this.setData({
        purchaseQuantity: --inputValue
      })
    }
  },

  // 增加课程
  Ascending: function (e) {
    let inputValue = this.data.purchaseQuantity;
    let coursePrice = this.data.coursePrice;

    if (inputValue * coursePrice < 1000 - coursePrice) {
      this.setData({
        purchaseQuantity: ++inputValue
      })
    }
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