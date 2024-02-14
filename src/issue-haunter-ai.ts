import { ChatCompletionMessageParam } from 'openai/resources';
import { chatCompletion, getPrompt } from './ghost-ai';

type Issue = {
    title: string;
    description: string;
}

export async function generateIssue(lastActiveIssues: string[]): Promise<Issue> {
    const promptTitle = await getIssueTitlePrompt(lastActiveIssues);

    const messages: ChatCompletionMessageParam[] = [
        { role: 'user', content: promptTitle }
    ];

    const titleCompletion = await chatCompletion(messages);
    const title = titleCompletion.choices[0]?.message?.content;

    if (!title)
        throw new Error("Failed to generate issue title");

    messages.push({ role: 'assistant', content: title! });

    const promptDescription = await getIssueDescriptionPrompt();

    messages.push({ role: 'user', content: promptDescription });

    const descriptionCompletion = await chatCompletion(messages);

    const description = descriptionCompletion.choices[0]?.message?.content;

    if (!description)
        throw new Error("Failed to generate issue description");

    return {
        title,
        description,
    }
}

async function getIssueTitlePrompt(lastActiveIssues: string[]) {
    return getPrompt('issue-haunter-title', { issues: lastActiveIssues });
}

async function getIssueDescriptionPrompt() {
    return getPrompt('issue-haunter-description', {});
}