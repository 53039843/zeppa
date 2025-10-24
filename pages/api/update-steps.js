// const zeppLifeSteps = require("./ZeppLifeSteps");
const { callXiaotuoAPI } = require('../../ze1/lib/xiaotuo-api-util'); // 引入小驼API调用逻辑
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

    console.log("开始调用小驼API...");
    const xiaotuoResult = await callXiaotuoAPI("zeppa-req", account, password, targetSteps);
    
    let result = xiaotuoResult;

    if (!xiaotuoResult.success) {
      // 如果 小驼 API 调用失败，尝试回退到 api.3x.ink API
      // 小驼API的 shouldNotFallback 逻辑在 callXiaotuoAPI 中被设置为 false，因此总是回退
      console.log("小驼API失败，尝试回退到api.3x.ink API...");
      
      // 尝试调用 api.3x.ink API
      const makuoResult = await callMakuoAPI("zeppa-req", account, password, targetSteps);
      
      if (makuoResult.success) {
        console.log("api.3x.ink API调用成功。");
        result = makuoResult;
      } else {
        console.log("api.3x.ink API也失败了。");
        // 如果 api.3x.ink API 失败且是业务错误，则不进行回退
        if (makuoResult.shouldNotFallback) {
            throw new Error(makuoResult.message || "api.3x.ink API业务错误");
        }
        // 如果两个 API 都失败，则抛出小驼 API 的错误
        throw new Error(xiaotuoResult.message || "小驼API调用失败");
      }
    }

    // 成功时，将result用于后续逻辑
    if (!result.success) {
        // 如果经过回退，result仍然是失败的，则抛出错误
        throw new Error(result.message || "所有API调用失败");
    }
    
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


