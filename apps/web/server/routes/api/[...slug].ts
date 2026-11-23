import { defineEventHandler, proxyRequest } from "h3";

export default defineEventHandler((event) => {
  const targetBase = process.env.NUXT_API_INTERNAL_URL || "http://localhost:4000";
  return proxyRequest(event, `${targetBase}${event.path}`);
});
