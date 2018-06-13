import {
  APIHOST,
  phoneReg,
  wxCloseApp,
  httpRequest,
  showMessage,
  shareMessage,
  returnUrlObj,
  returnUrlParam,
  wxCloseAppOnError
} from '../../../utils/util.js';

const App = getApp();//获取应用实例

Page({

  /**
   * 页面的初始数据
   */
  data: {
    time: 60,
    phoneNumber: '',
    verification: '',
    victoryFlag: true,
  },

  bindPhoneInput: function (e) {
    this.setData({
      phoneNumber: e.detail.value
    })
  },

  bindMsgInput: function (e) {
    this.setData({
      verification: e.detail.value
    })
  },

  cancelBtn: function () {
    // 关闭小程序
    wxCloseApp();
  },

  // 请求验证码
  getVerification: function () {
    let _this = this;
    let phone = this.data.phoneNumber.trim();

    if (!this.data.victoryFlag) {
      wx.showToast({
        title: '请勿重复请求',
        icon: 'none',
        image: '/images/exclamation.png',
        duration: 2000
      })
      return;
    }

    if (!phone) {
      wx.showToast({
        title: '请输入手机号',
        icon: 'none',
        image: '/images/exclamation.png',
        duration: 2000
      })
      return false;
    }

    if (!phoneReg.test(phone)) {
      wx.showToast({
        title: '手机号码不规范',
        icon: 'none',
        image: '/images/exclamation.png',
        duration: 2000
      })
      return false;
    }

    // 请求验证码
    httpRequest({
      url: APIHOST + 'api/base/user/f/send_h5_v_code',
      method: 'post',
      data: { 'user_id': phone },
      contentType: 'application/x-www-form-urlencoded',
      success: function (res) {
        console.log(res)
        wx.showToast({
          title: '请求已发出',
          icon: 'success',
          duration: 2000
        })

        _this.setData({
          victoryFlag: false
        })

        let timerId = setInterval(function () {
          if (_this.data.time > 0) {
            _this.setData({
              time: --_this.data.time
            })
          } else {
            clearInterval(timerId);

            _this.setData({
              victoryFlag: true,
              time: 60
            })
          }
        }, 1000)

      },
      error: function (err) {
        console.log(err)
        wx.showToast({
          title: '网络请求失败',
          icon: 'none',
          image: '/images/exclamation.png',
          duration: 2000
        })
        _this.setData({
          victoryFlag: true
        })
      }
    })
  },

  // 确认授权
  onbindConfirm: function () {
    let _this = this;
    let phone = this.data.phoneNumber.trim();
    let verification = this.data.verification.trim();
    let openId = App.globalData.g_openid;
    let coachId = App.globalData.g_coachId;
    let model = App.globalData.g_model;

    if (!phone) {
      wx.showToast({
        title: '请输入手机号',
        icon: 'none',
        image: '/images/exclamation.png',
        duration: 2000
      })
      return false;
    }
    if (!phoneReg.test(phone)) {
      wx.showToast({
        title: '手机号码不规范',
        icon: 'none',
        image: '/images/exclamation.png',
        duration: 2000
      })
      return false;
    }

    if (!verification) {
      wx.showToast({
        title: '请输入验证码',
        icon: 'none',
        image: '/images/exclamation.png',
        duration: 2000
      })
      return false;
    }

    if (!openId) {
      wx.showToast({
        title: '未获取到openId',
        icon: 'none',
        image: '/images/exclamation.png',
        duration: 2000
      })
      return false;
    }

    // 请求授权
    httpRequest({
      loading: true,
      url: APIHOST + 'api/base/user/f/stu_min_app_register',
      method: 'post',
      data: {
        user_type: 1,
        user_id: phone,
        code: verification,
        openid: openId,
        state: coachId
      },
      contentType: 'application/x-www-form-urlencoded',
      success: function ({ data }) {

        //短信码错误停止运行
        if (data.error) {
          wx.showToast({
            title: '授权失败',
            icon: 'none',
            image: '/images/exclamation.png',
            duration: 2000
          })
          return;
        }

        // 登录
        wx.login({
          success: res => {
            // 发送 res.code 到后台换取 openId, sessionKey, unionId
            httpRequest({
              loading: true,
              url: APIHOST + 'api/base/binding_checking_api/f/binding_checking_stu_min_app',
              contentType: 'application/x-www-form-urlencoded',
              method: 'post',
              data: {
                code: res.code,
                state: coachId
              },
              success: function ({ data }) {
                let resObj = data.result;
                console.log(resObj)

                //获取token并缓存起来
                if (resObj.accessToken) {
                  wx.setStorageSync('SESSION_KEY', resObj.accessToken);
                }

                if (resObj) {
                  // 练车逻辑
                  _this.serviceLogic(resObj);

                } else {

                  wxCloseAppOnError('请求数据失败，请稍后重试！');
                }
              },
              error: function (err) {
                if (err.errMsg && err.errMsg === "request:fail timeout") {

                  wxCloseAppOnError('网络请求超时，请稍后重试！')

                } else {

                  wxCloseAppOnError('网络请求失败，请稍后重试！')
                }
              }
            })
          }
        })
      },
      error: function (err) {
        console.log(err)
        wx.showToast({
          title: '请求出错,请重试!',
          icon: 'none',
          image: '/images/exclamation.png',
          duration: 2000
        })
      }
    })
  },

  // 练车逻辑
  serviceLogic: function (resObj) {
    let _this = this;

    let coach = resObj.coach;
    let currentCoach = resObj.newCoach;

    let courseInfo = resObj.hasCourse;
    let voucherInfo = resObj.hasVoucher;

    let courseObj = courseInfo || voucherInfo;
    let hasObj = !courseInfo && !voucherInfo;

    if (coach) {
      let coachId = coach.userId;
      let coachName = coach.name || coach.phone;

      // 如果没有新教练
      if (!currentCoach) {
        wx.switchTab({
          url: '/pages/home/home',
        })
        return;
      }

      let newCoach = resObj.newCoach;
      let newCoachId = newCoach.coachId;

      // 对比当前扫码教练和老教练
      if (coachId != newCoachId) { //不是同一个教练

        // 重新绑定关系
        UnbundlingRelationship();

        // 解绑老教练绑定新教练
        function UnbundlingRelationship() {
          //询问框
          wx.showModal({
            title: '温馨提示',
            content: '您需要先解除 ' + coachName + ' 教练的绑定才能进行后续操作（解除绑定后之前购买的课程也会失效）',
            confirmText: '现在绑定',
            success: function (res) {
              if (res.confirm) {
                //解绑教练
                httpRequest({
                  loading: true,
                  url: APIHOST + '/api/v3/driving/driving/student/unbind_coach',
                  success: function ({ data }) {
                    if (data.result) {

                      //绑定教练
                      _this.bindCoach(newCoachId, courseObj);

                    } else {
                      showMessage('解绑教练失败')
                    }
                  },
                  error: function () {
                    showMessage('解绑教练出错')
                  }
                })
              } else if (res.cancel) {
                wxCloseAppOnError('您已放弃练车')
              }
            }
          })
        }
      } else {//是同一个教练
        //3.判断有无课程及跳转(判断是否来自微信公众号)
        if (hasObj) {

          // 跳转逻辑
          _this.JumpModel();

        } else {
          // 发送练车请求
          _this.sendPracticeRequest();
        }
      }
    } else {
      // 如果没有新教练
      if (!currentCoach) {
        wx.switchTab({
          url: '/pages/home/home',
        })
        return;
      }

      // 通过参数查询扫码教练id
      let currentCoachId = currentCoach.coachId;
      console.log(currentCoachId)

      //绑定教练
      _this.bindCoach(currentCoachId)
    }
  },

  // 跳转逻辑
  JumpModel: function () {
    let model = App.globalData.g_model;

    if (model === 'from_zdpp') {
      wx.redirectTo({
        url: '/pages/purchaseCourse/purchaseCourse',
      })
    } else {
      wx.redirectTo({
        url: '/pages/selectTrainingMode/selectTrainingMode',
      })
    }
  },

  // 发送练车请求
  sendPracticeRequest: function () {
    let _this = this;

    httpRequest({
      loading: true,
      url: APIHOST + 'api/v3/driving/driving/student/student_apply',
      method: 'post',
      success: function ({ data }) {
        if (data.result) {
          wx.showToast({
            title: '练车请求成功',
            icon: 'success',
            duration: 2000
          })

          setTimeout(function () {
            wx.switchTab({
              url: '/pages/home/home',
            })
          }, 1000)

        } else {
          showMessage('练车请求失败');
        }
      },
      error: function () {
        showMessage('练车请求出错');
      }
    })
  },

  //绑定教练
  bindCoach: function (newCoachId, courseObj) {
    let _this = this;

    httpRequest({
      loading: true,
      url: APIHOST + '/api/base/s_stu_info_api/bind_coach',
      data: { coachId: newCoachId },
      success: function ({ data }) {
        if (data.result) {

          wx.showToast({
            title: '绑定教练成功',
            icon: 'success',
            duration: 2000
          })

          if (courseObj) {
            // 发送练车请求
            _this.sendPracticeRequest();
          } else {
            // 跳转逻辑
            _this.JumpModel();
          }

        } else {
          showMessage('绑定教练失败')
        }
      },
      error: function () {
        showMessage('绑定教练出错')
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