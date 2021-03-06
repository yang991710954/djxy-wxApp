// pages/selectTrainingMode/selectTrainingMode.js
import {
  APIHOST,
  httpRequest,
  showMessage,
  shareMessage,
  wxCloseAppOnError
} from '../../utils/util.js';

Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  // 自动评判
  autoJudge: function () {
    wx.vibrateShort({
      success: function () {
        setTimeout(function () {
          wx.navigateTo({
            url: '/pages/purchaseCourse/purchaseCourse',
          })
        }, 500)
      }
    })
  },

  // 自动播报
  autoBroadcast: function () {
    wx.showModal({
      title: '温馨提示',
      content: '确定要发起自动播报练车请求吗？',
      success: function (res) {
        if (res.confirm) {
          // 发送练车请求
          httpRequest({
            url: APIHOST + 'api/v3/driving/driving/student/student_free_apply',
            contentType: 'application/x-www-form-urlencoded',
            method: 'post',
            success: function ({ data }) {
              if (data.result) {
                wx.vibrateShort({
                  success: function () {
                    wx.showToast({
                      title: '发送请求成功',
                      icon: 'success',
                      duration: 2000
                    })

                    wx.setStorageSync('backtrack', 'backtrack');

                    setTimeout(function () {
                      wx.switchTab({
                        url: '/pages/home/home',
                      })
                    }, 1000)
                  }
                })
              } else {
                wx.showModal({
                  title: '温馨提示',
                  content: '练车请求失败',
                  showCancel: false,
                  success: function (res) {
                    if (res.confirm) {
                      wx.switchTab({
                        url: '/pages/home/home',
                      })
                    }
                  }
                })
              }
            },
            error: function () {
              showMessage('网络请求错误')
            }
          })
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