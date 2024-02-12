import { Probot } from "probot";
import IssueHaunter from "./issue-haunter";

export = (app: Probot) => {
    app.on("issues.opened", async (context) => {
        return new IssueHaunter(context).invoke();
    });

    app.on("issues.closed", async (context) => {
        return new IssueHaunter(context).invoke();
    });

    app.on("issues.assigned", async (context) => {
        return new IssueHaunter(context).invoke();
    });

    app.on("issues.deleted", async (context) => {
        return new IssueHaunter(context).invoke();
    });
};
