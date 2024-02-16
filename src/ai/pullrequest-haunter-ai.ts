import { ChatCompletionMessageParam } from 'openai/resources';
import { chatCompletion, getPrompt } from './ghost-ai';

type PullRequest = {
    title: string;
    description: string;
}

type PullRequestContext = { pullRequest: PullRequest };

export async function generateFirstComment(pullRequest: PullRequest): Promise<string> {
    const commentPrompt = await getPullRequestFirstCommentPrompt(pullRequest);

    const messages: ChatCompletionMessageParam[] = [
        { role: 'system', content: commentPrompt }
    ];

    const commentCompletion = await chatCompletion(messages);
    const comment = commentCompletion.choices[0]?.message?.content;

    if (!comment)
        throw new Error("Failed to generate pull_request first comment");

    return comment;
}

async function getPullRequestFirstCommentPrompt(pullRequest: PullRequest) {
    return getPrompt<PullRequestContext>('pullrequest-first-comment', { pullRequest: pullRequest });
}