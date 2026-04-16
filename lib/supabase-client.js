"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSupabaseClient = getSupabaseClient;
const supabase_js_1 = require("@supabase/supabase-js");
let client = null;
function getEnv() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    return { url, anonKey };
}
function getSupabaseClient() {
    if (client)
        return client;
    const { url, anonKey } = getEnv();
    if (!url || !anonKey) {
        throw new Error("Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
    }
    client = (0, supabase_js_1.createClient)(url, anonKey);
    return client;
}
