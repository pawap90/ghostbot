import { Probot } from "probot";
import IssueCreator from "./issue-creator";
import IssueRewriter from "./issue-rewriter";
import PullRequestHaunter from "./pullrequest-haunter";

export default (app: Probot) => {
    app.log.info("Ghost bot ready to haunt...");

    app.on([
        "issues.opened",
        "issues.closed",
        "issues.assigned",
        "issues.deleted"
    ],
        async (context) => new IssueCreator(context).invoke());

    app.on("issues.opened", async (context) => new IssueRewriter(context).invoke());

    app.on("pull_request.opened", async (context) => new PullRequestHaunter(context).invoke());
};
