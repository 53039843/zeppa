const axios = require('axios');

/**
 * 判断是否为业务错误(不应该回退的错误)
 */
function isBusinessError(errorMsg) {
  const businessErrors = [
    '账号或密码错误',
    '用户不存在',
    '密码错误',
    '账号被锁定',
    '账号已禁用',
    '参数错误',
    '无效的账号格式'
  ];
  
  // 检查是否包含 tmini.net API 响应中的常见错误信息
  return businessErrors.some(error => errorMsg.includes(error)) || errorMsg.includes('ckey');
}

/**
 * 调用tmini.net API
 */
async function callTminiAPI(requestId, account, password, targetSteps) {
  // 使用环境变量 TMINI_CKEY，如果不存在则使用用户提供的 ckey
  const ckey = process.env.TMINI_CKEY || 'Y5C7RVD66QOZYJ9HGYBR';
  const apiUrl = 'https://tmini.net/api/xiaomi';

  try {
    console.log(`[${requestId}] 正在调用tmini.net API...`);
    
    const response = await axios.get(apiUrl, {
      params: {
        ckey: ckey,
        // 优先使用环境变量 MI_ACCOUNT 和 MI_PASSWORD，如果没有则使用请求参数
        user: process.env.MI_ACCOUNT || account,
        pass: process.env.MI_PASSWORD || password,
        steps: targetSteps.toString()
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Cache-Control': 'no-cache'
      },
      timeout: 15000, // 15秒超时
      validateStatus: function (status) {
        return status < 500; // 只有5xx错误才会被reject
      }
    });

    console.log(`[${requestId}] tmini.net API响应状态: ${response.status}`);
    console.log(`[${requestId}] tmini.net API响应数据:`, response.data);

    // 检查HTTP状态码
    if (response.status !== 200) {
      throw new Error(`HTTP状态码错误: ${response.status}`);
    }

    // 检查业务状态码
    if (!response.data || response.data.code !== 200) {
      const errorMsg = response.data?.msg || '未知错误';
      
      // 判断是否为业务错误(不应该回退)
      const shouldNotFallback = isBusinessError(errorMsg);
      
      return {
        success: false,
        message: `tmini.net API调用失败: ${errorMsg}`,
        shouldNotFallback,
        data: response.data
      };
    }

    // 成功响应
    return {
      success: true,
      data: response.data
    };

  } catch (error) {
    console.error(`[${requestId}] tmini.net API调用异常:`, error.message);
    
    // 网络错误或超时,应该回退
    return {
      success: false,
      message: `tmini.net API网络错误: ${error.message}`,
      shouldNotFallback: false,
      error: error.message
    };
  }
}

module.exports = {
    callTminiAPI,
    isBusinessError
};

