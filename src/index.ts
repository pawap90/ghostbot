import { Probot } from "probot";
import IssueHaunter from "./issue-haunter";

export = (app: Probot) => {
    app.on("issues.opened", async (context) => {
        new IssueHaunter(context).invoke();
    });
};
