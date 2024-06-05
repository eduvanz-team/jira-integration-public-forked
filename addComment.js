import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const email = process.env.EMAIL;
const apiToken = process.env.API_TOKEN;
const jira_ids = process.env.JIRRA_IDS.split(','); // jira project id's
const cm_ids = process.env.CM_IDS.split(','); // change management id's
const repo_name = process.env.REPO_NAME;
const branch_name = process.env.BRANCH_NAME;
const pr_url = process.env.PR_URL;
const developerUsername = process.env.DEVELOPER_USERNAME;
const developerFullname = process.env.DEVELOPER_FULLNAME;

const bodyDataCM = JSON.stringify({
    "body": {
        "type": "doc",
        "version": 1,
        "content": [
            {
                "type": "paragraph",
                "content": [
                    {
                        "type": "text",
                        "text": `Changes are merged successfully. Pull Request details:-\nDeveloper username: ${developerUsername}, fullname: ${developerFullname}\nRepository: ${repo_name}\nBranch: ${branch_name}\nPR URL: ${pr_url}\nWorked on Jira issues: ${jira_ids}`
                    }
                ]
            }
        ]
    }
});

const bodyDataJiraIssue = JSON.stringify({
    "body": {
        "type": "doc",
        "version": 1,
        "content": [
            {
                "type": "paragraph",
                "content": [
                    {
                        "type": "text",
                        "text": `Changes are merged successfully. Pull Request details:-\nDeveloper username: ${developerUsername}, fullname: ${developerFullname}\nRepository: ${repo_name}\nBranch: ${branch_name}\nPR URL: ${pr_url}\nChange-Management request id: ${cm_ids}`
                    }
                ]
            }
        ]
    }
});

async function postComment(issue_id, isJiraIssue) {
    console.log(`Issue ID: ${issue_id}`);
    var bodyData = bodyDataCM
    if(isJiraIssue) bodyData = bodyDataJiraIssue

    try {
        const response = await fetch(`https://eduvanz.atlassian.net/rest/api/3/issue/${issue_id}/comment`, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${Buffer.from(`${email}:${apiToken}`).toString('base64')}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: bodyData
        });

        if (!response.ok) {
            console.log(`Error: ${response.status} ${response.statusText}`);
        } else {
            console.log('Comment added successfully');
        }
    } catch (error) {
        console.error(`Request failed: ${error}`);
    }
}

// add comments
for(let i=0; i<cm_ids.length; i++) {
    await postComment(cm_ids[i], false);
}

for(let i=0; i<jira_ids.length; i++) {
    await postComment(jira_ids[i], true);
}
