import { ChatCompletionMessageParam } from 'openai/resources';
import { chatCompletion, getPrompt } from './ghost-ai';

type Issue = {
    title: string;
    description: string;
}

type IssueRewriteContext = { issue: Issue };

export async function rewriteIssue(issue: Issue): Promise<Issue> {
    const promptTitle = await getIssueTitlePrompt(issue);

    const messages: ChatCompletionMessageParam[] = [
        { role: 'system', content: promptTitle }
    ];

    const titleCompletion = await chatCompletion(messages);
    const title = titleCompletion.choices[0]?.message?.content;

    if (!title)
        throw new Error("Failed to rewrite issue title");

    messages.push({ role: 'assistant', content: title! });

    const promptDescription = await getIssueDescriptionPrompt(issue);

    messages.push({ role: 'system', content: promptDescription });

    const descriptionCompletion = await chatCompletion(messages);

    const description = descriptionCompletion.choices[0]?.message?.content;

    if (!description)
        throw new Error("Failed to rewrite issue description");

    return {
        title,
        description,
    }
}

async function getIssueTitlePrompt(issue: Issue) {
    return getPrompt<IssueRewriteContext>('issue-rewrite-title', { issue: issue });
}

async function getIssueDescriptionPrompt(issue: Issue) {
    return getPrompt<IssueRewriteContext>('issue-rewrite-description', { issue: issue });
}