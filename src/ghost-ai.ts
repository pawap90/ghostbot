import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources';

type Issue = {
    title: string;
    description: string;
}

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function generateIssue(): Promise<Issue> {
    const promptTitle = "Create a new issue title for a TODO list App"

    const messages: ChatCompletionMessageParam[] = [
        { role: 'user', content: promptTitle }
    ];

    const titleCompletion = await chatCompletion(messages);
    const title = titleCompletion.choices[0]?.message?.content;

    if (!title)
        throw new Error("Failed to generate issue title");

    messages.push({ role: 'assistant', content: title! });

    const promptDescription = "What would be the description of the issue? Use markdown to format it so it's more legible.";

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