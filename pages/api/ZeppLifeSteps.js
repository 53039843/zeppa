const axios = require('axios');

async function updateSteps(ckey, user, password, steps) {
  const url = 'https://tmini.net/api/xiaomi';
  const params = {
    ckey: ckey,
    user: user,
    pass: password,
    steps: steps
  };

  try {
    console.log('调用API:', url);
    console.log('请求参数:', params);
    
    const response = await axios.get(url, { params });
    
    console.log('API响应:', response.data);
    
    if (response.data.code !== 200) {
      throw new Error(response.data.msg || 'Failed to update steps');
    }
    return response.data;
  } catch (error) {
    console.error('Error updating steps:', error.message);
    if (error.response) {
      console.error('Error response:', error.response.data);
    }
    throw error;
  }
}

module.exports = { updateSteps };

