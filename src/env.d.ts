declare global {
    namespace NodeJS {
        interface ProcessEnv {
            OPENAI_API_KEY: string;
            MAX_ISSUE_COUNT: number;
        }
    }
}

export {}