// pages/welcome/welcome.js
import {
  APIHOST,
  httpRequest,
  showMessage,
  shareMessage,
  wxCloseAppOnError
} from '../../utils/util.js';

const promise = require("../../utils/promise.min.js");

Page({
  /**
   * 页面的初始数据
   */
  data: {
    activeUrl: '',
    countDown: 5,
    coachId: '',
    initData: '',
    isShow: false,
    timerId: void (0),
  },

  // 获取首页图片
  getActiveImg: function () {
    let _this = this;

    httpRequest({
      loading: true,
      url: APIHOST + 'api/base/banner/f/load_banners_by_code',
      // contentType: 'application/x-www-form-urlencoded',
      data: { code: 'STUSTART_V3' },
      success: function ({ data }) {
        let resObj = data.result;

        if (resObj[0]) {
          _this.setData({
            activeUrl: resObj[0].link
          })
        }
      },
      error: function () {
        showMessage('获取图片失败')
      }
    })
  },

  // 跳转页面
  jumpPage: function () {
    let resObj = this.data.initData;

    let courseInfo = resObj.hasCourse;

    let voucherInfo = resObj.hasVoucher;

    clearInterval(this.data.timerId);

    this.setData({
      isShow: false
    })

    //1.1判断用户有无绑定微信,没有则跳转到登录
    if (!resObj.bindWeixin) {
      wx.redirectTo({
        url: '/pages/myInfo/bindUser/bindUser',
      })
      return;
    }

    if (!courseInfo && !voucherInfo) {
      // 设置home页跳转
      wx.setStorageSync('jump', '/pages/selectTrainingMode/selectTrainingMode');
    }

    wx.switchTab({
      url: '/pages/home/home',
    })

  },

  // 设置定时器
  setTimer: function (callback) {
    this.setData({
      timerId: setInterval(() => {
        this.setData({
          countDown: --this.data.countDown
        })

        if (this.data.countDown <= 0) {
          clearInterval(this.data.timerId);

          callback && callback();
        }
      }, 1000)
    })
  },

  // 初始化数据
  initData: function () {
    let _this = this;
    let PromiseObj = new Promise(function (resolve, reject) {
      // 登录
      wx.login({
        success: res => {
          // 发送 res.code 到后台换取 openId, sessionKey, unionId
          wx.setStorageSync('CODE', res.code);
          httpRequest({
            loading: true,
            url: APIHOST + 'api/base/binding_checking_api/f/binding_checking_stu_min_app',
            contentType: 'application/x-www-form-urlencoded',
            method: 'post',
            data: {
              code: res.code,
              state: _this.data.coachId
            },
            success: function ({ data }) {
              let resObj = data.result;

              if (resObj) {
                resolve(resObj);
                wx.setStorageSync('OPEN_ID', resObj.openid);

                console.log('执行完成');
              } else {
                reject('系统错误，请稍后重试！');
                console.log('系统错误，请稍后重试！');
              }
            }
          })
        }
      })
    })
    return PromiseObj;
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // options 中的 scene 需要使用 decodeURIComponent 才能获取到生成二维码时传入的 scene
    let scene = decodeURIComponent(options.scene)
    let query = options.query || {};

    let model = query.model ? query.model : 'from_zdpp';
    let coachId = query.coachId ? query.coachId : '';

    this.setData({
      model: model,
      coachId: coachId
    })

    wx.setStorageSync('model', model);
    wx.setStorageSync('coachId', coachId);

    // 获取首页图片
    this.getActiveImg();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    let _this = this;

    // 初始化数据
    this.initData()
      .then(function (data) {
        let resObj = data;

        _this.setData({
          initData: resObj,
          isShow: true
        })

        let courseInfo = resObj.hasCourse;
        let voucherInfo = resObj.hasVoucher;

        _this.setTimer(function () {
          _this.setData({
            isShow: false
          })

          //1.1判断用户有无绑定微信,没有则跳转到登录
          if (!resObj.bindWeixin) {
            wx.redirectTo({
              url: '/pages/myInfo/bindUser/bindUser',
            })
            return;
          }

          if (!courseInfo && !voucherInfo) {
            // 设置home页跳转
            wx.setStorageSync('jump', '/pages/selectTrainingMode/selectTrainingMode');
          }

          wx.switchTab({
            url: '/pages/home/home',
          })

        });

        console.log('resolved');

      }, function (err) {

        showMessage('初始化失败')
        console.log('rejected');

      })
      .catch(function (err) {

        console.log('catch');
        wxCloseAppOnError('系统错误，请稍后重试！')

      });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 移除标记
    wx.removeStorageSync('isUnbind');
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