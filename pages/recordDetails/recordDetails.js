// pages/recordDetails/recordDetails.js
import {
  APIHOST,
  httpRequest,
  showMessage,
  shareMessage,
  formatTimeSimplify,
  getTimeDifference,
} from '../../utils/util.js';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    timeDifference: 0,//所用时间
    Distance: 0,//里程
    totalScore: 0,//得分
    pointsRecordList: [],//扣分记录
    annotation: '当前没有扣分记录'
  },

  // 获取练车成绩
  getCarGrade: function (data) {
    let _this = this;

    httpRequest({
      url: APIHOST + 'api/v3/driving/driving/line_use_api/f/load_line_use',
      data: data,
      success: function ({ data }) {
        let trainList = data.result;

        if (trainList) {

          var starTime = trainList.startTime;
          var endTime = '';
          var timeDifference = '';
          if (trainList.endTime) {

            endTime = trainList.endTime;

            timeDifference = getTimeDifference(starTime, endTime);

          } else {

            timeDifference = '0分钟';
          }

          var Distance = (trainList.distance / 1000).toFixed(2);
          var totalScore = trainList.totalScore;

          _this.setData({
            timeDifference: timeDifference,//所用时间
            Distance: Distance || 0,//里程
            totalScore: totalScore || 0//得分
          })
        }
      },
      error: function () {
        showMessage('获取信息出错')
      }
    })
  },

  // 获取练车记录列表数据
  getDeliteList: function (data) {
    let _this = this;

    httpRequest({
      url: APIHOST + 'api/v3/driving/driving/line_use_api/f/line_use_detail',
      data: data,
      success: function ({ data }) {
        let dataObj = data.result;
        if (dataObj.length) {
          _this.setData({
            pointsRecordList: dataObj
          })
        }
      },
      error: function () {
        showMessage('获取信息出错')
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    let data = { lineUseId: options.lineUseId };
    console.log(data);

    // 获取练车成绩
    this.getCarGrade(data);

    // 获取练车记录列表数据
    this.getDeliteList(data);
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