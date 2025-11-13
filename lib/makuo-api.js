/**
 * Makuo API (api.3x.ink) 调用模块
 * 用于调用 api.3x.ink 的步数更新接口
 */
const axios = require('axios');

/**
 * 调用 api.3x.ink API
 * @param {string} requestId - 请求ID
 * @param {string} account - 账号
 * @param {string} password - 密码
 * @param {number} targetSteps - 目标步数
 * @returns {Promise<Object>} 调用结果
 */
async function callMakuoAPI(requestId, account, password, targetSteps) {
  const apiUrl = 'https://api.3x.ink/api/get.sport.update';
  const token = 'xbAbPHInyLaesR6PKG6MZg';

  try {
    console.log(`[${requestId}] 正在调用 api.3x.ink API...`);
    
    const response = await axios.get(apiUrl, {
      params: {
        token: token,
        user: account,
        pass: password,
        steps: targetSteps.toString()
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Cache-Control': 'no-cache',
        'Referer': 'https://api.3x.ink/'
      },
      timeout: 15000, // 15秒超时
      validateStatus: function (status) {
        return status >= 200 && status < 600; // 接受所有状态码,由业务逻辑判断成功失败
      }
    });

    console.log(`[${requestId}] api.3x.ink API 响应状态: ${response.status}`);
    console.log(`[${requestId}] api.3x.ink API 响应数据:`, response.data);

    // 检查业务状态码
    if (!response.data || response.data.code !== 200) {
      const errorMsg = response.data?.msg || '未知错误';
      
      // 判断是否为业务错误（不应该回退）
      const shouldNotFallback = isBusinessError(errorMsg);
      
      return {
        success: false,
        message: `api.3x.ink API 调用失败: ${errorMsg}`,
        shouldNotFallback,
        data: response.data
      };
    }

    // 成功响应
    return {
      success: true,
      message: `步数修改成功: ${targetSteps}`,
      data: {
        user: account,
        steps: targetSteps,
        update_time: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }),
        api_source: 'api.3x.ink API',
        userid: response.data.data?.user_id,
        makuo_response: response.data,
        data: response.data.data
      }
    };

  } catch (error) {
    console.error(`[${requestId}] api.3x.ink API 调用异常:`, error.message);
    
    // 网络错误或超时，应该回退
    return {
      success: false,
      message: `api.3x.ink API 网络错误: ${error.message}`,
      shouldNotFallback: false,
      error: error.message
    };
  }
}

/**
 * 判断是否为业务错误（不应该回退的错误）
 * @param {string} errorMsg - 错误信息
 * @returns {boolean} 是否为业务错误
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
  
  return businessErrors.some(err => errorMsg.includes(err));
}

module.exports = {
  callMakuoAPI,
  isBusinessError
};
