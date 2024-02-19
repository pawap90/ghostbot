import { Context } from 'probot';
import { generateFirstComment } from './ai/pullrequest-commenter-ai';
import { checkMaxDailyIssuesPerUserExceeded } from './utils/user-activity';

const MAX_DAILY_ISSUES_PER_USER_COUNT = process.env.MAX_DAILY_ISSUES_PER_USER_COUNT;

/**
 * Haunts the PR Realm.
 * @description The PullRequestCommenter leaves a comment in new PRs.
 */
export default class PullRequestCommenter {

    private context: Context<"pull_request.opened">;
    private get octokit() {
        return this.context.octokit;
    }

    private owner: string;
    private repo: string;

    constructor(context: Context<"pull_request.opened">) {
        this.context = context;

        const { owner, repo } = context.repo();
        this.owner = owner;
        this.repo = repo;
    }

    async invoke() {
        this.context.log.info("PullRequestCommenter - invoking...");
        
        const pr = this.context.payload.pull_request;

        if (await checkMaxDailyIssuesPerUserExceeded(this.octokit, this.owner, this.repo, pr.user.login)) {
            await this.createGhostUnavailableComment();
            await this.closeIssue();
            return;
        }

        const comment = await generateFirstComment({
            title: pr.title,
            description: pr.body ?? "No description provided."
        });

        return this.octokit.issues.createComment({
            repo: this.repo,
            owner: this.owner,
            issue_number: pr.number,
            body: comment
        });
    }

    private async createGhostUnavailableComment() {
        return this.octokit.issues.createComment({
            repo: this.repo,
            owner: this.owner,
            issue_number: this.context.payload.pull_request.number,
            body: `His ghostliness is currently unavailable to review your PR. Please try again tomorrow. He can only review ${MAX_DAILY_ISSUES_PER_USER_COUNT} PRs/issues per user per day, lest he becomes overwhelmed.`
        });
    }

    private async closeIssue() {
        return this.octokit.issues.update({
            repo: this.repo,
            owner: this.owner,
            issue_number: this.context.payload.pull_request.number,
            state: "closed",
            labels: ["ghost-unavailable"]
        });
    }
}