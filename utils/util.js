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

const formatTimeSimplify = () => {
  const date = new Date()
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('-');
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

// 计算剩余时间
const getRemainingTime = time => {
  if (!time) {
    return '';
  }

  var Atime = new Date(time.replace(/-/g, '/')).getTime();
  var now = Date.now();

  if (Atime > now) {
    var diff = Math.abs(now / 1000 - Atime / 1000);
  } else {
    return 'timeOver';
  }

  var hms = diff % 86400;
  var days = (diff - hms) / 86400;
  var ms = hms % 3600;
  var hours = (hms - ms) / 3600;
  var seconds = ms % 60;
  var miniutes = (ms - seconds) / 60;

  var s = '';
  if (days > 0) {
    s += days + '天';
  }
  if (hours > 0) {
    s += hours + '小时';
  }
  if (miniutes > 0) {
    s += miniutes + '分钟';
  }
  s += seconds.toFixed(0) + '秒';
  return s;
}

// 获取时间差
const getTimeDifference = (startTime, endTime) => {
  if (!startTime || !endTime) {
    return '';
  }

  var Atime = new Date(startTime.replace(/-/g, '/')).getTime();
  var Btime = new Date(endTime.replace(/-/g, '/')).getTime();
  var diff = Math.abs(Btime / 1000 - Atime / 1000);

  var hms = diff % 86400;
  var days = (diff - hms) / 86400;
  var ms = hms % 3600;
  var hours = (hms - ms) / 3600;
  var seconds = ms % 60;
  var miniutes = (ms - seconds) / 60;

  var s = '';
  if (days > 0) {
    s += days + '天';
  }
  if (hours > 0) {
    s += hours + '小时';
  }
  if (miniutes > 0) {
    s += miniutes + '分钟';
  }
  if (seconds > 0) {
    s += seconds.toFixed(0) + '秒';
  }

  return s;
}

// 手机号正则
const phoneReg = /^1(3|4|5|6|7|8|9)\d{9}$/;


// 通用请求接口
const httpRequest = (params) => {

  let method = params.method || '';

  if (params.loading) {
    wx.showLoading({
      mask: true,
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
const returnUrlObj = (url) => {
  if (!url) {
    return {};
  }
  var strArr = url.split('?')[1];
  strArr = strArr.split('&');
  var obj = {};
  for (var i in strArr) {
    var k = strArr[i].split('=');
    obj['' + k[0]] = k[1];
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

const shareMessage = function () {
  return {
    title: '滴驾学员-滴驾共享考车系统',
    path: '/pages/welcome/welcome?appid=student_min_app'
  }
}

//小程序错误提示
const wxCloseAppOnError = function (content) {
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

// 重新加载页面
const wxReloadPage = function (content, callback) {
  wx.showModal({
    title: '温馨提示',
    content: content,
    showCancel: false,
    success: function (res) {
      if (res.confirm) {
        callback && callback();
      }
    }
  })
}

//通用失败提示信息
const showMessage = function (content) {
  wx.showToast({
    title: content,
    icon: 'none',
    image: '/images/exclamation.png',
    duration: 2000
  })
}

// 关闭小程序
const wxCloseApp = function () {
  wx.navigateBack({
    delta: 0
  })
}

// 小程序appid
const APP_ID = 'wx4bd4f904b42bd0a6';
// 小程序app_secret
const APP_SECRET = '694877cd3bc3f037b7a0ed443dfbc8f4';
//服务器Ip
const LOCAL_ID = '192.168.1.7';


// 环境配置
// const APIHOST = "https://dev.yirenzn.com/"; // test
// const APIHOST = "https://pre.yirenzn.com/"; // stage
const APIHOST = "https://api.dj23.cn/"; // production

// 课程图片地址
const COURSES_IMGURL_01 = 'http://dj-static.oss-cn-shenzhen.aliyuncs.com/commodity/image/intelligence_course_01.png'
const COURSES_IMGURL_02 = 'http://dj-static.oss-cn-shenzhen.aliyuncs.com/commodity/image/intelligence_course_02.png'
const COURSES_IMGURL_03 = 'http://dj-static.oss-cn-shenzhen.aliyuncs.com/commodity/image/intelligence_course_03.png'


// 模块导出
module.exports = {
  APIHOST,
  LOCAL_ID,
  APP_ID,
  APP_SECRET,
  wxCloseApp,
  showMessage,
  shareMessage,
  wxReloadPage,
  imgList: [
    COURSES_IMGURL_01,
    COURSES_IMGURL_02,
    COURSES_IMGURL_03
  ],
  phoneReg,
  formatTime,
  httpRequest,
  returnUrlObj,
  returnUrlParam,
  getRemainingTime,
  getTimeDifference,
  wxCloseAppOnError,
  formatTimeSimplify
}
