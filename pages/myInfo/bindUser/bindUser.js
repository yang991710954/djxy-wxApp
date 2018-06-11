import {
  APIHOST,
  phoneReg,
  wxCloseApp,
  httpRequest,
  showMessage,
  shareMessage,
  returnUrlObj,
  returnUrlParam
} from '../../../utils/util.js';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    time: 60,
    phoneNumber: '',
    verification: '',
    victoryFlag: true,
    state: wx.getStorageSync('coachId') || '',
    openId: wx.getStorageSync('OPEN_ID'),
    token: wx.getStorageSync('SESSION_KEY')
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
    if (!this.data.victoryFlag) {
      wx.showToast({
        title: '请勿重复请求',
        icon: 'none',
        image: '/images/exclamation.png',
        duration: 2000
      })
      return;
    }
    let phone = this.data.phoneNumber.trim();
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


    let _this = this;

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

    // 请求授权
    httpRequest({
      url: APIHOST + 'api/base/user/f/stu_min_app_register',
      method: 'post',
      data: {
        user_id: phone,
        code: verification,
        user_type: 1,
        openid: _this.data.openId,
        state: _this.data.state
      },
      contentType: 'application/x-www-form-urlencoded',
      success: function ({ data }) {
        console.log('stu_min_app_register')
        console.log(data)
        console.log('stu_min_app_register')

        //短信码错误停止运行
        if (data.error) {
          wx.showToast({
            title: data.error.message,
            icon: 'none',
            image: '/images/exclamation.png',
            duration: 2000
          })
          return;
        }
        let dataObj = {
          url: APIHOST + '/se/oauth/token',
          login_type: 0,
          password: _this.data.openId,
          username: phone,
          grant_type: 'password',
          oauth_code: 'Basic ZGphcHA6ZTRhMjdjNDUtY2M4Ni00NjUxLThlNDAtMTY0YTkzODkyMWMx'
        }

        // 请求并跳转页面
        httpRequest({
          loading: true,
          url: APIHOST + 'api/ui/base/user/get_auth_token?' + returnUrlParam(dataObj),
          method: 'post',
          success: function ({ data }) {
            let resData = data.result;
            console.log('get_auth_token')
            console.log(resData)
            console.log('get_auth_token')

            if (!resData) {
              wx.showToast({
                title: '获取token失败',
                icon: 'none',
                image: '/images/exclamation.png',
                duration: 2000
              })
              return;
            }
            let accessResult = JSON.parse(resData);

            _this.setData({
              token: accessResult.access_token
            })

            //将用户信息缓存起来
            wx.setStorageSync('SESSION_KEY', _this.data.token);

            wx.vibrateLong({
              success: function () {
                wx.showToast({
                  title: '授权成功',
                  icon: 'success',
                  duration: 2000
                })
              }
            })

            // 判断用户是否有课程
            httpRequest({
              url: APIHOST + 'api/v3/driving/driving/student/has_packages_driving_voucher',
              success: function (res) {
                let resData = res.data.result;
                console.log(resData)
                if (resData) {
                  //有课程绑定教练和跳转练车
                  wx.switchTab({
                    url: '/pages/home/home',
                  })
                } else {
                  httpRequest({
                    url: APIHOST + 'api/v3/driving/driving/student/has_driving_voucher',
                    success: function (res) {
                      let resData = res.data.result;
                      console.log(resData)
                      if (resData) {
                        //有体验券绑定教练和跳转练车
                        wx.switchTab({
                          url: '/pages/home/home',
                        })
                      } else {
                        //啥都没有直接绑定教练买课程
                        wx.redirectTo({
                          url: '/pages/purchaseCourse/purchaseCourse',
                        })
                      }
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
                }
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