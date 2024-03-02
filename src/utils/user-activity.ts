import env  from './env';
import { ProbotOctokit } from './types';

const MAX_DAILY_ISSUES_PER_USER_COUNT: number = parseInt(env.MAX_DAILY_ISSUES_PER_USER_COUNT);

/**
 * Checks if the user has exceeded the maximum daily issues/PRs per user count.
 * It treats the issues and PRs as the same entity (More info here https://docs.github.com/en/rest/issues/issues?apiVersion=2022-11-28#list-repository-issues).
 */
export async function checkMaxDailyIssuesPerUserExceeded(octokit: ProbotOctokit, owner: string, repo: string, creator: string) {
    const aDayAgo = new Date();
    aDayAgo.setDate(aDayAgo.getDate() - 1);

    const userIssuesRes = await octokit.issues.listForRepo({
        owner: owner,
        repo: repo,

        creator: creator,

        since: aDayAgo.toISOString(),
        state: "all",

        per_page: MAX_DAILY_ISSUES_PER_USER_COUNT + 1 // +1 to check if max limit exceeded.
    });

    return userIssuesRes.data.length > MAX_DAILY_ISSUES_PER_USER_COUNT;
}