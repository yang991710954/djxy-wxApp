// pages/courseRecord/courseRecord.js
import {
  APIHOST,
  httpRequest,
  formatTimeSimplify
} from '../../utils/util.js';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderList: [],
    annotation: '暂无课程购买记录'
  },

  // 获取学员购买课程列表
  getStudentOrderlist: function () {
    let _this = this;
    let newArr = [];
    httpRequest({
      loading: true,
      url: APIHOST + 'api/order/order_info_api/get_student_order_list',
      method: 'post',
      success: function ({ data }) {
        let dataList = data.result;
        if (dataList.length) {
          dataList.forEach(function (item, index) {
            if (item.isPay == 1) {
              newArr.push({
                createTime: item.createTime || '未知',
                commodityName: item.commodityName || '未知',
                skuNum: item.sku_num ? item.sku_num + '小时' : '未知',
                payMoney: item.payMoney ? '￥' + item.payMoney.toFixed(2) : '未知',
              })
            }
          })
        }

        // 设置数据
        _this.setData({
          orderList: newArr
        })
      },
      error: function (err) {
        console.log(err)
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取学员购买课程列表
    this.getStudentOrderlist();
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