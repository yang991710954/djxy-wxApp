//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    userName: JSON.parse(wx.getStorageSync('USER_INFO')).user_name || '匿名',
  },

  jumpPurchaseRecords: function () {
    wx.navigateTo({
      url: '/pages/courseRecord/courseRecord',
    })
  },

  jumpEidtUser: function () {
    wx.navigateTo({
      url: '/pages/myInfo/editUserInfo/editUserInfo',
    })
  },

  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {

  }
})
