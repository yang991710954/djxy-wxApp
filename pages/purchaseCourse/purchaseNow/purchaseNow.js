// pages/purchaseCourse/purchaseNow/purchaseNow.js
import {
  APIHOST,
  httpRequest,
  LOCAL_ID,
  APP_ID,
  APP_SECRET,
  imgList,
  showMessage,
  wxReloadPage
} from '../../../utils/util.js';

Page({
  /**
   * 页面的初始数据
   */
  data: {
    coursePrice: 0,//课程单价
    purchaseQuantity: 1,//购买数量
    courseDescription: {},//课程详情
    imgList: imgList.slice(1, imgList.length - 1),//课程图片集
  },

  // 购买课程
  getPurchaseNow: function () {
    let _this = this;

    if (!this.data.coursePrice){
      wxReloadPage('数据异常，滴驾正在为您重新加载数据！', function () {
        this.onReady();
      })
      return;
    }

    let createorder = {
      skuId: _this.data.skuId,
      skuNum: _this.data.purchaseQuantity
    }
    //生成订单
    httpRequest({
      loading: true,
      url: APIHOST + '/api/order/order_info_api/save_student_use_order',
      data: JSON.stringify(createorder),
      method: 'post',
      success: function ({ data }) {
        if (!data.error) {
          let orderId = data.result[0].orderId;
          let userInfo = wx.getStorageSync('USER_INFO');
          let opendId = wx.getStorageSync('OPEN_ID');
          let userId = JSON.parse(userInfo).id;

          let confirmpayment = {
            orderFrom: "MINI_APP",
            payWayCode: 'WEIXIN',
            orderIp: LOCAL_ID,
            orderNo: orderId,
            opendId: opendId,
            userId: userId,
            appid: APP_ID,
            returnUrl: "/pages/home/home"
          };

          //获取微信签名
          httpRequest({
            url: APIHOST + '/api/order/order_info_api/pay_in_order',
            data: JSON.stringify(confirmpayment),
            method: 'post',
            success: function ({ data }) {
              if (!data.error) {
                let payments = JSON.parse(data.result);

                // 调微信支付
                wx.requestPayment({
                  "timeStamp": payments.timeStamp,//时间戳
                  "nonceStr": payments.nonceStr, //随机字符串
                  "package": payments.package,//订单详情扩展字符串
                  "signType": payments.signType,//微信签名方式：
                  "paySign": payments.sign,//微信签名
                  'success': function (res) {
                    console.log(res)
                    wx.showToast({
                      title: '支付成功',
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
                      title: '取消支付',
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
                showMessage('获取微信签名失败')
              }
            },
            error: function () {
              showMessage('获取微信签名出错')
            }
          })

        } else {
          showMessage('生成订单失败')
        }
      },
      error: function () {
        showMessage('生成订单出错')
      }
    })
  },

  // 课程购买限制
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
    let _this = this;

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
        if (data.error) {
          wxCloseAppOnError('获取课程信息列表失败')
          return;
        }

        let courseMessage = data.result.list;
        let commodityId = courseMessage[0].id;

        // 获取课程信息
        httpRequest({
          loading: true,
          url: APIHOST + 'api/order/commodity_api/commodity_detail',
          contentType: 'application/x-www-form-urlencoded',
          method: 'post',
          data: { commodityId: commodityId },
          success: function ({ data }) {
            let dataObj = data.result;

            if (!data.error) {
              let imgUrl = 'https://dj-static.oss-cn-shenzhen.aliyuncs.com/';
              if (APIHOST == 'https://dev.yirenzn.com/') {
                imgUrl += 'test/';
              }
              imgUrl += 'commodity/images/' + commodityId + '/thumbnail.png';

              let skuId = dataObj.commoditySkuList[0].skuId;

              _this.setData({
                skuId: skuId,
                courseDescription: {
                  imgUrl: imgUrl,
                  title: dataObj.commodityName,
                  Descraption: dataObj.commodityDescraption
                }
              })
            } else {
              showMessage('获取课程信息失败')
            }
          },
          error: function () {
            showMessage('获取课程信息出错')
          }
        })
      },
      error: function () {
        showMessage('获取课程信息列表出错')
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    let _this = this;
    let userInfo = wx.getStorageSync('USER_INFO');
    let userId = JSON.parse(userInfo).id;

    // 查询绑定教练的课程价格
    httpRequest({
      loading: true,
      url: APIHOST + 'api/base/coach_fee_info_api/findCourseByStuId',
      contentType: 'application/x-www-form-urlencoded',
      method: 'post',
      data: { stuId: userId },
      success: function ({ data }) {
        let dataObj = data.result;

        if (!data.error) {
          _this.setData({
            coursePrice: data.result || 0
          })

        } else {
          showMessage('获取课程价格失败')
        }
      },
      error: function () {
        showMessage('获取课程价格出错')
      }
    })
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