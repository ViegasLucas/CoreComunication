async function testLiveServer() {
  try {
    console.log('Testing GET http://localhost:3001/api/reports/team/excel...');
    const res = await fetch('http://localhost:3001/api/reports/team/excel', {
      headers: { 'Authorization': 'Bearer user-mock-123' }
    });
    console.log('Status Code:', res.status);
    console.log('Content-Type:', res.headers.get('content-type'));
    const text = await res.text();
    console.log('Body Preview:', text.substring(0, 150));
  } catch (err) {
    console.error('Error connecting to dev server:', err);
  }
}

testLiveServer();
