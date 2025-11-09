/**
 * JIRA API Client
 * Fetches issues from JIRA Cloud using REST API
 */

export interface JiraIssue {
  id: string;
  key: string;
  fields: {
    summary: string;
    description?: string;
    status: {
      name: string;
    };
    issuetype: {
      name: string;
    };
    priority?: {
      name: string;
    };
    assignee?: {
      displayName: string;
      emailAddress: string;
    };
    reporter?: {
      displayName: string;
    };
    created: string;
    updated: string;
    project: {
      key: string;
      name: string;
    };
  };
}

export interface JiraConfig {
  domain: string;
  email: string;
  token: string;
}

/**
 * Get JIRA configuration from environment variables
 */
export function getJiraConfig(): JiraConfig {
  const domain = process.env.JIRA_DOMAIN;
  const email = process.env.JIRA_EMAIL;
  const token = process.env.JIRA_TOKEN;

  if (!domain || !email || !token) {
    throw new Error('JIRA credentials not configured. Please set JIRA_DOMAIN, JIRA_EMAIL, and JIRA_TOKEN');
  }

  return { domain, email, token };
}

/**
 * Create Basic Auth header for JIRA API
 */
function getAuthHeader(config: JiraConfig): string {
  const credentials = Buffer.from(`${config.email}:${config.token}`).toString('base64');
  return `Basic ${credentials}`;
}

/**
 * Fetch issues from JIRA
 */
export async function fetchJiraIssues(
  options: {
    jql?: string;
    maxResults?: number;
    startAt?: number;
  } = {}
): Promise<{ issues: JiraIssue[]; total: number }> {
  const config = getJiraConfig();
  const { jql = 'order by created DESC', maxResults = 50, startAt = 0 } = options;

  const url = new URL(`https://${config.domain}/rest/api/3/search`);
  url.searchParams.append('jql', jql);
  url.searchParams.append('maxResults', maxResults.toString());
  url.searchParams.append('startAt', startAt.toString());

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Authorization': getAuthHeader(config),
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`JIRA API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return {
    issues: data.issues,
    total: data.total,
  };
}

/**
 * Convert JIRA issue to searchable document text
 */
export function jiraIssueToDocument(issue: JiraIssue): {
  title: string;
  content: string;
  metadata: Record<string, any>;
} {
  const {
    key,
    fields: {
      summary,
      description,
      status,
      issuetype,
      priority,
      assignee,
      reporter,
      created,
      updated,
      project,
    },
  } = issue;

  // Build comprehensive searchable content
  const contentParts = [
    `Issue Key: ${key}`,
    `Summary: ${summary}`,
    description ? `Description: ${description}` : '',
    `Status: ${status.name}`,
    `Type: ${issuetype.name}`,
    priority ? `Priority: ${priority.name}` : '',
    assignee ? `Assignee: ${assignee.displayName}` : '',
    reporter ? `Reporter: ${reporter.displayName}` : '',
    `Project: ${project.name} (${project.key})`,
  ];

  const content = contentParts.filter(Boolean).join('\n\n');

  return {
    title: `[${key}] ${summary}`,
    content,
    metadata: {
      jiraKey: key,
      jiraId: issue.id,
      status: status.name,
      issueType: issuetype.name,
      priority: priority?.name,
      assignee: assignee?.displayName,
      reporter: reporter?.displayName,
      projectKey: project.key,
      projectName: project.name,
      created,
      updated,
      url: `https://${process.env.JIRA_DOMAIN}/browse/${key}`,
    },
  };
}

/**
 * Fetch a specific JIRA issue
 */
export async function fetchJiraIssue(issueKey: string): Promise<JiraIssue> {
  const config = getJiraConfig();

  const url = `https://${config.domain}/rest/api/3/issue/${issueKey}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': getAuthHeader(config),
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch JIRA issue ${issueKey}: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Test JIRA connection
 */
export async function testJiraConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const config = getJiraConfig();
    const url = `https://${config.domain}/rest/api/3/myself`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': getAuthHeader(config),
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      return {
        success: false,
        message: `Connection failed: ${response.status} ${response.statusText}`,
      };
    }

    const user = await response.json();
    return {
      success: true,
      message: `Connected as ${user.displayName} (${user.emailAddress})`,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
}
