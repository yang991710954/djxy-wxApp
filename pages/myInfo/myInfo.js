import {
  APIHOST,
  httpRequest,
  showMessage,
  shareMessage,
} from '../../utils/util.js';

Page({
  data: {
    userName: '匿名',
  },

  jumpPurchaseRecords: function () {
    wx.navigateTo({
      url: '/pages/courseRecord/courseRecord',
    })
  },

  jumpEidtUser: function () {
    wx.navigateTo({
      url: '/pages/myInfo/editUserInfo/editUserInfo',
    })
  },

  // 联系客服
  contactCustomerService: function () {
    wx.makePhoneCall({
      phoneNumber: '0731-89579365'
    })

    // wx.navigateTo({
    //   url: '/pages/customerService/customerService',
    // })
  },

  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
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
    let flag = JSON.parse(wx.getStorageSync('USER_INFO'));

    this.setData({
      userName: flag.user_name ? flag.user_name : flag.name,
    })
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
