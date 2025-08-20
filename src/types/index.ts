export interface Command {
    command: string;
    title: string;
    category?: string;
}

export interface Configuration {
    settingA: string;
    settingB: number;
    enableFeatureX: boolean;
}