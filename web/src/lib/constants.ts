export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const ALLOWED_AUDIO_FORMATS = ["wav", "mp3", "m4a"];
export const MAX_UPLOAD_SIZE = 50 * 1024 * 1024;
export const MIN_VOICE_DURATION = 5;
export const MAX_VOICE_DURATION = 30;
