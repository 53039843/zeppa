const axios = require('axios');
const moment = require('moment');
const { URLSearchParams } = require('url');

// 配置请求头
const headers = {
  'User-Agent': 'Dalvik/2.1.0 (Linux; U; Android 9; MI 6 MIUI/20.6.18)',
  'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
};

// 获取登录code
async function getCode(location) {
  const codePattern = /(?<=access=).*?(?=&)/;
  const match = location.match(codePattern);
  return match ? match[0] : null;
}

// 登录获取token
async function login(account, password) {
  try {
    // 判断是手机号还是邮箱
    const isPhone = /^\+?\d+$/.test(account);
    console.log('登录账号类型:', isPhone ? '手机号' : '邮箱');
    
    // 对于手机号，检查是否有+86前缀，如果没有则添加
    if (isPhone) {
      // 检查是否已经有+86前缀
      if (!account.startsWith('+86') && !account.startsWith('86')) {
        // 没有86前缀，添加+86
        account = '+86' + account;
      } else if (account.startsWith('86') && !account.startsWith('+')) {
        // 有86但没有+号，添加+号
        account = '+' + account;
      }
      console.log('处理后的手机号:', account);
    }
    
    console.log('登录账号:', account);

    // 第一步：获取access code
    const url1 = `https://api-user.huami.com/registrations/${account}/tokens`;
    const data1 = {
      client_id: 'HuaMi',
      password: password,
      redirect_uri: 'https://s3-us-west-2.amazonaws.com/hm-registration/successsignin.html',
      token: 'access'
    };

    // 如果是手机号,添加phone_number字段
    if(isPhone) {
      data1.phone_number = account;
    }

    console.log('第一步请求URL:', url1);
    console.log('第一步请求数据:', data1);

    const response1 = await axios.post(url1, data1, {
      headers: headers,
      maxRedirects: 0,
      validateStatus: function (status) {
        return status >= 200 && status < 400;
      }
    });

    console.log('第一步响应状态码:', response1.status);
    console.log('第一步响应头:', response1.headers);
    console.log('第一步响应数据:', response1.data);

    // 从重定向URL中提取code
    const location = response1.headers.location;
    if (!location) {
      console.error('登录失败：未获取到重定向URL');
      throw new Error('登录失败：未获取到重定向URL');
    }

    console.log('重定向URL:', location);

    const code = await getCode(location);
    if (!code) {
      console.error('获取access code失败');
      throw new Error('获取access code失败');
    }

    console.log('获取到的code:', code);

    // 第二步：获取login token
    const url2 = 'https://account.huami.com/v2/client/login';
    const data2 = {
      allow_registration: 'false',
      app_name: 'com.xiaomi.hm.health',
      app_version: '6.3.5',
      code: code,
      country_code: 'CN',
      device_id: '2C8B4939-0CCD-4E94-8CBA-CB8EA6E613A1',
      device_model: 'phone',
      dn: 'api-user.huami.com%2Capi-mifit.huami.com%2Capp-analytics.huami.com',
      grant_type: 'access_token',
      lang: 'zh_CN',
      os_version: '1.5.0',
      source: 'com.xiaomi.hm.health',
      third_name: isPhone ? 'huami_phone' : 'email'
    };

    console.log('第二步请求URL:', url2);
    console.log('第二步请求数据:', data2);

    const response2 = await axios.post(url2, data2, {
      headers,
      validateStatus: function (status) {
        return status >= 200 && status < 400;
      }
    });

    console.log('第二步响应状态码:', response2.status);
    console.log('第二步响应头:', response2.headers);
    console.log('第二步响应数据:', response2.data);

    if (!response2.data || !response2.data.token_info) {
      console.error('登录失败：未获取到token信息');
      throw new Error('登录失败：未获取到token信息');
    }

    const loginToken = response2.data.token_info.login_token;
    const userId = response2.data.token_info.user_id;

    if (!loginToken || !userId) {
      console.error('登录失败：token信息不完整');
      throw new Error('登录失败：token信息不完整');
    }

    console.log('登录成功,获取到loginToken和userId');
    return { loginToken, userId };
  } catch (error) {
    console.error('登录失败:', error.message);
    if (error.response) {
      console.error('错误响应状态码:', error.response.status);
      console.error('错误响应头:', error.response.headers);
      console.error('错误响应数据:', error.response.data);
    }
    throw error;
  }
}

// 获取app token
async function getAppToken(loginToken) {
  try {
    // 直接从登录响应中获取app_token
    const url = `https://account-cn.huami.com/v1/client/app_tokens?app_name=com.xiaomi.hm.health&dn=api-user.huami.com%2Capi-mifit.huami.com%2Capp-analytics.huami.com&login_token=${loginToken}`;

    console.log('获取appToken请求URL:', url);

    const response = await axios.get(url, {
      headers,
      validateStatus: function (status) {
        return status >= 200 && status < 400;
      }
    });

    console.log('获取appToken响应状态码:', response.status);
    console.log('获取appToken响应头:', response.headers);
    console.log('获取appToken响应数据:', response.data);

    if (!response.data || !response.data.token_info) {
      console.error('获取appToken失败：未获取到token信息');
      throw new Error('获取appToken失败：未获取到token信息');
    }

    const appToken = response.data.token_info.app_token;
    if (!appToken) {
      console.error('获取appToken失败：token信息不完整');
      throw new Error('获取appToken失败：token信息不完整');
    }

    console.log('获取appToken成功:', appToken);
    return appToken;
  } catch (error) {
    console.error('获取appToken失败:', error.message);
    if (error.response) {
      console.error('错误响应状态码:', error.response.status);
      console.error('错误响应头:', error.response.headers);
      console.error('错误响应数据:', error.response.data);
    }
    throw error;
  }
}

// 获取时间戳
async function getTime() {
  try {
    const response = await axios.get('http://mshopact.vivo.com.cn/tool/config', { headers });
    return response.data.data.nowTime;
  } catch (error) {
    console.error('获取时间戳失败:', error.message);
    throw error;
  }
}

// 修改步数 (此函数不再使用，但保留以防万一)
async function updateSteps(loginToken, appToken, steps) {
  try {
    const today = moment().format('YYYY-MM-DD');
    console.log('当前日期:', today);
    console.log('目标步数:', steps);

    const url = `https://api-mifit-cn2.huami.com/v1/data/band_data.json?t=${Date.now()}`;
    const data = `userid=${loginToken}&steps=${steps}&date=${today}&device_type=0&app_token=${appToken}`;

    console.log('更新步数请求URL:', url);
    console.log('更新步数请求数据:', data);

    const response = await axios.post(url, data, {
      headers: {
        ...headers,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      validateStatus: function (status) {
        return status >= 200 && status < 400;
      }
    });

    console.log('更新步数响应状态码:', response.status);
    console.log('更新步数响应头:', response.headers);
    console.log('更新步数响应数据:', response.data);

    if (response.data.code !== 1) {
      console.error('更新步数失败:', response.data);
      throw new Error('更新步数失败: ' + JSON.stringify(response.data));
    }

    console.log('更新步数成功');
    return response.data;
  } catch (error) {
    console.error('更新步数失败:', error.message);
    if (error.response) {
      console.error('错误响应状态码:', error.response.status);
      console.error('错误响应头:', error.response.headers);
      console.error('错误响应数据:', error.response.data);
    }
    throw error;
  }
}

module.exports = {
  login,
  getAppToken,
  getTime,
  updateSteps
};
