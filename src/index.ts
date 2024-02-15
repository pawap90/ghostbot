import { Probot } from "probot";
import IssueHaunter from "./issue-haunter";
import IssueRewriter from "./issue-rewriter";

export = (app: Probot) => {
    app.on([
        "issues.opened",
        "issues.closed",
        "issues.assigned",
        "issues.deleted"
    ],
        async (context) => new IssueHaunter(context).invoke());

    app.on("issues.opened", async (context) => new IssueRewriter(context).invoke());
};
