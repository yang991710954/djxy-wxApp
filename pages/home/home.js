import {
  APIHOST,
  phoneReg,
  showMessage,
  shareMessage,
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
    coachName: '滴驾教练',//教练姓名
    coachId: '',//教练Id
    isBindCoach: false,//是否绑定教练
    courseInfo: {},//课程信息
    achievement: 0, //成绩
    practiceStatistics: {
      totalDistance: 0, //总里程
      totalTime: 0, //总时间
      totalTravel: 0, //总次数
      trainTravel: 0, //训练次数
      examTravel: 0, //考试次数
    },
    inputName: '',//用户名
    isShowModel: false,//是否显示信息补充框
    courseFlag: true,//查询有无课程的标记
    model: '',//练车模式1.自动播报：form_zdbb；2.自动评判：form_zdpp
    trainState: 0,//是否练车状态
    isLoading: true,
  },

  // 扫码练车
  onScanQR: function () {
    let _this = this;

    wx.setStorageSync('isScanQR', 'ScanQR');

    // 二维码地址示例：pages/welcome/welcome?appid=student_min_app&coachId=9328&model=from_zdpp
    wx.scanCode({
      success: (res) => {
        console.log(res);

        let urlObj = returnUrlObj(res.path);

        if (res.errMsg != "scanCode:ok") {

          _this.setData({
            isLoading: false
          })
          showMessage('扫码失败');
          return;
        }

        if (urlObj.appid && urlObj.appid === 'student_min_app') {

          let model = urlObj.model ? urlObj.model : '';
          let coachId = urlObj.coachId ? urlObj.coachId : '';

          _this.setData({
            model: model,
            coachId: coachId
          })

          wx.removeStorageSync('specialTag');

          wx.setStorageSync('model', model);
          wx.setStorageSync('coachId', coachId);

        } else {
          _this.setData({
            isLoading: false
          })
          showMessage('无效的二维码');
        }
      }
    })
  },

  // 发送练车请求
  sendPracticeRequest: function () {
    let _this = this;

    httpRequest({
      url: APIHOST + 'api/v3/driving/driving/student/student_apply',
      method: 'post',
      success: function ({ data }) {
        if (data.result) {
          wx.showToast({
            title: '练车请求成功',
            icon: 'success',
            duration: 2000
          })

          _this.setData({
            trainState: 1
          })
        } else {
          showMessage('练车请求失败');
        }
      },
      error: function () {
        showMessage('练车请求出错');
      }
    })
  },

  // 取消练车请求
  cancelTrainRequest: function () {
    let _this = this;

    wx.showModal({
      title: '温馨提示',
      content: '确定要取消练车请求吗？',
      success: function (res) {
        if (res.confirm) {

          // 结束(取消)练车
          _this.endPractice();

        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },

  // 结束(取消)练车
  endPractice: function () {
    let _this = this;

    httpRequest({
      loading: true,
      url: APIHOST + 'api/v3/driving/driving/student/student_cancel',
      method: 'post',
      success: function ({ data }) {
        let state = data.result;

        console.log('结束练车: ' + state);

        // 修改练车状态
        _this.setData({
          trainState: state ? 0 : 1
        })

        wx.showToast({
          title: '取消练车成功',
          icon: 'success',
          duration: 2000
        })

      },
      error: function () {
        showMessage('取消练车失败');
      }
    })
  },

  // 查询练车转态
  getTrainState: function () {
    let _this = this;

    httpRequest({
      url: APIHOST + 'api/v3/driving/driving/student/load_student_auth',
      success: function ({ data }) {
        let state = data.result;

        // 修改练车状态
        _this.setData({
          trainState: state ? 1 : 0
        })

      },
      error: function () {
        showMessage('查询状态出错');
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

  // 获取输入框的值
  bindNameInput: function (e) {
    this.setData({
      inputName: e.detail.value
    })
  },

  // 关闭弹框
  onCancel: function () {
    this.setData({
      isShowModel: false
    })
  },

  //保存用户名
  onConfirm: function () {
    let _this = this;
    let inputName = _this.data.inputName;

    if (!inputName) {
      showMessage('请输入姓名');
      return;
    }

    httpRequest({
      url: APIHOST + 'api/base/user/update_user_name',
      contentType: 'application/x-www-form-urlencoded',
      method: 'post',
      data: { userName: inputName },
      success: function ({ data }) {
        if (data.result) {
          _this.setData({
            isShowModel: false
          })

          // 更新本人信息
          _this.getStudentInfo();

          wx.showToast({
            title: '设置成功',
            icon: 'success',
            duration: 2000
          })
        }
      },
      error: function () {
        showMessage('设置失败');
      }
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
    let dataObj = obj ? obj : {};

    this.setData({
      courseInfo: {
        title: dataObj.packagesName || '暂无可用课程',
        expiryDate: dataObj.expiryDate ? dataObj.expiryDate.slice(0, 10) : '无',
        remainingTime: dataObj.remainingTime || 0,
        timeAll: dataObj.timeAll || 0,
      },
      courseFlag: obj ? true : false
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
    let _this = this;

    httpRequest({
      url: APIHOST + '/api/base/user/info',
      success: function ({ data }) {
        let dataObj = data.result;

        if (dataObj && dataObj.id) {
          if (!dataObj.user_name) {
            _this.setData({
              isShowModel: true
            })
          }
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

  //绑定教练
  bindCoach: function (newCoachId, courseObj) {
    let _this = this;

    httpRequest({
      url: APIHOST + '/api/base/s_stu_info_api/bind_coach',
      data: { coachId: newCoachId },
      success: function ({ data }) {
        if (data.result) {

          // 获取绑定教练信息
          _this.getCocahInfo();

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
            coachName: dataObj.name || dataObj.phone
          })

          wx.setStorageSync('COACH_INFO', JSON.stringify(dataObj));

        } else {

          _this.setData({
            isBindCoach: false
          })

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

  // 查询用户信息
  checkingUserInfo: function (code) {
    let _this = this;
    let loading = this.data.isLoading;

    this.setData({
      isLoading: true
    })

    httpRequest({
      loading: loading,
      url: APIHOST + 'api/base/binding_checking_api/f/binding_checking_stu_min_app',
      contentType: 'application/x-www-form-urlencoded',
      method: 'post',
      data: {
        code: code,
        state: _this.data.coachId
      },
      success: function ({ data }) {
        let resObj = data.result;

        console.log(resObj);

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

            // 获取绑定教练信息
            _this.getCocahInfo();

            // 查询练车转态
            _this.getTrainState();

            // 获取学员练车统计
            _this.getDrivingStatistics();

          }

          //do something!
          _this.serviceLogic(resObj);

        } else {
          wxCloseAppOnError('系统错误，请稍后重试！')
        }
      },
      error: function (err) {
        wxCloseAppOnError('系统错误，请稍后重试！')
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

        // 查询用户信息
        _this.checkingUserInfo(res.code);
      }
    })
  },

  // 跳转逻辑
  JumpModel: function () {
    let model = this.data.model;

    if (model === 'from_zdpp') {
      wx.navigateTo({
        url: '/pages/purchaseCourse/purchaseCourse',
      })
    } else {
      wx.navigateTo({
        url: '/pages/selectTrainingMode/selectTrainingMode',
      })
    }
  },

  // 练车逻辑
  serviceLogic: function (resObj) {
    let _this = this;

    console.log('serviceLogic')

    let coach = resObj.coach;
    let currentCoach = resObj.newCoach;

    let courseInfo = resObj.hasCourse;
    let voucherInfo = resObj.hasVoucher;

    let courseObj = courseInfo || voucherInfo;
    let hasObj = !courseInfo && !voucherInfo;

    let specialTag = wx.getStorageSync('specialTag');

    // 保存课程信息
    _this.saveVourseInfo(courseObj);

    console.log('specialTag: ' + specialTag)
    console.log(specialTag === 'DonTSend')

    if (specialTag === 'DonTSend') {
      wx.removeStorageSync('specialTag');
      return;
    }

    if (coach) {
      let coachId = coach.userId;
      let coachName = coach.name || coach.phone;

      // 如果没有新教练
      if (!currentCoach) {
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
                  url: APIHOST + '/api/v3/driving/driving/student/unbind_coach',
                  success: function ({ data }) {
                    if (data.result) {

                      //绑定教练
                      _this.bindCoach(newCoachId, courseObj);

                      // 保存课程信息
                      _this.saveVourseInfo(voucherInfo);

                    } else {
                      showMessage('解绑教练失败')
                    }
                  },
                  error: function () {
                    showMessage('解绑教练出错')
                  }
                })
              } else if (res.cancel) {
                showMessage('您已放弃练车')
              }
            }
          })
        }
      } else {//是同一个教练
        //3.判断有无课程及跳转(判断是否来自微信公众号)
        if (hasObj) {
          let backtrack = wx.getStorageSync('backtrack');
          let ScanQR = wx.getStorageSync('isScanQR');

          // 标记为无课程
          _this.setData({
            courseFlag: false
          })

          console.log('backtrack: ' + backtrack);
          console.log('ScanQR: ' + ScanQR);

          if (!backtrack || ScanQR) {
            // 跳转逻辑
            _this.JumpModel();
          }

          wx.removeStorageSync('backtrack');
          wx.removeStorageSync('isScanQR');

        } else {
          // 发送练车请求
          _this.sendPracticeRequest();
        }
      }
    } else {
      // 如果没有新教练
      if (!currentCoach) {
        _this.setData({
          isBindCoach: false
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
    let flag = wx.getStorageSync('isUnbind');
    let coachId = wx.getStorageSync('coachId');
    let model = wx.getStorageSync('model');

    if (coachId && flag != 'unbind') {
      this.setData({
        coachId: coachId,
        model: model
      })
    } else {
      this.setData({
        coachId: ''
      })
    }

    // 初始化或重载页面
    this.initHome();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    // 移除标记
    wx.removeStorageSync('isUnbind');

    // 标记为下次进来不发送练车请求
    wx.setStorageSync('specialTag', 'DonTSend');
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    wx.removeStorageSync('specialTag');
    wx.removeStorageSync('backtrack');
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