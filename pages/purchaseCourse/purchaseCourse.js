// pages/purchaseCourse/purchaseCourse.js
import {
  APIHOST,
  imgList,
  httpRequest,
  showMessage,
  shareMessage,
} from '../../utils/util.js';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgList: imgList,//课程图片集
  },

  jumpPage: function () {
    // 查询绑定教练
    httpRequest({
      url: APIHOST + '/api/base/s_stu_info_api/load_bind',
      success: function ({ data }) {
        if (!data.result) {

          wx.showModal({
            title: '温馨提示',
            content: '请先绑定教练才能购买课程哦',
            success: function (res) {
              if (res.confirm) {
                wx.navigateTo({
                  url: '/pages/bindCoach/bindCoach',
                })
              } else if (res.cancel) {
                wx.switchTab({
                  url: '/pages/home/home',
                })
              }
            }
          })

        } else {
          wx.navigateTo({
            url: '/pages/purchaseCourse/purchaseNow/purchaseNow',
          })
        }
      },
      error: function () {
        wx.showToast({
          title: '获取教练信息失败',
          icon: 'none',
          image: '/images/exclamation.png',
          duration: 2000
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中',
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
    wx.hideLoading();
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