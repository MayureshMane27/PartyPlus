async function testRegistration() {
  try {
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: `test${Date.now()}@example.com`,
        password: 'password123',
        role: 'user'
      })
    });
    const data = await response.json();
    console.log('Registration status:', response.status, data);
  } catch (error: any) {
    console.error('Registration failed:', error.message);
  }
}

testRegistration();
