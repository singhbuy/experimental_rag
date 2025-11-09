// List JIRA projects
require('dotenv').config({ path: '.env.local' });

async function listProjects() {
  const domain = process.env.JIRA_DOMAIN;
  const email = process.env.JIRA_EMAIL;
  const token = process.env.JIRA_TOKEN;

  const credentials = Buffer.from(`${email}:${token}`).toString('base64');
  const url = `https://${domain}/rest/api/3/project`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Failed to fetch projects:', response.status);
      console.error(errorText);
      process.exit(1);
    }

    const projects = await response.json();
    console.log(`Found ${projects.length} projects:\n`);

    projects.forEach((project, i) => {
      console.log(`${i + 1}. ${project.key} - ${project.name}`);
      console.log(`   ID: ${project.id}`);
      console.log(`   Type: ${project.projectTypeKey}`);
      console.log('');
    });

    // Get issue types for first project
    if (projects.length > 0) {
      const projectKey = projects[0].key;
      console.log(`\nFetching issue types for project: ${projectKey}`);

      const issueTypesUrl = `https://${domain}/rest/api/3/project/${projectKey}/statuses`;
      const issueTypesResponse = await fetch(issueTypesUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Accept': 'application/json',
        },
      });

      if (issueTypesResponse.ok) {
        const issueTypes = await issueTypesResponse.json();
        console.log('\nAvailable issue types:');
        issueTypes.forEach(type => {
          console.log(`- ${type.name} (ID: ${type.id})`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

listProjects();
