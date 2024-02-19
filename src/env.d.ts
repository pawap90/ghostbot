declare global {
    namespace NodeJS {
        interface ProcessEnv {
            OPENAI_API_KEY: string;
            MAX_ISSUE_COUNT: string;
            LATEST_ISSUES_PAGE_SIZE: number;
            MAX_DAILY_ISSUES_PER_USER_COUNT: string;
            BOT_NAME: string;
        }
    }
}

export {}