// 时间格式化
const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

// 手机号正则
const phoneReg = /^1(3|4|5|6|7|8|9)\d{9}$/;


// 通用请求接口
const httpRequest = (params) => {

  let method = params.method || '';

  if (params.loading) {
    wx.showLoading({
      title: '加载中',
    })
  }

  wx.request({
    url: params.url,
    data: params.data || {},
    method: method.toUpperCase() || 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
    header: {
      "Content-Type": params.contentType || "application/json",
      "Authorization": 'Bearer ' + wx.getStorageSync('SESSION_KEY')
    },
    success: function (res) {
      // success
      params.success.call(this, res);
    },
    fail: function (err) {
      // error
      if (params.error) {
        params.error.call(this, err);
      }
    },
    complete: function () {
      //complete
      if (params.loading) {
        wx.hideLoading();
      }
    }
  })
}

// 获取URL参数
const returnUrlObj = () => {
  var strArr = location.search.replace('?', '');
  strArr = strArr.split('&');
  var obj = {};
  for (var i in strArr) {
    var pa = strArr[i].split('=');
    obj['' + pa[0]] = pa[1];
  }
  return obj;
}

// 仿$.param方法
const returnUrlParam = function (dataObj) {
  let urlParam = '';

  for (let key in dataObj) {
    urlParam += '&' + key + '=' + dataObj[key];
  }

  urlParam = urlParam.slice(1, urlParam.length);

  return urlParam;
}

//小程序错误提示
const wxCloseAppOnError = function (content){
  wx.showModal({
    title: '温馨提示',
    content: content,
    showCancel: false,
    success: function (res) {
      if (res.confirm) {
        wx.navigateBack({
          delta: 0
        })
      }
    }
  })
}

// 小程序appid
const APP_ID = 'wx4bd4f904b42bd0a6';
// 小程序app_secret
const APP_SECRET = '694877cd3bc3f037b7a0ed443dfbc8f4';

// 环境配置
const APIHOST = "https://dev.yirenzn.com/"; // test
// const APIHOST = "https://pre.yirenzn.com/"; // stage
// const APIHOST = "https://api.dj23.cn/"; // production

// 模块导出
module.exports = {
  APIHOST,
  phoneReg,
  formatTime,
  httpRequest,
  returnUrlObj,
  returnUrlParam,
  wxCloseAppOnError
}
