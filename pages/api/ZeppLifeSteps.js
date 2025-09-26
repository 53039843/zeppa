const axios = require('axios');

async function updateSteps(token, user, password, steps) {
  const url = 'https://api.makuo.cc/api/get.sport.xiaomi';
  const headers = {
    'Authorization': token,
  };
  const params = {
    user: user,
    pass: password,
    steps: steps
  };

  try {
    console.log('调用API:', url);
    console.log('请求头:', headers);
    console.log('请求参数:', params);
    
    const response = await axios.get(url, { headers, params });
    
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
