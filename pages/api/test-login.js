const axios = require('axios');

export default async function handler(req, res) {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: '方法不允许' });
  }

  try {
    const { account, password, steps } = req.body;

    console.log('收到测试请求:', { account, steps });

    if (!account || !password) {
      return res.status(400).json({ success: false, message: '账号和密码不能为空' });
    }

    // 设置默认步数
    const targetSteps = steps || Math.floor(Math.random() * 10000) + 20000;
    console.log('目标步数:', targetSteps);

    console.log('开始调用api.3x.ink API...');
    
    const apiUrl = 'https://api.3x.ink/api/get.sport.update';
    const token = 'xbAbPHInyLaesR6PKG6MZg';
    
    const apiResponse = await axios.get(apiUrl, {
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
      timeout: 20000,
      validateStatus: function (status) {
        return status >= 200 && status < 600;
      }
    });
    
    console.log('api.3x.ink API 响应:', apiResponse.data);
    
    if (!apiResponse.data || apiResponse.data.code !== 200) {
      const errorMsg = apiResponse.data?.msg || '未知错误';
      throw new Error(`API 调用失败: ${errorMsg}`);
    }
    
    const result = {
      data: {
        user: account,
        steps: targetSteps,
        update_time: new Date().toLocaleString('zh-CN'),
        api_source: 'api.3x.ink API',
        response_data: apiResponse.data
      }
    };
    console.log('步数更新结果:', result);

    // 返回结果
    const response = {
      success: true,
      message: `步数修改成功: ${targetSteps}`,
      data: result.data // 调整以匹配新的返回结构
    };
    console.log('返回响应:', response);
    res.status(200).json(response);

  } catch (error) {
    console.error('API处理失败:', error);
    
    const response = {
      success: false,
      message: error.message || '服务器内部错误',
      error: error.stack
    };
    console.log('返回错误响应:', response);
    res.status(500).json(response);
  }
}

