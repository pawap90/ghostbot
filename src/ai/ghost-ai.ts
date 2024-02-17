import { readFile } from 'fs/promises';
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources';
import { join } from 'path';
import { Liquid } from 'liquidjs'

const engine = new Liquid();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function chatCompletion(messages: ChatCompletionMessageParam[]) {
    return openai.chat.completions.create({
        messages,
        model: 'gpt-3.5-turbo-0125',
    });
}

export async function getPrompt<TContext extends object>(
    templateName: string,
    context?: TContext
) {
    const template = await getTemplate(templateName);

    const tmpl = engine.parse(template);
    return engine.render(tmpl, context);
}

async function getTemplate(
    templateName: string
): Promise<string> {
    const filename = join(process.cwd(), 'public', 'prompt-templates', `${templateName}.txt`);
    return readFile(filename, 'utf8');
}
