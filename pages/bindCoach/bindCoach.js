// pages/bindCoach/bindCoach.js
import {
  APIHOST,
  phoneReg,
  showMessage,
  shareMessage,
  httpRequest,
  returnUrlObj
} from '../../utils/util.js';

Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  //绑定教练
  bindCoach: function (CoachId) {
    httpRequest({
      url: APIHOST + '/api/base/s_stu_info_api/bind_coach',
      data: { coachId: CoachId },
      success: function ({ data }) {
        if (data.result) {

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

        } else {
          showMessage('绑定教练失败')
        }
      },
      error: function () {
        showMessage('绑定教练出错')
      }
    })
  },

  // 扫码绑定教练
  jumpScanQRPage: function () {
    let _this = this;
    wx.scanCode({
      success: (res) => {
        console.log(res);

        let urlObj = returnUrlObj(res.path);

        if (res.errMsg != "scanCode:ok") {

          showMessage('扫码失败');
          return;

        }

        if (urlObj.appid && urlObj.appid === 'student_min_app') {

          let model = urlObj.model ? urlObj.model : 'from_zdpp';
          let coachId = urlObj.coachId ? urlObj.coachId : '';

          console.log('coachId: ' + coachId);

          wx.setStorageSync('model', model);
          wx.setStorageSync('coachId', coachId);

          coachId && _this.bindCoach(coachId);

        } else {

          showMessage('错误的二维码');

        }
      }
    })
  },

  // 跳转手机搜索
  jumpPhoneSearch: function () {
    wx.navigateTo({
      url: '/pages/bindCoach/SearchPhone/SearchPhone',
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