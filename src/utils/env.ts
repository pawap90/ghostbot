const config = {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    MAX_ISSUE_COUNT: process.env.MAX_ISSUE_COUNT || '5',
    LATEST_ISSUES_PAGE_SIZE: process.env.LATEST_ISSUES_PAGE_SIZE || '10',
    MAX_DAILY_ISSUES_PER_USER_COUNT: process.env.MAX_DAILY_ISSUES_PER_USER_COUNT  || '5',
    BOT_NAME: process.env.BOT_NAME || 'victorian-ghost-bot[bot]'
}

export default config;