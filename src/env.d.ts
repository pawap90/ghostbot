declare global {
    namespace NodeJS {
        interface ProcessEnv {
            OPENAI_API_KEY: string;
            MAX_ISSUE_COUNT: number;
            LATEST_ISSUES_PAGE_SIZE: number;
            MAX_DAILY_ISSUES_PER_USER_COUNT: number;
            BOT_NAME: string;
        }
    }
}

export {}