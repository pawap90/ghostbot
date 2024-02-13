import { readFile } from 'fs/promises';
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources';
import { join } from 'path';
import { Liquid } from 'liquidjs'

type Issue = {
    title: string;
    description: string;
}

const engine = new Liquid();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

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

async function chatCompletion(messages: ChatCompletionMessageParam[]) {
    return openai.chat.completions.create({
        messages,
        model: 'gpt-3.5-turbo-0125',
    });
}

async function getIssueTitlePrompt(lastActiveIssues: string[]) {
    const template = await getTemplate('issue-haunter-title');
    return getPrompt(template, { issues: lastActiveIssues });
}

async function getIssueDescriptionPrompt() {
    const template = await getTemplate('issue-haunter-description');
    return getPrompt(template, {});
}

async function getTemplate(
    templateName: 'issue-haunter-title' | 'issue-haunter-description'
): Promise<string> {
    const filename = join(__dirname, 'prompt-templates', `${templateName}.txt`);
    return readFile(filename, 'utf8');
}

async function getPrompt(template: string, context: any) {
    const tmpl = engine.parse(template);
    return engine.render(tmpl, context);
}