import { Context } from "probot"

const MAX_ISSUE_COUNT = process.env.MAX_ISSUE_COUNT;

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

    async invoke() {
        if (await this.checkMaxActiveIssuesReached())
            return;

        return this.octokit.issues.create({
            repo: this.repo,
            owner: this.owner,
            title: "👻",
            body: "Boo! 👻"
        });
    }

    private async checkMaxActiveIssuesReached() {
        const activeIssuesRes = await this.octokit.issues.listForRepo({ 
            state: "open", 
            owner: this.owner,
            repo: this.repo,
            sort: "created",
            direction: "asc",
            per_page: MAX_ISSUE_COUNT
        });

        return activeIssuesRes.data.length >= MAX_ISSUE_COUNT;
    }
}
