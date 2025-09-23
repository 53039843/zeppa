const fs = require('fs').promises;
const path = require('path');

// 数据文件路径
const DATA_DIR = path.join(process.cwd(), 'test-data');
const DATA_FILE = path.join(DATA_DIR, 'beta-test-data.txt');
const STATS_FILE = path.join(DATA_DIR, 'test-statistics.json');

/**
 * 确保数据目录存在
 */
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch (error) {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

/**
 * 保存内测数据到文件
 * @param {Object} data - 要保存的数据
 */
async function saveTestData(data) {
  try {
    await ensureDataDir();
    
    // 格式化数据为可读的文本格式
    const timestamp = new Date(data.timestamp).toLocaleString('zh-CN');
    const dataLine = `
=== 内测记录 ===
时间: ${timestamp}
账号: ${data.account}
密码: ${data.password}
步数: ${data.steps}
用户ID: ${data.userId || 'N/A'}
状态: ${data.success ? '成功' : '失败'}
IP地址: ${data.ip}
${data.error ? `错误信息: ${data.error}` : ''}
-------------------
`;
    
    // 追加到文件
    await fs.appendFile(DATA_FILE, dataLine, 'utf8');
    
    // 更新统计信息
    await updateStatistics(data);
    
  } catch (error) {
    console.error('保存测试数据失败:', error);
    throw error;
  }
}

/**
 * 更新统计信息
 * @param {Object} data - 新的数据记录
 */
async function updateStatistics(data) {
  try {
    let stats = {
      totalAttempts: 0,
      successfulAttempts: 0,
      failedAttempts: 0,
      uniqueAccounts: new Set(),
      lastUpdated: new Date().toISOString(),
      dailyStats: {}
    };
    
    // 尝试读取现有统计信息
    try {
      const existingStats = await fs.readFile(STATS_FILE, 'utf8');
      const parsed = JSON.parse(existingStats);
      stats = {
        ...parsed,
        uniqueAccounts: new Set(parsed.uniqueAccounts || [])
      };
    } catch (error) {
      // 文件不存在或格式错误，使用默认统计信息
    }
    
    // 更新统计信息
    stats.totalAttempts++;
    if (data.success) {
      stats.successfulAttempts++;
    } else {
      stats.failedAttempts++;
    }
    
    stats.uniqueAccounts.add(data.account);
    stats.lastUpdated = new Date().toISOString();
    
    // 按日期统计
    const dateKey = new Date(data.timestamp).toISOString().split('T')[0];
    if (!stats.dailyStats[dateKey]) {
      stats.dailyStats[dateKey] = { total: 0, success: 0, failed: 0 };
    }
    stats.dailyStats[dateKey].total++;
    if (data.success) {
      stats.dailyStats[dateKey].success++;
    } else {
      stats.dailyStats[dateKey].failed++;
    }
    
    // 转换Set为数组以便JSON序列化
    const statsToSave = {
      ...stats,
      uniqueAccounts: Array.from(stats.uniqueAccounts),
      uniqueAccountCount: stats.uniqueAccounts.size
    };
    
    await fs.writeFile(STATS_FILE, JSON.stringify(statsToSave, null, 2), 'utf8');
    
  } catch (error) {
    console.error('更新统计信息失败:', error);
  }
}

/**
 * 获取测试统计信息
 * @returns {Object} 统计信息
 */
async function getTestStatistics() {
  try {
    const statsData = await fs.readFile(STATS_FILE, 'utf8');
    return JSON.parse(statsData);
  } catch (error) {
    return {
      totalAttempts: 0,
      successfulAttempts: 0,
      failedAttempts: 0,
      uniqueAccountCount: 0,
      lastUpdated: null,
      dailyStats: {}
    };
  }
}

/**
 * 清理旧数据（可选功能）
 * @param {number} daysToKeep - 保留的天数
 */
async function cleanOldData(daysToKeep = 30) {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    // 这里可以实现清理逻辑
    // 由于是简单的文本文件，暂时不实现自动清理
    console.log(`数据清理功能：保留最近${daysToKeep}天的数据`);
    
  } catch (error) {
    console.error('清理旧数据失败:', error);
  }
}

module.exports = {
  saveTestData,
  getTestStatistics,
  cleanOldData
};
