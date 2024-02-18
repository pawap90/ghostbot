import { ProbotOctokit } from './types';

const MAX_DAILY_ISSUES_PER_USER_COUNT = process.env.MAX_DAILY_ISSUES_PER_USER_COUNT;

export async function checkMaxDailyIssuesPerUserReached(octokit: ProbotOctokit, owner: string, repo: string, creator: string) {
    const aDayAgo = new Date();
    aDayAgo.setDate(aDayAgo.getDate() - 1);

    const userIssuesRes = await octokit.issues.listForRepo({
        owner: owner,
        repo: repo,

        creator: creator,

        since: aDayAgo.toISOString(),
        state: "all",

        per_page: MAX_DAILY_ISSUES_PER_USER_COUNT
    });

    return userIssuesRes.data.length == MAX_DAILY_ISSUES_PER_USER_COUNT;
}