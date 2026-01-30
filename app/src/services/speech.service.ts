// speech.service.ts
import { ExpoSpeechRecognitionModule } from "expo-speech-recognition";

type Subscription = { remove: () => void };

export function isSpeechAvailable() {
    try {
        return ExpoSpeechRecognitionModule.isRecognitionAvailable();
    } catch {
        return false;
    }
}

export async function requestSpeechPermissions() {
    try {
        return await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    } catch {
        return { granted: false } as const;
    }
}

export function startListening(
    onText: (chunk: string) => void,
    options?: { lang?: string; continuous?: boolean; interimResults?: boolean }
) {
    if (!isSpeechAvailable()) {
        throw new Error(
            "Speech recognition is not available. Use a dev build (expo run:* / EAS dev client) and ensure the OS speech service is enabled."
        );
    }

    const subs: Subscription[] = [];

    subs.push(
        ExpoSpeechRecognitionModule.addListener("result", (event) => {
            const text = event?.results?.[0]?.transcript ?? "";
            if (text) onText(text);
        }) as unknown as Subscription
    );

    subs.push(
        ExpoSpeechRecognitionModule.addListener("error", (event) => {
            console.warn("[speech] error:", event?.error, event?.message);
        }) as unknown as Subscription
    );

    ExpoSpeechRecognitionModule.start({
        lang: options?.lang ?? "en-US",
        interimResults: options?.interimResults ?? true,
        continuous: options?.continuous ?? false,
    });

    return () => {
        try {
            ExpoSpeechRecognitionModule.stop();
        } finally {
            subs.forEach((s) => s?.remove?.());
        }
    };
}