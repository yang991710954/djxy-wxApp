import {
  APIHOST,
  phoneReg,
  showMessage,
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
    coachName: '',
    mileageNum: '100',
    isBindCoach: false,
    courseInfo: {},
    achievement: 0, //成绩
    practiceStatistics: {
      totalDistance: 0, //总里程
      totalTime: 0, //总时间
      totalTravel: 0, //总次数
      trainTravel: 0, //训练次数
      examTravel: 0, //考试次数
    }
  },

  // 扫码练车
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

  // 跳转到绑定教练页
  onBindCoach: function () {
    wx.navigateTo({
      url: '/pages/bindCoach/bindCoach',
    })
  },

  // 跳转到练车记录页
  lookAllTrainRecords: function () {
    wx.navigateTo({
      url: '/pages/trainingRecords/trainingRecords',
    })
  },

  // 跳转到教练详情页
  jumpCoachCard: function () {
    wx.navigateTo({
      url: '/pages/coachCard/coachCard',
    })
  },

  // 跳转到购买课程
  jumpPurchaseCourse: function () {
    wx.navigateTo({
      url: '/pages/purchaseCourse/purchaseCourse',
    })
  },


  // 阿里OSS 获取头像
  aliOss: function () {
    httpRequest({
      url: APIHOST + 'api/base/user/sts/bucketname_userid_r_files',
      success: function ({ data }) {
        if (data.result) {
          console.log(data)
        }
      }
    })
  },

  // 保存课程信息
  saveVourseInfo: function (obj) {
    this.setData({
      courseInfo: {
        title: obj.packagesName || '暂无可用课程',
        expiryDate: obj.expiryDate ? obj.expiryDate.slice(0, 10) : '无',
        remainingTime: obj.remainingTime || 0,
        timeAll: obj.timeAll || 0,
      }
    })
  },

  // 获取学员练车统计
  getDrivingStatistics: function () {
    let _this = this;
    httpRequest({
      url: APIHOST + 'api/v3/driving/collection/stu_driving_statistics',
      success: function ({ data }) {
        let dataObj = data.result;

        if (dataObj) {
          _this.setData({
            practiceStatistics: {
              totalDistance: dataObj.totalDistance ? (dataObj.totalDistance / 1000).toFixed(2) : 0, //总里程
              totalTime: dataObj.totalTime || 0, //总时间
              totalTravel: dataObj.totalTravel || 0, //总次数
              trainTravel: dataObj.trainTravel || 0, //训练次数
              examTravel: dataObj.examTravel || 0, //考试次数
            }
          })
        }

        //获取上次练车成绩
        _this.getPracticeResults();
      },
      error: function () {
        showMessage('获取信息出错')
      }
    })
  },

  // 获取本人信息
  getStudentInfo: function () {
    httpRequest({
      url: APIHOST + '/api/base/user/info',
      success: function ({ data }) {
        let dataObj = data.result;

        if (dataObj && dataObj.id) {
          wx.setStorageSync('USER_INFO', JSON.stringify(dataObj));
        } else {
          showMessage('获取信息失败')
        }
      },
      error: function () {
        showMessage('获取信息出错')
      }
    })
  },

  // 获取绑定获取教练信息
  getCocahInfo: function () {
    let _this = this;
    httpRequest({
      url: APIHOST + 'api/base/s_stu_info_api/load_bind',
      success: function ({ data }) {
        let dataObj = data.result;

        if (dataObj && dataObj.userId) {

          _this.setData({
            isBindCoach: true,
            coachName: dataObj.name
          })

          wx.setStorageSync('COACH_INFO', JSON.stringify(dataObj));
        } else {
          showMessage('获取信息失败')
        }
      },
      error: function () {
        showMessage('获取信息出错')
      }
    })
  },

  //获取上次练车成绩
  getPracticeResults: function () {
    let _this = this;
    httpRequest({
      url: APIHOST + 'api/v3/driving/driving/line_use_api/line_record',
      data: { pageNum: 1, pageSize: 1 },
      success: function ({ data }) {
        let trainList = data.result.list;
        if (trainList.length) {
          _this.setData({
            achievement: trainList[0].totalScore || 0 //成绩
          })
        }
      },
      error: function () {
        showMessage('获取信息出错')
      }
    })
  },

  // 初始化首页显示
  initHome: function () {
    let _this = this;
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

                // 阿里OSS 获取头像
                // this.aliOss();

                // 获取学员信息
                _this.getStudentInfo();

                // 获取绑定获取教练信息
                _this.getCocahInfo();

                // 获取学员练车统计
                _this.getDrivingStatistics();

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

                var courseInfo = resObj.hasCourse;
                var voucherInfo = resObj.hasVoucher;

                // 保存课程信息
                _this.saveVourseInfo({});

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

                        // 保存课程信息
                        _this.saveVourseInfo(voucherInfo);

                        // if (state === 'from_wxgzh') {
                        //   wx.redirectTo({
                        //     url: '/pages/purchaseCourse/purchaseCourse',
                        //   })
                        //   return;
                        // }

                      }

                      // 保存课程信息
                      _this.saveVourseInfo(courseInfo);

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
                                        _this.getCocahInfo(); // 获取绑定获取教练信息

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

                        // 保存课程信息
                        _this.saveVourseInfo(voucherInfo);

                        // if (state === 'from_wxgzh') {
                        //   location.replace('./purchasedcourses.html');
                        //   return;
                        // }
                      } else {

                        //do something 业务逻辑
                        wx.navigateTo({//去购买课程
                          url: '/pages/selectTrainingMode/selectTrainingMode',
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

                      // 保存课程信息
                      _this.saveVourseInfo(courseInfo);

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
                        _this.getCocahInfo(); // 获取绑定获取教练信息

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
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // options 中的 scene 需要使用 decodeURIComponent 才能获取到生成二维码时传入的 scene
    var scene = decodeURIComponent(options.scene)
    var query = options.query // 3736
    console.log(scene);
    console.log(query);

    this.initHome();// 初始化首页显示
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