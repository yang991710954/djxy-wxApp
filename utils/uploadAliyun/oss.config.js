var fileHost = "http://dj-static.oss-cn-shenzhen.aliyuncs.com/";

var config = {
  //aliyun OSS config
  uploadImageUrl: `${fileHost}`, //默认存在根目录，可根据需求改
  AccessKeySecret: 'Ou5JlTvSFOjGtjcNn6tNL12HZWvQdz',
  OSSAccessKeyId: 'LTAIZl9ngJn7wK7N',
  timeout: 87600 //这个是上传文件时Policy的失效时间
};

module.exports = config;