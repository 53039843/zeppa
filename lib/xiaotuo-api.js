/**
 * 小驼 API 调用模块
 * 用于调用小驼 API 的步数更新接口
 */
const axios = require('axios');

/**
 * 调用小驼 API
 * @param {string} requestId - 请求ID
 * @param {string} account - 账号
 * @param {string} password - 密码
 * @param {number} targetSteps - 目标步数
 * @returns {Promise<Object>} 调用结果
 */
async function callXiaotuoAPI(requestId, account, password, targetSteps) {
  const apiUrl = 'https://api.xiaotuo.cc/api/get.sport.update';
  
  try {
    console.log(`[${requestId}] 正在调用小驼 API...`);
    
    const response = await axios.get(apiUrl, {
      params: {
        user: account,
        pass: password,
        steps: targetSteps.toString()
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Cache-Control': 'no-cache'
      },
      timeout: 15000,
      validateStatus: function (status) {
        return status >= 200 && status < 600;
      }
    });

    console.log(`[${requestId}] 小驼 API 响应状态: ${response.status}`);
    console.log(`[${requestId}] 小驼 API 响应数据:`, response.data);

    // 检查业务状态码
    if (!response.data || response.data.code !== 200) {
      const errorMsg = response.data?.msg || '未知错误';
      
      return {
        success: false,
        message: `小驼 API 调用失败: ${errorMsg}`,
        shouldNotFallback: false, // 小驼 API 失败总是回退
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
        api_source: '小驼 API',
        xiaotuo_response: response.data,
        data: response.data.data
      }
    };

  } catch (error) {
    console.error(`[${requestId}] 小驼 API 调用异常:`, error.message);
    
    return {
      success: false,
      message: `小驼 API 网络错误: ${error.message}`,
      shouldNotFallback: false,
      error: error.message
    };
  }
}

module.exports = {
  callXiaotuoAPI
};
