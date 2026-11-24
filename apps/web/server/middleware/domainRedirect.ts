import { defineEventHandler, getRequestHeader, sendRedirect } from "h3";

const PRIVATE_IP_REGEX =
  /^(?:192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3})$/;

export default defineEventHandler((event) => {
  const hostHeader = getRequestHeader(event, "host");
  if (!hostHeader) return;

  const [hostname, port] = hostHeader.split(":");
  if (PRIVATE_IP_REGEX.test(hostname)) {
    const protocol = getRequestHeader(event, "x-forwarded-proto") || "http";
    const portSuffix = port ? `:${port}` : "";
    const target = `${protocol}://${hostname}.sslip.io${portSuffix}${event.path || "/"}`;
    return sendRedirect(event, target, 302);
  }
});
