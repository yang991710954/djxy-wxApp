// pages/purchaseCourse/purchaseNow/purchaseNow.js
import {
  APIHOST,
  phoneReg,
  httpRequest,
  returnUrlObj,
  returnUrlParam,
  wxCloseAppOnError
} from '../../../utils/util.js';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    coursePrice: 24,//课程单价
    purchaseQuantity: 1,//购买数量
  },

  getPurchaseNow: function () {
    let params = {
      commodityType: 1, 
      pageNum: 1, 
      pageSize: 0
    }
    //获取课程信息列表
    httpRequest({
      url: APIHOST + 'api/order/commodity_api/commodity_list',
      contentType: 'application/x-www-form-urlencoded',
      method: 'post',
      data: params,
      success: function ({ data }) {
        let courseMessage = data.result.list;
        let commodityId = courseMessage[0].id;

        // 获取课程信息
        httpRequest({
          url: APIHOST + '/api/base/commodity_api/commodity_detail',
          contentType: 'application/x-www-form-urlencoded',
          data: { commodityId: commodityId },
          success: function ({ data }) {
            if (!data.error) {
              let createorder = {
                skuId: skuId,
                skuNum: skuNum
              }
              //生成订单
              httpRequest({
                url: APIHOST + '/api/base/order_info_api/save_student_use_order',
                data: JSON.stringify(createorder),
                success: function ({ data }) {
                  if (!data.error) {
                    let orderId = data.result[0].orderId;
                    let confirmpayment = {
                          orderFrom: "APP_PAY",
                          orderNo: orderId,
                          orderIp: localId,
                          payWayCode: payWayCode,
                          returnUrl: "/api/order/swagger-ui.html",
                          userId: student_userId,
                          appid: appid
                        };

                    //获取微信签名
                    httpRequest({
                      url: APIHOST + '/api/base/order_info_api/pay_in_order',
                      data: JSON.stringify(confirmpayment),
                      success: function ({ data }) {
                        if (!data.error) {

                          // 调微信支付
                          wx.requestPayment({
                            'timeStamp': '',
                            'nonceStr': '',
                            'package': '',
                            'signType': 'MD5',
                            'paySign': '',
                            'success': function (res) {
                              console.log(res)
                              wx.showToast({
                                title: '购买课程成功',
                                icon: 'success',
                                duration: 2000
                              })
                              setTimeout(function () {
                                wx.switchTab({
                                  url: '/pages/home/home',
                                })
                              }, 1000)
                            },
                            'fail': function (res) {
                              console.log(res)
                              wx.showToast({
                                title: '购买课程成功失败',
                                icon: 'none',
                                image: '/images/exclamation.png',
                                duration: 2000
                              })
                            },
                            'complete': function (res) {
                              console.log(res)
                            }
                          })

                        } else {
                          wxCloseAppOnError('获取微信签名失败')
                        }
                      },
                      error: function () {
                        wxCloseAppOnError('获取微信签名出错')
                      }
                    })

                  }else{
                    wxCloseAppOnError('生成订单失败')
                  }
                },
                error: function () {
                  wxCloseAppOnError('生成订单出错')
                }
              })

            }
          },
          error: function () {
            wxCloseAppOnError('获取课程信息失败')
          }
        })

      },
      error: function () {
        wxCloseAppOnError('获取课程信息列表失败')
      }
    })
  },

  changeIptnum: function (e) {
    let inputValue = parseInt(e.detail.value);
    if (isNaN(inputValue)) {
      this.setData({
        purchaseQuantity: 1
      })
      return;
    }
    if (inputValue < 1) {
      this.setData({
        purchaseQuantity: 1
      })
    } else {
      this.setData({
        purchaseQuantity: inputValue
      })
    }
  },

  // 减少课程
  Degression: function (e) {
    let inputValue = this.data.purchaseQuantity;

    if (inputValue > 1) {
      this.setData({
        purchaseQuantity: --inputValue
      })
    }
  },

  // 增加课程
  Ascending: function (e) {
    let inputValue = this.data.purchaseQuantity;
    let coursePrice = this.data.coursePrice;

    if (inputValue * coursePrice < 1000 - coursePrice) {
      this.setData({
        purchaseQuantity: ++inputValue
      })
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