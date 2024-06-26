import { Context } from "probot";
import { generateIssue } from "./ai/issue-creator-ai";
import { ProbotOctokit } from "./utils/types";
import env from "./utils/env";

const MAX_ISSUE_COUNT: number = parseInt(env.MAX_ISSUE_COUNT);
const LATEST_ISSUES_PAGE_SIZE: number = parseInt(env.LATEST_ISSUES_PAGE_SIZE);
const BOT_NAME: string = env.BOT_NAME;

/**
 * Haunts the Issue Realm.
 * @description The IssueCreator makes sure there's always
 * a certain amount (MAX_ISSUE_COUNT) of unassigned 
 * issues in the repository.
 */
export default class IssueCreator {
    private context: Context;
    
    private readonly octokit: ProbotOctokit;
    private readonly owner: string;
    private readonly repo: string;

    constructor(context: Context) {
        this.context = context;

        this.octokit = context.octokit;
        const { owner, repo } = context.repo();
        this.owner = owner;
        this.repo = repo;
    }

    /**
     * Creates a new issue if the maximum amount of
     * unassigned issues is not reached.
     * @returns the created issue
     */
    async invoke() {
        this.context.log.info("IssueCreator - invoking...");

        if (await this.checkMaxActiveIssuesReached()) 
            return;

        const lastIssues = await this.getLatestIssues();

        const { title, description } = await generateIssue(lastIssues);

        return this.octokit.issues.create({
            repo: this.repo,
            owner: this.owner,
            title,
            body: description,
            labels: ["haunted"]
        });
    }

    /**
     * Checks if the maximum amount of 
     * unassigned issues is currently reached.
     * @returns true if the maximum amount of issues is reached
     */
    private async checkMaxActiveIssuesReached() {
        const activeIssuesRes = await this.octokit.issues.listForRepo({
            owner: this.owner,
            repo: this.repo,

            state: "open",
            assignee: "none",
            labels: "haunted",

            per_page: MAX_ISSUE_COUNT
        });

        return activeIssuesRes.data.length == MAX_ISSUE_COUNT;
    }

    /**
     * Fetches the titles of the last issues created by the bot in this repo.
     * The amount of issues fetched is defined by LATEST_ISSUES_PAGE_SIZE.
     * @returns the titles of the last issues
     */
    private async getLatestIssues() {
        const activeIssuesRes = await this.octokit.issues.listForRepo({
            owner: this.owner,
            repo: this.repo,

            state: "all",
            creator: BOT_NAME,
            labels: "haunted",

            sort: "created",
            direction: "desc",

            per_page: LATEST_ISSUES_PAGE_SIZE
        });

        return activeIssuesRes.data.map(issue => issue.title);
    }
}
