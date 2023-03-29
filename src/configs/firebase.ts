import { env } from "@/env.mjs";
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const app = initializeApp(JSON.parse(process.env.NEXT_PUBLIC_FIREBASE_CONFIG_CLIENT!));

const db = getDatabase(app);

export { app, db };
