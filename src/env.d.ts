declare global {
    namespace NodeJS {
        interface ProcessEnv {
            OPENAI_API_KEY: string;
            MAX_ISSUE_COUNT: number;
            LATEST_ISSUES_PAGE_SIZE: number;
        }
    }
}

export {}