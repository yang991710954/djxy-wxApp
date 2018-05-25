import {
  APIHOST,
  phoneReg,
  httpRequest,
  returnUrlObj,
  returnUrlParam,
  wxCloseAppOnError
} from '../../utils/util.js';

Page({
  /**
   * 页面的初始数据
   */
  data: {
    coachName: '张教练代发恐龙当家',
    mileageNum: '100'
  },

  onScanQR: function () {
    wx.scanCode({
      success: (res) => {
        console.log(res);
        wx.showToast({
          title: '成功',
          icon: 'success',
          duration: 2000
        })
      }
    })
  },

  onBindCoach: function () {
    wx.navigateTo({
      url: '/pages/bindCoach/bindCoach',
    })
  },

  lookAllTrainRecords: function () {
    wx.navigateTo({
      url: '/pages/trainingRecords/trainingRecords',
    })
  },

  jumpCoachCard: function () {
    wx.navigateTo({
      url: '/pages/coachCard/coachCard',
    })
  },

  jumpPurchaseCourse: function () {
    wx.navigateTo({
      url: '/pages/purchaseCourse/purchaseCourse',
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // options 中的 scene 需要使用 decodeURIComponent 才能获取到生成二维码时传入的 scene
    var scene = decodeURIComponent(options.scene)
    var query = options.query // 3736
    console.log(scene);
    console.log(query);

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        wx.setStorageSync('CODE', res.code);
        httpRequest({
          url: APIHOST + 'api/base/binding_checking_api/f/binding_checking_stu_min_app',
          contentType: 'application/x-www-form-urlencoded',
          method: 'post',
          data: {
            code: res.code,
            state: 1
          },
          success: function ({ data }) {
            let resObj = data.result;

            if (resObj) {
              wx.setStorageSync('OPEN_ID', resObj.openid);

              //1.1判断用户有无绑定微信,没有则跳转到登录
              if (!resObj.bindWeixin) {
                wx.redirectTo({
                  url: '/pages/myInfo/bindUser/bindUser',
                })
                return;
              }

              //1.2获取token并缓存起来
              if (resObj.accessToken) {
                wx.setStorageSync('SESSION_KEY', resObj.accessToken);
              } else {
                wx.showToast({
                  title: '获取token失败',
                  icon: 'none',
                  image: '/images/exclamation.png',
                  duration: 2000
                })
              }

              //2没有老教练直接绑定新教练,然后跳转到购买课程
              (function serviceLogic() {
                var coach = resObj.coach;
                var currentCoach = resObj.newCoach;

                if (coach) {
                  var coachId = coach.userId;
                  var coachName = coach.name;

                  var newCoach = resObj.newCoach;
                  var newCoachId = newCoach.coachId;

                  // 对比当前扫码教练和老教练
                  if (coachId != newCoachId) { //不是同一个教练
                    if (!resObj.hasCourse) {
                      //有体验券绑定教练和跳转练车
                      if (resObj.hasVoucher) {

                        //do something 业务逻辑
                        wx.showToast({
                          title: '不同教练有体验券',
                          icon: 'success',
                          duration: 2000
                        })

                        // if (state === 'from_wxgzh') {
                        //   wx.redirectTo({
                        //     url: '/pages/purchaseCourse/purchaseCourse',
                        //   })
                        //   return;
                        // }

                      }
                      // 重新绑定关系
                      UnbundlingRelationship();
                    }

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
                              url: APIHOST + '/api/v3/driving/driving/student/unbind_coach',
                              success: function ({ data }) {
                                if (data.result) {
                                  //绑定教练
                                  httpRequest({
                                    url: APIHOST + '/api/base/s_stu_info_api/bind_coach',
                                    data: { coachId: newCoachId },
                                    success: function ({ data }) {
                                      if (data.result) {

                                        //do something 业务逻辑
                                        wx.showToast({
                                          title: '绑定教练成功',
                                          icon: 'success',
                                          duration: 2000
                                        })

                                        // if (model === 'from_zdbb') {
                                        //   location.replace('./selectTrainingMode.html');
                                        // } else {
                                        //   location.replace('./buycoures_one.html');
                                        // }

                                      } else {
                                        wxCloseAppOnError('绑定教练失败,请重试!')
                                      }
                                    },
                                    error: function () {
                                      wxCloseAppOnError('绑定教练出错,请重试!')
                                    }
                                  })
                                } else {
                                  wxCloseAppOnError('解绑教练失败,请重试!')
                                }
                              },
                              error: function () {
                                wxCloseAppOnError('解绑教练出错,请重试!')
                              }
                            })
                          } else if (res.cancel) {
                            wxCloseAppOnError('您已放弃练车!')
                          }
                        }
                      })
                    }
                  } else {//是同一个教练
                    //3.判断有无课程及跳转(判断是否来自微信公众号)
                    if (!resObj.hasCourse) {
                      //有体验券绑定教练和跳转练车
                      if (resObj.hasVoucher) {

                        //do something 业务逻辑
                        wx.showToast({
                          title: '同一教练有体验券',
                          icon: 'success',
                          duration: 2000
                        })

                        // if (state === 'from_wxgzh') {
                        //   location.replace('./purchasedcourses.html');
                        //   return;
                        // }
                      } else {

                        //do something 业务逻辑
                        wx.navigateTo({//去购买课程
                          url: '/pages/purchaseCourse/purchaseCourse',
                        })

                        // //去购买课程
                        // if (model === 'from_zdbb') {
                        //   location.replace('./selectTrainingMode.html');
                        // } else {
                        //   location.replace('./buycoures_one.html');
                        // }
                      }
                    } else {

                      //do something 业务逻辑
                      wx.showToast({
                        title: '同一教练有课程',
                        icon: 'success',
                        duration: 2000
                      })

                      // //有课程绑定教练和跳转练车
                      // location.replace('./purchasedcourses.html');
                      // return;
                    }
                  }
                } else {
                  // 通过参数查询扫码教练id
                  var currentCoachId = currentCoach.coachId;
                  console.log(currentCoachId)

                  //绑定教练
                  httpRequest({
                    url: APIHOST + '/api/base/s_stu_info_api/bind_coach',
                    data: { coachId: currentCoachId },
                    success: function ({ data }) {
                      if (data.result) {

                        //do something 业务逻辑
                        wx.showToast({
                          title: '不同教练有体验券',
                          icon: 'success',
                          duration: 2000
                        })
                        // if (model === 'from_zdbb') {
                        //   location.replace('./selectTrainingMode.html');
                        // } else {
                        //   location.replace('./buycoures_one.html');
                        // }

                      } else {
                        wxCloseAppOnError('绑定教练失败,请重试!')
                      }
                    },
                    error: function () {
                      wxCloseAppOnError('绑定教练出错,请重试!')
                    }
                  })
                }
              })()

            } else {
              wxCloseAppOnError('系统错误，请稍后重试！')
            }
          },
          error: function (err) {
            wxCloseAppOnError('系统错误，请稍后重试！')
          }
        })
      }
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