import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources';
import { Liquid } from 'liquidjs'

const engine = new Liquid();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function chatCompletion(messages: ChatCompletionMessageParam[]) {
    return openai.chat.completions.create({
        messages,
        model: 'gpt-3.5-turbo-1106',
        temperature: 0.7,
        top_p: 0.8
    });
}

export async function getPrompt<TContext extends object>(
    template: string,
    context?: TContext
) {
    const tmpl = engine.parse(template);
    return engine.render(tmpl, context);
}