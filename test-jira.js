// Simple JIRA connection test
require('dotenv').config({ path: '.env.local' });

async function testJiraConnection() {
  const domain = process.env.JIRA_DOMAIN;
  const email = process.env.JIRA_EMAIL;
  const token = process.env.JIRA_TOKEN;

  console.log('Testing JIRA connection...');
  console.log('Domain:', domain);
  console.log('Email:', email);
  console.log('Token:', token ? '***' + token.slice(-10) : 'NOT SET');

  if (!domain || !email || !token) {
    console.error('❌ JIRA credentials not configured');
    process.exit(1);
  }

  const credentials = Buffer.from(`${email}:${token}`).toString('base64');
  const url = `https://${domain}/rest/api/3/myself`;

  console.log('\nTesting URL:', url);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Accept': 'application/json',
      },
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Connection failed:', response.status, response.statusText);
      console.error('Error details:', errorText);
      process.exit(1);
    }

    const user = await response.json();
    console.log('\n✅ Connection successful!');
    console.log('Logged in as:', user.displayName);
    console.log('Email:', user.emailAddress);
    console.log('Account ID:', user.accountId);

    // Try to fetch a few issues
    console.log('\nTesting issue fetch...');
    const searchUrl = `https://${domain}/rest/api/3/search?jql=order by created DESC&maxResults=5`;
    const searchResponse = await fetch(searchUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Accept': 'application/json',
      },
    });

    if (searchResponse.ok) {
      const searchData = await searchResponse.json();
      console.log(`✅ Found ${searchData.total} total issues`);
      console.log(`Retrieved ${searchData.issues.length} issues:`);
      searchData.issues.forEach((issue, i) => {
        console.log(`  ${i + 1}. ${issue.key}: ${issue.fields.summary}`);
      });
    } else {
      console.log('⚠️  Could not fetch issues');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testJiraConnection();
