import { Context } from "probot";
import { generateIssue } from "./ghost-ai";

const MAX_ISSUE_COUNT = process.env.MAX_ISSUE_COUNT;

/**
 * Haunts the Issue Realm.
 * @description The IssueHaunter makes sure there's always
 * a certain amount (MAX_ISSUE_COUNT) of unassigned 
 * issues in the repository.
 */
export default class IssueHaunter {

    private context: Context;
    private get octokit() {
        return this.context.octokit;
    }

    private owner: string;
    private repo: string;

    constructor(context: Context) {
        this.context = context;

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
        if (await this.checkMaxActiveIssuesReached())
            return;

        const { title, description } = await generateIssue();

        return this.octokit.issues.create({
            repo: this.repo,
            owner: this.owner,
            title,
            body: description
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

            per_page: MAX_ISSUE_COUNT
        });

        return activeIssuesRes.data.length == MAX_ISSUE_COUNT;
    }
}
