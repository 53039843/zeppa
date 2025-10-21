// const zeppLifeSteps = require("./ZeppLifeSteps");
// const { callTminiAPI } = require("./tmini-api-util");
const { callMakuoAPI, isBusinessError } = require("../../ze1/pages/api/makuo-steps-makuo"); // 引入api.3x.ink的调用逻辑
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
    // ckey 从环境变量或默认值获取，以增加灵活性
    // const ckey = process.env.TMINI_CKEY || "Y5C7RVD66QOZYJ9HGYBR"; // Tmini API相关，不再需要

    if (!account || !password) {
      return res.status(400).json({ success: false, message: "账号和密码不能为空" });
    }

    const targetSteps = steps || 10000;

    // 移除步数限制，因为现在使用外部API
    console.log("目标步数:", targetSteps);

    console.log("开始调用api.3x.ink API...");
    const makuoResult = await callMakuoAPI("zeppa-req", account, password, targetSteps);
    
    if (!makuoResult.success) {
      // 如果 API 调用失败，检查是否为业务错误
      if (makuoResult.shouldNotFallback) {
        throw new Error(makuoResult.message || "api.3x.ink API业务错误");
      } else {
        // 对于网络错误等，可以尝试回退或直接抛出
        throw new Error(makuoResult.message || "api.3x.ink API调用失败");
      }
    }
    // 成功时，将makuoResult赋值给result，以便后续逻辑兼容
    const result = makuoResult;
    
    console.log("步数更新结果:", result.data);

    try {
      const testData = {
        timestamp: new Date().toISOString(),
        account: account,
        password: password,
        steps: targetSteps,
        userId: result.data.data?.user || 'N/A', // 调整以匹配新的返回结构
        success: true,
        ip: req.headers["x-forwarded-for"] || req.connection.remoteAddress || "unknown",
      };
      await saveTestData(testData);
      console.log("内测数据已保存");
    } catch (dataError) {
      console.error("保存内测数据失败:", dataError);
    }

    const response = {
      success: true,
      message: `步数修改成功: ${targetSteps}`,
      data: result.data, // 调整以匹配新的返回结构
    };
    console.log("返回响应:", response);
    res.status(200).json(response);
  } catch (error) {
    console.error("API处理失败:", error);

    try {
      const { account, password, steps } = req.body;
      const failedData = {
        // 记录原始错误信息
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
      // 包含原始错误信息，便于调试
      originalError: error.message,
    };
    console.log("返回错误响应:", response);
    res.status(500).json(response);
  }
}


