import { Probot } from "probot";
import IssueHaunter from "./issue-haunter";

export = (app: Probot) => {
    app.on([
        "issues.opened",
        "issues.closed",
        "issues.assigned",
        "issues.deleted"
    ],
        async (context) => new IssueHaunter(context).invoke());
};
