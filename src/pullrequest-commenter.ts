import { Context } from 'probot';
import { generateFirstComment } from './ai/pullrequest-commenter-ai';

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
}
