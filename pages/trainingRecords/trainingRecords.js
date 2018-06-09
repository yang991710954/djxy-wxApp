// 练车详情页
import {
  APIHOST,
  httpRequest,
  showMessage,
  shareMessage,
  formatTimeSimplify
} from '../../utils/util.js';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    startDate: '2018-01-01',
    endDate: formatTimeSimplify(),
    userName: '匿名',
    recordParams: {
      pageNum: 1,
      pageSize: 0
    },
    recordList: [],
    recordArr: [],
    average: 0,
    isQueryShow: true,
    isPracticeShow: true,
    currentItem: 'line_record',
    annotation: '未查询到练车记录'
  },

  // 修改起始时间
  bindStartDateChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      startDate: e.detail.value
    })
  },

  // 修改结束时间
  bindEndDateChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      endDate: e.detail.value
    })
  },

  // 跳转到详情
  jumpRecordDetails: function (event) {
    let params = event.currentTarget.dataset;

    wx.navigateTo({
      url: '/pages/recordDetails/recordDetails?lineUseId=' + params.userId + '&index=' + params.index,
    })
  },

  // 按条件查询
  conditionQuery: function () {
    let _this = this;

    _this.setData({
      recordArr: []
    })

    if (this.data.currentItem == 'line_record') {
      this.setData({
        currentItem: 'line_record_stage',
        recordParams: {
          pageNum: 1,
          pageSize: 0
        }
      })
    }

    let params = {
      pageNum: this.data.recordParams.pageNum,
      pageSize: this.data.recordParams.pageSize,
      startTime: this.data.startDate + ' ' + '00:00:00',
      endTime: this.data.endDate + ' ' + '23:59:59'
    }
    httpRequest({
      loading: true,
      url: APIHOST + 'api/v3/driving/driving/line_use_api/line_record_stage',
      contentType: 'application/x-www-form-urlencoded',
      method: 'post',
      data: params,
      success: function ({ data }) {
        let trainList = data.result.list;
        let totalNum = 0;

        if (trainList.length) {
          _this.setData({
            isQueryShow: true
          })
          trainList.forEach(function (item, index) {
            if (item.totalScore) {
              totalNum += item.totalScore;
            }

            if (item.startTime) {
              var startdata = item.startTime.split(' ')[0].replace(/-/g, '');
              var recordDate = startdata.substr(0, 4) + '年' + startdata.substr(4, 2) + '月' + startdata.substr(6, 2) + '日'

              var startdataTime = item.startTime.split(' ')[1];
              startdataTime = startdataTime.substring(0, 5);
            }

            if (item.endTime) {
              var endDateTime = item.endTime.split(' ')[1];
              endDateTime = endDateTime.substring(0, 5);

            } else {

              var endDateTime = item.startTime.split(' ')[1];
              endDateTime = endDateTime.substring(0, 5);
            }

            let temporal = (startdataTime || '未知') + '-' + (endDateTime || '未知');

            _this.data.recordArr.push({
              recordDate: recordDate || '未知',//练车日期
              mode: _this.returnTagValue(item.mode),//练车模式
              temporal: temporal,//时间区间
              lineName: item.lineName || '无线路名',//考场名称
              coachName: item.coacherName || '未知',//教练名字
              totalScore: item.totalScore || '未知',//成绩
              itemIndex: index, //编号
              userId: item.id //用户Id
            })
          })

          // 设置数据
          _this.setData({
            recordList: _this.data.recordArr,
            average: parseInt(totalNum / trainList.length) || 0,
            recordParams: {
              pageNum: _this.data.recordParams.pageNum + 1,
              pageSize: 0
            },
          })
        } else {
          _this.setData({
            isQueryShow: false,
            average: 0
          })
        }
      },
      error: function () {
        showMessage('获取信息出错')
      }
    })
  },

  // 训练模式
  returnTagValue: function (status) {
    switch (status) {
      case 0:
        return '训练模式';
      case 1:
        return '考试模式';
      default:
        return '未知';
    }
  },

  // 事件触发条件查询
  clickConditionQuery: function () {
    // 参数重置
    this.setData({
      recordList: [],
      recordParams: {
        pageNum: 1,
        pageSize: 0
      },
    })
    // 获取条件查询结果
    this.conditionQuery();
  },

  //获取练车记录
  getPracticeResults: function () {
    this.setData({
      currentItem: 'line_record'
    })

    let _this = this;
    httpRequest({
      loading: true,
      url: APIHOST + 'api/v3/driving/driving/line_use_api/line_record',
      data: _this.data.recordParams,
      success: function ({ data }) {
        let trainList = data.result.list;
        let totalNum = 0;

        if (trainList.length) {
          _this.setData({
            isPracticeShow: true
          })
          trainList.forEach(function (item, index) {
            if (item.totalScore) {
              totalNum += item.totalScore;
            }

            if (item.startTime) {
              var startdata = item.startTime.split(' ')[0].replace(/-/g, '');
              var recordDate = startdata.substr(0, 4) + '年' + startdata.substr(4, 2) + '月' + startdata.substr(6, 2) + '日'

              var startdataTime = item.startTime.split(' ')[1];
              startdataTime = startdataTime.substring(0, 5);
            }

            if (item.endTime) {
              var endDateTime = item.endTime.split(' ')[1];
              endDateTime = endDateTime.substring(0, 5);

            } else {

              var endDateTime = item.startTime.split(' ')[1];
              endDateTime = endDateTime.substring(0, 5);
            }

            let temporal = (startdataTime || '未知') + '-' + (endDateTime || '未知');

            _this.data.recordArr.push({
              recordDate: recordDate || '未知',//练车日期
              mode: _this.returnTagValue(item.mode),//练车模式
              temporal: temporal,//时间区间
              lineName: item.lineName || '无线路名',//考场名称
              coachName: item.coacherName || '未知',//教练名字
              totalScore: item.totalScore || '未知',//成绩
              itemIndex: index, //编号
              userId: item.id //用户Id
            })
          })

          // 设置数据
          _this.setData({
            recordList: _this.data.recordArr,
            average: parseInt(totalNum / trainList.length) || 0,
            recordParams: {
              pageNum: _this.data.recordParams.pageNum + 1,
              pageSize: 0
            },
          })
        } else {
          _this.setData({
            isPracticeShow: false
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
    // 获取练车记录
    this.getPracticeResults();
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
    let flag = JSON.parse(wx.getStorageSync('USER_INFO'));

    this.setData({
      userName: flag.user_name ? flag.user_name : flag.name,
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
    // 参数重置
    this.setData({
      recordParams: {
        pageNum: 1,
        pageSize: 0
      },
    })
    // 获取练车记录
    this.getPracticeResults();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    // if (this.data.currentItem == 'line_record') {
    //   // 获取练车记录
    //   this.getPracticeResults();
    // } else {
    //   // 按条件查询
    //   this.conditionQuery();
    // }
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