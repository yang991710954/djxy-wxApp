// pages/myInfo/editUserInfo/editUserInfo.js
import {
  APIHOST,
  phoneReg,
  showMessage,
  shareMessage,
  httpRequest,
} from '../../../utils/util.js';

const uploadImage = require('../../../utils/uploadAliyun/uploadAliyun.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    region: [],
    customItem: '全部',
    inputName: '',
    userSex: ''
  },

  // 上传图片
  amendUserImg: function () {
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths;
        console.log(tempFilePaths);

        // // 上传图片
        // uploadImage({
        //   filePath: tempFilePaths,
        //   dir: "djxy/",
        //   success: function (res) {
        //     wx.showToast({
        //       title: '成功',
        //       icon: 'success',
        //       duration: 2000
        //     })
        //   },
        //   fail: function (res) {
        //     showMessage("上传失败")
        //     console.log(res)
        //   }
        // })
      }
    })

    console.log('修改用户图像')
  },

  // 获取输入的值
  bindNameInput: function (e) {
    this.setData({
      inputName: e.detail.value
    })
  },

  // 选择性别
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

  // 选择地址
  bindRegionChange: function (e) {
    this.setData({
      region: e.detail.value
    })
  },

  returnValue: function (status) {
    switch (status) {
      case '男':
        return 0;
      case '女':
        return 1;
      default:
        return '';
    }
  },

  returnUnValue: function (status) {
    switch (status) {
      case 0:
        return '男';
      case 1:
        return '女';
      default:
        return '';
    }
  },

  // 保存用户信息
  saveUserInfo: function () {
    let inputName = this.data.inputName;
    let userSex = this.data.userSex;
    let region = this.data.region;
    let location = region.join('-');

    if (!inputName) {
      showMessage('请输入姓名');
      return;
    }

    if (!userSex) {
      showMessage('请选择性别');
      return;
    }

    if (!region) {
      showMessage('请选择地址');
      return;
    }

    let params = {
      name: inputName,
      sex: this.returnValue(userSex),
      location: location
    }

    this.saveOrUpdateUser(params);
  },

  // 新增或者更新用户信息
  saveOrUpdateUser: function (params) {
    let _this = this;

    httpRequest({
      url: APIHOST + 'api/base/s_stu_info_api/save_or_update',
      method: 'post',
      data: params,
      success: function ({ data }) {
        if (data.result) {
          _this.setData({
            isShowModel: false
          })

          // 获取用户信息
          _this.getUserInfo();

          wx.showToast({
            title: '设置成功',
            icon: 'success',
            duration: 2000
          })

          setTimeout(function () {
            wx.switchTab({
              url: '/pages/myInfo/myInfo',
            })
          }, 1000)
        }
      },
      error: function () {
        showMessage('设置失败');
      }
    })
  },

  // 获取用户信息
  getUserInfo: function () {
    let _this = this;

    httpRequest({
      url: APIHOST + 'api/base/s_stu_info_api/load',
      success: function ({ data }) {
        let dataObj = data.result;

        if (dataObj && dataObj.id) {
          let location = dataObj.location.split('-');
          let userSex = _this.returnUnValue(dataObj.sex);

          _this.setData({
            inputName: dataObj.name,
            userSex: userSex,
            region: location
          })

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

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取用户信息
    this.getUserInfo();
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