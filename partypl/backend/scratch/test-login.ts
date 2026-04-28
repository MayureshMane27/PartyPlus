async function testLogin() {
  try {
    const res = await fetch('http://127.0.0.1:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'aryanmane12@gmail.com',
        password: 'aryan@4847'
      })
    });
    const data = await res.json();
    console.log('✅ Login response:', data);
  } catch (error: any) {
    console.error('❌ Login failed:', error.message);
  }
}

testLogin();
