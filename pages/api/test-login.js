// const zeppLifeSteps = require(\'./ZeppLifeSteps\');
const { callMakuoAPI, isBusinessError } = require("../../ze1/pages/api/makuo-steps-makuo"); // 引入api.3x.ink的调用逻辑

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

    console.log(\'开始调用api.3x.ink API...\');
    const makuoResult = await callMakuoAPI(\'test-login-req\', account, password, targetSteps);

    if (!makuoResult.success) {
      if (makuoResult.shouldNotFallback) {
        throw new Error(makuoResult.message || \'api.3x.ink API业务错误\');
      } else {
        throw new Error(makuoResult.message || \'api.3x.ink API调用失败\');
      }
    }
    const result = makuoResult; // 成功时，将makuoResult赋值给result，以便后续逻辑兼容
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

