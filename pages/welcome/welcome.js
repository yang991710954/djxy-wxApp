// pages/welcome/welcome.js
import {
  APIHOST,
  httpRequest,
  showMessage,
  shareMessage,
  wxReloadPage,
  wxCloseAppOnError
} from '../../utils/util.js';

const App = getApp();//获取应用实例
const promise = require("../../utils/promise.min.js");

Page({
  /**
   * 页面的初始数据
   */
  data: {
    activeUrl: '',
    countDown: 5,
    coachId: '',
    initObj: '',
    model: '',
    isShow: false,
    timerId: void (0),
  },

  // 获取首页图片
  getActiveImg: function () {
    let _this = this;

    httpRequest({
      loading: true,
      url: APIHOST + 'api/base/banner/f/load_banners_by_code',
      data: { code: 'STUSTART_V3' },
      success: function ({ data }) {
        let resObj = data.result;

        if (resObj[0]) {
          _this.setData({
            activeUrl: resObj[0].link
          })

          wx.setStorageSync('ActiveImg', resObj[0].link);

        } else {
          // 没获取到读缓存
          _this.setData({
            activeUrl: wx.getStorageSync('ActiveImg')
          })
        }
      },
      error: function () {
        // 没获取到读缓存
        _this.setData({
          activeUrl: wx.getStorageSync('ActiveImg')
        })
      }
    })
  },

  // 跳转页面
  jumpPage: function () {
    let _this = this;

    let resObj = this.data.initObj;

    let coach = resObj.coach;
    let currentCoach = resObj.newCoach;

    let courseInfo = resObj.hasCourse;
    let voucherInfo = resObj.hasVoucher;

    let courseObj = courseInfo || voucherInfo;
    let hasObj = !courseInfo && !voucherInfo;

    clearInterval(this.data.timerId);

    this.setData({
      isShow: false
    })

    // 校验openid
    if (resObj.openid) {

      // 保存openid到全局
      App.globalData.g_openid = resObj.openid;

    } else {
      wxReloadPage('网络请求失败，滴驾正在为您重新加载数据！', function () {
        _this.onShow();
      })
      return;
    }

    //判断用户有无绑定微信,没有则跳转到登录
    if (!resObj.bindWeixin) {
      wx.redirectTo({
        url: '/pages/myInfo/bindUser/bindUser',
      })
      return;
    }

    //获取token并缓存起来
    if (resObj.accessToken) {
      wx.setStorageSync('SESSION_KEY', resObj.accessToken);
    }

    // 没有当前扫码教练
    if (!currentCoach) {
      wx.switchTab({
        url: '/pages/home/home',
      })
      return;
    }

    let newCoach = resObj.newCoach;
    let newCoachId = newCoach.coachId;
    let model = _this.data.model;

    // 有老教练
    if (coach) {
      let coachId = coach.userId;
      let coachName = coach.name;

      // 对比当前扫码教练和老教练
      if (coachId != newCoachId) { //不是同一个教练
        wx.switchTab({
          url: '/pages/home/home',
        })
        return;

      } else {

        if (courseObj) {
          wx.switchTab({
            url: '/pages/home/home',
          })
          return;
        }

        if (model === 'from_zdpp') {
          wx.redirectTo({
            url: '/pages/purchaseCourse/purchaseCourse',
          })
        } else if (model === 'from_zdbb') {
          wx.redirectTo({
            url: '/pages/selectTrainingMode/selectTrainingMode',
          })
        } else {
          wx.switchTab({
            url: '/pages/home/home',
          })
        }

      }
    } else {
      // 绑定教练
      httpRequest({
        url: APIHOST + '/api/base/s_stu_info_api/bind_coach',
        data: { coachId: newCoachId },
        success: function ({ data }) {

          console.log(data.result);

          if (data.result) {

            if (voucherInfo) {
              wx.switchTab({
                url: '/pages/home/home',
              })

            } else {

              if (model === 'from_zdpp') {
                wx.redirectTo({
                  url: '/pages/purchaseCourse/purchaseCourse',
                })
              } else if (model === 'from_zdbb') {
                wx.redirectTo({
                  url: '/pages/selectTrainingMode/selectTrainingMode',
                })
              } else {
                wx.switchTab({
                  url: '/pages/home/home',
                })
              }

            }
          } else {
            showMessage('绑定教练失败');
          }
        },
        error: function () {
          showMessage('绑定教练出错')
        }
      })
    }

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

              console.log(resObj);

              if (resObj) {
                resolve(resObj);

                console.log('执行完成');

              } else {
                reject(data);

                console.log('执行完成');
              }
            },
            error: function (err) {
              reject(err);
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
    // 清楚缓存
    wx.removeStorageSync('model');
    wx.removeStorageSync('OPEN_ID');
    wx.removeStorageSync('SESSION_KEY');
    wx.removeStorageSync('isUnbind');
    wx.removeStorageSync('specialTag');

    // options 中的 scene 需要使用 decodeURIComponent 才能获取到生成二维码时传入的 scene
    // let scene = decodeURIComponent(options.scene)
    // let query = options.query || {};

    let model = options.model ? options.model : '';
    let coachId = options.coachId ? options.coachId : '';

    console.log('model: ' + model);
    console.log('coachId: ' + coachId);

    this.setData({
      model: model,
      coachId: coachId
    })

    // 获取首页图片
    this.getActiveImg();

    // 保存coachId\model到全局
    App.globalData.g_state = coachId;
    App.globalData.g_model = model;
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    // 测试调用全局数据
    console.log(App.globalData);
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let _this = this;
    // 初始化数据
    this.initData()
      .then(function (data) {
        let resObj = data;

        _this.setData({
          initObj: resObj,
          isShow: true
        })

        let coach = resObj.coach;
        let currentCoach = resObj.newCoach;

        let courseInfo = resObj.hasCourse;
        let voucherInfo = resObj.hasVoucher;

        let courseObj = courseInfo || voucherInfo;
        let hasObj = !courseInfo && !voucherInfo;

        _this.setTimer(function () {
          _this.setData({
            isShow: false
          })

          // 校验openid
          if (resObj.openid) {

            // 保存openid到全局
            App.globalData.g_openid = resObj.openid;

          } else {
            wxReloadPage('网络请求失败，滴驾正在为您重新加载数据！', function () {
              _this.onShow();
            })
            return;
          }

          //判断用户有无绑定微信,没有则跳转到登录
          if (!resObj.bindWeixin) {
            wx.redirectTo({
              url: '/pages/myInfo/bindUser/bindUser',
            })
            return;
          }

          //获取token并缓存起来
          if (resObj.accessToken) {
            wx.setStorageSync('SESSION_KEY', resObj.accessToken);
          }

          // 没有当前扫码教练
          if (!currentCoach) {
            wx.switchTab({
              url: '/pages/home/home',
            })
            return;
          }

          let newCoach = resObj.newCoach;
          let newCoachId = newCoach.coachId;
          let model = _this.data.model;

          // 有老教练
          if (coach) {
            let coachId = coach.userId;
            let coachName = coach.name;

            // 对比当前扫码教练和老教练
            if (coachId != newCoachId) { //不是同一个教练
              wx.switchTab({
                url: '/pages/home/home',
              })
              return;

            } else {

              if (courseObj) {
                wx.switchTab({
                  url: '/pages/home/home',
                })
                return;
              }

              if (model === 'from_zdpp') {
                wx.redirectTo({
                  url: '/pages/purchaseCourse/purchaseCourse',
                })
              } else if (model === 'from_zdbb') {
                wx.redirectTo({
                  url: '/pages/selectTrainingMode/selectTrainingMode',
                })
              } else {
                wx.switchTab({
                  url: '/pages/home/home',
                })
              }

            }
          } else {
            // 绑定教练
            httpRequest({
              url: APIHOST + '/api/base/s_stu_info_api/bind_coach',
              data: { coachId: newCoachId },
              success: function ({ data }) {

                console.log(data.result);

                if (data.result) {

                  if (voucherInfo) {
                    wx.switchTab({
                      url: '/pages/home/home',
                    })

                  } else {

                    if (model === 'from_zdpp') {
                      wx.redirectTo({
                        url: '/pages/purchaseCourse/purchaseCourse',
                      })
                    } else if (model === 'from_zdbb') {
                      wx.redirectTo({
                        url: '/pages/selectTrainingMode/selectTrainingMode',
                      })
                    } else {
                      wx.switchTab({
                        url: '/pages/home/home',
                      })
                    }

                  }
                } else {
                  showMessage('绑定教练失败')
                }
              },
              error: function () {
                showMessage('绑定教练出错')
              }
            })
          }

        });

        console.log('resolved');

      }, function (err) {

        console.log('rejected');

        if (err.errMsg && err.errMsg === "request:fail timeout") {

          wxReloadPage('网络请求超时，滴驾正在为您重新加载数据！', function () {
            _this.onShow();
          })

        } else {

          wxReloadPage('网络请求失败，滴驾正在为您重新加载数据！', function () {
            _this.onShow();
          })
        }

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