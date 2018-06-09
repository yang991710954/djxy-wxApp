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
        }
      },
      error: function () {
        showMessage('获取图片失败')
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

    //1.1判断用户有无绑定微信,没有则跳转到登录
    if (!resObj.bindWeixin) {
      wx.redirectTo({
        url: '/pages/myInfo/bindUser/bindUser',
      })
      return;
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

  // 页面跳转逻辑
  JumpLogic: function () {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let _this = this;

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

    wx.setStorageSync('model', model);
    wx.setStorageSync('coachId', coachId);

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

          //1.1判断用户有无绑定微信,没有则跳转到登录
          if (!resObj.bindWeixin) {
            wx.redirectTo({
              url: '/pages/myInfo/bindUser/bindUser',
            })
            return;
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

        showMessage('初始化失败')
        console.log('rejected');

      })
      .catch(function (err) {

        console.log('catch');
        wxCloseAppOnError('系统错误，请稍后重试！')

      });
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
    // 移除标记
    wx.removeStorageSync('isUnbind');
    wx.removeStorageSync('specialTag');
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