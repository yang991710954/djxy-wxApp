// pages/myInfo/editUserInfo/editUserInfo.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    region: [],
    customItem: '全部',
  },

  amendUserImg: function () {
    return false;

    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths
        console.log(tempFilePaths);
        // 上传图片
        wx.uploadFile({
          url: 'https://example.weixin.qq.com/upload', //仅为示例，非真实的接口地址
          filePath: tempFilePaths[0],
          name: 'file',
          formData: {
            'user': 'test'
          },
          success: function (res) {
            var data = res.data
            //do something
            console.log(data);
          }
        })
      }
    })

    console.log('修改用户图像')
  },

  selectSex: function () {
    let _this = this;
    wx.showActionSheet({
      itemList: ['男', '女'],
      success: function (res) {
        if (res.tapIndex == 0) {
          _this.setData({
            userSex: '男'
          })
        } else {
          _this.setData({
            userSex: '女'
          })
        }
      },
      fail: function (res) {
        console.log('放弃选择！')
      }
    })
  },

  bindRegionChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      region: e.detail.value
    })
  },

  saveUserInfo: function () {
    wx.showToast({
      title: '保存成功',
      icon: 'success',
      duration: 2000
    })

    setTimeout(function () {
      wx.switchTab({
        url: '/pages/myInfo/myInfo',
      })
    }, 1000)
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