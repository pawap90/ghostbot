import { ChatCompletionMessageParam } from 'openai/resources';
import { chatCompletion, getPrompt } from './ghost-ai';
import { titleTemplate, descriptionTemplate } from './prompt-templates/issue-creator';

type Issue = {
    title: string;
    description: string;
}

type IssueTitleContext = { issues: string[] };

export async function generateIssue(lastActiveIssues: string[]): Promise<Issue> {
    const promptTitle = await getIssueTitlePrompt(lastActiveIssues);

    const messages: ChatCompletionMessageParam[] = [
        { role: 'system', content: promptTitle }
    ];

    const titleCompletion = await chatCompletion(messages);
    const title = titleCompletion.choices[0]?.message?.content;

    if (!title)
        throw new Error("Failed to generate issue title");

    messages.push({ role: 'assistant', content: title! });

    const promptDescription = await getIssueDescriptionPrompt();

    messages.push({ role: 'system', content: promptDescription });

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
    return getPrompt<IssueTitleContext>(titleTemplate, { issues: lastActiveIssues });
}

async function getIssueDescriptionPrompt() {
    return getPrompt(descriptionTemplate);
}