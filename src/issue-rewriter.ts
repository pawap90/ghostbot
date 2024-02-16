import { Context } from "probot";
import { rewriteIssue } from "./ai/issue-rewriter-ai";

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

        if (await this.checkMaxDailyIssuesPerUserReached())
            await this.createGhostUnavailableComment();
        else {
            const issueCreatedRes = await this.rewriteIssue();
            await this.createIssueRewritedComment(issueCreatedRes.data.number);
        }

        return this.closeIssue();
    }

    private async checkMaxDailyIssuesPerUserReached() {
        const aDayAgo = new Date();
        aDayAgo.setDate(aDayAgo.getDate() - 1);

        const userIssuesRes = await this.octokit.issues.listForRepo({
            owner: this.owner,
            repo: this.repo,

            creator: this.context.payload.sender.login,

            since: aDayAgo.toISOString(),
            state: "all",

            per_page: MAX_DAILY_ISSUES_PER_USER_COUNT
        });

        console.log({
            aDayAgo,
            username: this.context.payload.sender.login,
            issues: userIssuesRes.data.length
        })

        return userIssuesRes.data.length == MAX_DAILY_ISSUES_PER_USER_COUNT;
    }

    private async createGhostUnavailableComment() {
        return this.octokit.issues.createComment({
            repo: this.repo,
            owner: this.owner,
            issue_number: this.context.payload.issue.number,
            body: `His ghostliness is currently unavailable to review your comments. Please try again tomorrow. He can only review ${MAX_DAILY_ISSUES_PER_USER_COUNT} issues per user per day, lest he becomes overwhelmed.`
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
            label: "invalid"
        });
    }

    private async rewriteIssue() {
        const currentIssue = this.context.payload.issue;
        const { title, description } = await rewriteIssue({ title: currentIssue.title, description: currentIssue.body ?? "" });

        return this.octokit.issues.create({
            repo: this.repo,
            owner: this.owner,
            title,
            body: description
        });
    }
}
