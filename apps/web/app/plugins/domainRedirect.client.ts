export default defineNuxtPlugin(() => {
  if (typeof window === "undefined") return;

  const host = window.location.hostname;
  const isPrivateIp =
    /^(?:192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3})$/.test(
      host,
    );

  if (isPrivateIp) {
    const port = window.location.port ? `:${window.location.port}` : "";
    const target = `${window.location.protocol}//${host}.sslip.io${port}${window.location.pathname}${window.location.search}${window.location.hash}`;
    window.location.replace(target);
  }
});
