import { Context } from "probot";
import { rewriteIssue } from "./ai/issue-rewriter-ai";
import { checkMaxDailyIssuesPerUserReached } from "./utils/user-activity";

const MAX_DAILY_ISSUES_PER_USER_COUNT = process.env.MAX_DAILY_ISSUES_PER_USER_COUNT;

export default class IssueRewriter {

    private context: Context<"issues.opened">;
    private get octokit() {
        return this.context.octokit;
    }

    private owner: string;
    private repo: string;

    constructor(context: Context<"issues.opened">) {
        this.context = context;

        const { owner, repo } = context.repo();
        this.owner = owner;
        this.repo = repo;
    }

    async invoke() {
        this.context.log.info("IssueRewriter - invoking...");

        if (this.context.isBot) // ignore bot generated issues.
            return;

        if (await checkMaxDailyIssuesPerUserReached(this.octokit, this.owner, this.repo, this.context.payload.issue.user.login))
            await this.createGhostUnavailableComment();
        else {
            const issueCreatedRes = await this.rewriteIssue();
            await this.createIssueRewritedComment(issueCreatedRes.data.number);
        }

        return this.closeIssue();
    }

    private async createGhostUnavailableComment() {
        return this.octokit.issues.createComment({
            repo: this.repo,
            owner: this.owner,
            issue_number: this.context.payload.issue.number,
            body: `His ghostliness is currently unavailable to review your issues. Please try again tomorrow. He can only review ${MAX_DAILY_ISSUES_PER_USER_COUNT} issues/PRs per user per day, lest he becomes overwhelmed.`
        });
    }

    private async createIssueRewritedComment(newIssueNumber: number) {
        return this.octokit.issues.createComment({
            repo: this.repo,
            owner: this.owner,
            issue_number: this.context.payload.issue.number,
            body: `His ghostliness has rewritten your issue to better fit his ghostly needs. You can find the new issue at #${newIssueNumber}.`
        });
    }

    private async closeIssue() {
        return this.octokit.issues.update({
            repo: this.repo,
            owner: this.owner,
            issue_number: this.context.payload.issue.number,
            state: "closed",
            labels: ["ghost-unavailable"]
        });
    }

    private async rewriteIssue() {
        const currentIssue = this.context.payload.issue;
        const { title, description } = await rewriteIssue({ title: currentIssue.title, description: currentIssue.body ?? "" });

        return this.octokit.issues.create({
            repo: this.repo,
            owner: this.owner,
            title,
            body: description,
            labels: ["banished"]
        });
    }
}
