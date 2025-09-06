const axios = require('axios');

const BASE_URL = 'http://localhost:5001';

// Test data
const testUser = {
  email: 'test@example.com',
  password: 'Test123456',
  age: 25,
  sex: 'male',
  height: 175,
  weight: 70,
  activity_level: 'moderately_active',
  target_calories: 2000
};

let authToken = '';
let userId = '';

// Test functions
async function testRegistration() {
  console.log('Testing user registration...');
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/register`, testUser);
    authToken = response.data.token;
    userId = response.data.userId;
    console.log('✅ Registration successful');
    return true;
  } catch (error) {
    console.error('❌ Registration failed:', error.response?.data || error.message);
    return false;
  }
}

async function testLogin() {
  console.log('Testing user login...');
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    console.log('✅ Login successful');
    return true;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    return false;
  }
}

async function testGetProfile() {
  console.log('Testing get user profile...');
  try {
    const response = await axios.get(`${BASE_URL}/api/user/${userId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Get profile successful');
    return true;
  } catch (error) {
    console.error('❌ Get profile failed:', error.response?.data || error.message);
    return false;
  }
}

async function testFoodSearch() {
  console.log('Testing food search...');
  try {
    const response = await axios.get(`${BASE_URL}/api/food/search?query=apple`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Food search successful');
    return true;
  } catch (error) {
    console.error('❌ Food search failed:', error.response?.data || error.message);
    return false;
  }
}

async function testValidation() {
  console.log('Testing input validation...');
  try {
    // Test invalid email
    await axios.post(`${BASE_URL}/api/auth/register`, {
      ...testUser,
      email: 'invalid-email'
    });
    console.log('❌ Invalid email validation failed');
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('✅ Invalid email validation working');
    }
  }
  
  try {
    // Test weak password
    await axios.post(`${BASE_URL}/api/auth/register`, {
      ...testUser,
      password: 'weak'
    });
    console.log('❌ Weak password validation failed');
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('✅ Weak password validation working');
    }
  }
}

// Run all tests
async function runTests() {
  console.log('🧪 Starting Calorie Tracker API Tests...\n');
  
  const results = [];
  
  results.push(await testRegistration());
  results.push(await testLogin());
  results.push(await testGetProfile());
  results.push(await testFoodSearch());
  await testValidation();
  
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  console.log(`\n📊 Test Results: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All tests passed!');
  } else {
    console.log('⚠️  Some tests failed. Check the logs above.');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests };
