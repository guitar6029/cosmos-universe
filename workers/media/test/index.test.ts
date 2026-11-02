import { afterEach, describe, expect, it, vi } from "vitest";

import worker from "../src/index";

const encoder = new TextEncoder();

function r2Object(key: string, value: string): R2ObjectBody {
  const bytes = encoder.encode(value);
  return {
    key, version: "v1", size: bytes.byteLength, etag: "etag", httpEtag: '"etag"',
    checksums: {} as R2Checksums, uploaded: new Date(), storageClass: "Standard",
    body: new ReadableStream({ start(controller) { controller.enqueue(bytes); controller.close(); } }),
    bodyUsed: false, arrayBuffer: async () => bytes.slice().buffer as ArrayBuffer, bytes: async () => bytes,
    text: async () => value, json: async <T>() => JSON.parse(value) as T,
    blob: async () => new Blob([bytes]), writeHttpMetadata: () => undefined,
  };
}

function enabledEnv(fixtures: Record<string, string> = {}) {
  const get = vi.fn(async (key: string, options?: R2GetOptions) => {
    const value = fixtures[key];
    if (value === undefined) return null;
    if (!options?.range || options.range instanceof Headers) return r2Object(key, value);
    const range = options.range as { offset: number; length: number };
    return r2Object(key, value.slice(range.offset, range.offset + range.length));
  });
  const head = vi.fn(async (key: string) => fixtures[key] === undefined ? null : r2Object(key, fixtures[key]));
  const limit = vi.fn(async () => ({ success: true }));
  const bucket = { get, head, put: vi.fn(), delete: vi.fn(), list: vi.fn() } as unknown as R2Bucket;
  const rateLimiter = { limit } as RateLimit;
  return { env: { MEDIA_BUCKET: bucket, MEDIA_RATE_LIMITER: rateLimiter, MEDIA_DELIVERY_ENABLED: "true" }, get, head, bucket, limit, rateLimiter };
}

function executionContext() {
  const pending: Promise<unknown>[] = [];
  return {
    pending,
    context: {
      waitUntil(promise: Promise<unknown>) { pending.push(promise); },
      passThroughOnException() {},
    } as ExecutionContext,
  };
}

function installCache() {
  const entries = new Map<string, Response>();
  const match = vi.fn(async (request: Request) => entries.get(request.url)?.clone());
  const put = vi.fn(async (request: Request, response: Response) => {
    entries.set(request.url, response.clone());
  });
  vi.stubGlobal("caches", { default: { match, put } });
  return { match, put };
}

async function dispatch(
  path: string,
  env: Parameters<typeof worker.fetch>[1],
  init?: RequestInit,
  context = executionContext().context,
) {
  const headers = new Headers(init?.headers);
  if (!headers.has("CF-Connecting-IP")) headers.set("CF-Connecting-IP", "192.0.2.1");
  return worker.fetch(new Request(`https://media.cosmos-universe.com${path}`, { ...init, headers }), env, context);
}

afterEach(() => vi.unstubAllGlobals());

describe("media worker", () => {
  it.each([undefined, "false", "TRUE", "1", "enabled"])("fails closed for MEDIA_DELIVERY_ENABLED=%s without accessing R2", async (deliveryEnabled) => {
    const { match } = installCache();
    const bucket = new Proxy({}, { get: () => { throw new Error("R2 should not be accessed"); } }) as R2Bucket;
    const rateLimiter = new Proxy({}, { get: () => { throw new Error("Rate limiter should not be accessed"); } }) as RateLimit;
    const env = deliveryEnabled === undefined
      ? { MEDIA_BUCKET: bucket, MEDIA_RATE_LIMITER: rateLimiter }
      : { MEDIA_BUCKET: bucket, MEDIA_RATE_LIMITER: rateLimiter, MEDIA_DELIVERY_ENABLED: deliveryEnabled };
    const response = await dispatch("/astro-pop/orange-cream.png", env);

    expect(response.status).toBe(503);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(match).not.toHaveBeenCalled();
  });

  it("checks the same client key for every permitted media path", async () => {
    const { env, limit } = enabledEnv({ "astro-pop/image.png": "image", "astro-pop/sound.mp3": "audio" });

    await dispatch("/astro-pop/image.png", env, { headers: { "CF-Connecting-IP": "2001:db8::1" } });
    await dispatch("/astro-pop/sound.mp3", env, { headers: { "CF-Connecting-IP": "2001:db8::1" } });

    expect(limit).toHaveBeenNthCalledWith(1, { key: "2001:db8::1" });
    expect(limit).toHaveBeenNthCalledWith(2, { key: "2001:db8::1" });
  });

  it("uses independent client keys", async () => {
    const { env, limit } = enabledEnv({ "astro-pop/image.png": "image" });

    await dispatch("/astro-pop/image.png", env, { headers: { "CF-Connecting-IP": "192.0.2.1" } });
    await dispatch("/astro-pop/image.png", env, { headers: { "CF-Connecting-IP": "2001:db8::1" } });

    expect(limit).toHaveBeenNthCalledWith(1, { key: "192.0.2.1" });
    expect(limit).toHaveBeenNthCalledWith(2, { key: "2001:db8::1" });
  });

  it.each(["", "untrusted-value"])("fails closed without a valid Cloudflare client identity %j", async (clientIp) => {
    const { env, get, head, limit } = enabledEnv({ "astro-pop/image.png": "image" });
    const { match } = installCache();

    const response = await dispatch("/astro-pop/image.png", env, { headers: { "CF-Connecting-IP": clientIp, "X-Forwarded-For": "192.0.2.1" } });

    expect(response.status).toBe(503);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(limit).not.toHaveBeenCalled();
    expect(match).not.toHaveBeenCalled();
    expect(get).not.toHaveBeenCalled();
    expect(head).not.toHaveBeenCalled();
  });

  it("fails closed when the rate-limit binding is missing or fails", async () => {
    const missing = enabledEnv({ "astro-pop/image.png": "image" });
    const cache = installCache();
    const missingBindingEnv = { MEDIA_BUCKET: missing.bucket, MEDIA_DELIVERY_ENABLED: "true" } as unknown as Parameters<typeof worker.fetch>[1];

    expect((await dispatch("/astro-pop/image.png", missingBindingEnv)).status).toBe(503);
    expect(missing.get).not.toHaveBeenCalled();
    expect(cache.match).not.toHaveBeenCalled();

    const broken = enabledEnv({ "astro-pop/image.png": "image" });
    broken.limit.mockRejectedValueOnce(new Error("rate limiter unavailable"));
    expect((await dispatch("/astro-pop/image.png", broken.env)).status).toBe(503);
    expect(broken.get).not.toHaveBeenCalled();
  });

  it("returns a non-cacheable 429 before cache or R2 access when rate limited", async () => {
    const { env, get, head, limit } = enabledEnv({ "astro-pop/image.png": "image" });
    limit.mockResolvedValueOnce({ success: false });
    const { match, put } = installCache();

    const response = await dispatch("/astro-pop/image.png", env);

    expect(response.status).toBe(429);
    expect(await response.text()).toBe("Too many requests");
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(response.headers.get("Retry-After")).toBe("60");
    expect(match).not.toHaveBeenCalled();
    expect(put).not.toHaveBeenCalled();
    expect(get).not.toHaveBeenCalled();
    expect(head).not.toHaveBeenCalled();
  });

  it("keeps rate-limited HEAD responses bodyless", async () => {
    const { env, limit } = enabledEnv({ "astro-pop/image.png": "image" });
    limit.mockResolvedValueOnce({ success: false });

    const response = await dispatch("/astro-pop/image.png", env, { method: "HEAD" });

    expect(response.status).toBe(429);
    expect(response.body).toBeNull();
    expect(response.headers.get("Retry-After")).toBe("60");
  });

  it("gets allowed media with safe headers and ignores query parameters", async () => {
    const { env, get } = enabledEnv({ "astro-pop/testimonials/walter.mp4": "0123456789" });
    const response = await dispatch("/astro-pop/testimonials/walter.mp4?irrelevant=yes", env);

    expect(response.status).toBe(200);
    expect(await response.text()).toBe("0123456789");
    expect(get).toHaveBeenCalledWith("astro-pop/testimonials/walter.mp4");
    expect(response.headers.get("Content-Type")).toBe("video/mp4");
    expect(response.headers.get("Content-Length")).toBe("10");
    expect(response.headers.get("ETag")).toBe('"etag"');
    expect(response.headers.get("Accept-Ranges")).toBe("bytes");
    expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
  });

  it("serves Astro Pop loading artwork from the existing public prefix with safe image caching", async () => {
    const key = "astro-pop/loading/astro-boy-loading.png";
    const { env, get } = enabledEnv({ [key]: "loading-artwork" });
    const { match, put } = installCache();
    const { context, pending } = executionContext();

    const response = await dispatch(`/${key}`, env, undefined, context);

    expect(response.status).toBe(200);
    expect(await response.text()).toBe("loading-artwork");
    expect(response.headers.get("Content-Type")).toBe("image/png");
    expect(response.headers.get("Cache-Control")).toContain("s-maxage=300");
    expect(get).toHaveBeenCalledWith(key);
    expect(match).toHaveBeenCalledOnce();
    await Promise.all(pending);
    expect(put).toHaveBeenCalledOnce();
  });

  it.each([
    "astronaut",
    "cat",
    "alien",
    "robot",
  ])("serves reviewed %s avatar from R2", async (avatar) => {
    const key = `avatars/cosmos_avatar_${avatar}_transparent.png`;
    const { env, get } = enabledEnv({ [key]: "preset-avatar" });
    const { match, put } = installCache();
    const { context, pending } = executionContext();

    const response = await dispatch(`/${key}`, env, undefined, context);

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("image/png");
    expect(response.headers.get("Cache-Control")).toContain("s-maxage=300");
    expect(await response.text()).toBe("preset-avatar");
    expect(get).toHaveBeenCalledWith(key);
    expect(match).toHaveBeenCalledOnce();
    await Promise.all(pending);
    expect(put).toHaveBeenCalledOnce();
  });

  it.each([
    "/avatars/custom.png",
    "/avatars/cosmos_avatar_astronaut_transparent.svg",
    "/avatars/uploads/user-123.png",
    "/avatars/cosmos_avatar_astronaut_transparent.png/other.png",
  ])("rejects unapproved avatar path %s before R2 access", async (path) => {
    const { env, get, head } = enabledEnv();
    const response = await dispatch(path, env);

    expect(response.status).toBe(404);
    expect(get).not.toHaveBeenCalled();
    expect(head).not.toHaveBeenCalled();
  });

  it("serves reviewed Passport Office artwork from the public prefix", async () => {
    const key = "passport-office/retro-spaceport-passport-bureau.png";
    const { env, get } = enabledEnv({ [key]: "animated-webp" });
    const response = await dispatch(`/${key}`, env);

    expect(response.status).toBe(200);
    expect(await response.text()).toBe("animated-webp");
    expect(response.headers.get("Content-Type")).toBe("image/png");
    expect(get).toHaveBeenCalledWith(key);
  });

  it("serves reviewed Grand Concourse artwork with the existing safe image policy", async () => {
    const key = "grand-concourse/cosmoport-grand-concourse.png";
    const { env, get } = enabledEnv({ [key]: "concourse-artwork" });
    const { match, put } = installCache();
    const { context, pending } = executionContext();
    const response = await dispatch(`/${key}`, env, undefined, context);

    expect(response.status).toBe(200);
    expect(await response.text()).toBe("concourse-artwork");
    expect(response.headers.get("Content-Type")).toBe("image/png");
    expect(response.headers.get("Cache-Control")).toContain("s-maxage=300");
    expect(get).toHaveBeenCalledWith(key);
    expect(match).toHaveBeenCalledOnce();
    await Promise.all(pending);
    expect(put).toHaveBeenCalledOnce();
  });

  it("serves the reviewed Grand Concourse radio track without image caching", async () => {
    const key = "sounds/grand-concourse/interplanetary-lounge.mp3";
    const { env, get } = enabledEnv({ [key]: "radio" });
    const { match, put } = installCache();
    const response = await dispatch(`/${key}`, env);

    expect(response.status).toBe(200);
    expect(await response.text()).toBe("radio");
    expect(response.headers.get("Content-Type")).toBe("audio/mpeg");
    expect(response.headers.get("Accept-Ranges")).toBe("bytes");
    expect(get).toHaveBeenCalledWith(key);
    expect(match).not.toHaveBeenCalled();
    expect(put).not.toHaveBeenCalled();
  });

  it("serves reviewed About artwork with safe WebP headers and image caching", async () => {
    const key = "about/01-midcentury-cartoon.webp";
    const { env, get } = enabledEnv({ [key]: "about-artwork" });
    const { match, put } = installCache();
    const { context, pending } = executionContext();

    const response = await dispatch(`/${key}`, env, undefined, context);

    expect(response.status).toBe(200);
    expect(await response.text()).toBe("about-artwork");
    expect(response.headers.get("Content-Type")).toBe("image/webp");
    expect(response.headers.get("Cache-Control")).toBe("public, max-age=300, s-maxage=300, must-revalidate");
    expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(get).toHaveBeenCalledWith(key);
    expect(match).toHaveBeenCalledOnce();
    await Promise.all(pending);
    expect(put).toHaveBeenCalledOnce();
  });

  it("caches full Passport Office artwork responses with the same safe image policy", async () => {
    const key = "passport-office/retro-spaceport-passport-bureau.png";
    const { env, get } = enabledEnv({ [key]: "artwork" });
    const { match, put } = installCache();
    const { context, pending } = executionContext();

    const response = await dispatch(`/${key}`, env, undefined, context);

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toContain("s-maxage=300");
    expect(match).toHaveBeenCalledOnce();
    expect(get).toHaveBeenCalledWith(key);
    await Promise.all(pending);
    expect(put).toHaveBeenCalledOnce();
  });

  it("uses metadata only for HEAD", async () => {
    const { match } = installCache();
    const { env, get, head } = enabledEnv({ "astro-pop/sound.mp3": "audio" });
    const response = await dispatch("/astro-pop/sound.mp3", env, { method: "HEAD" });

    expect(response.status).toBe(200);
    expect(response.body).toBeNull();
    expect(response.headers.get("Content-Type")).toBe("audio/mpeg");
    expect(head).toHaveBeenCalledWith("astro-pop/sound.mp3");
    expect(get).not.toHaveBeenCalled();
    expect(match).not.toHaveBeenCalled();
  });

  it.each(["/", "/astro-pop/../secret.mp4", "/astro-pop/%2e%2e/secret.mp4", "/astro-pop/%2Fsecret.mp4", "/astro-pop/%00.mp4", "/astro-pop/bad%zz.mp4"])("rejects unsafe path %s before R2 access", async (path) => {
    const { match } = installCache();
    const { env, get, head } = enabledEnv();
    const response = await dispatch(path, env);
    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.status).toBeLessThan(500);
    expect(get).not.toHaveBeenCalled();
    expect(head).not.toHaveBeenCalled();
    expect(match).not.toHaveBeenCalled();
  });

  it.each(["/outside/object.mp4", "/sounds/private.mp3", "/sounds/grand-concourse/private-map.svg", "/passport-office/briefing.pdf", "/about/unreviewed.svg", "/grand-concourse/private-map.svg", "/grand-concourse/../secret.png", "/astro-pop/script.js", "/astro-pop/document.html"])("hides unsupported path %s without R2 access", async (path) => {
    const { env, get, head } = enabledEnv();
    expect((await dispatch(path, env)).status).toBe(404);
    expect(get).not.toHaveBeenCalled();
    expect(head).not.toHaveBeenCalled();
  });

  it.each(["POST", "PUT", "PATCH", "DELETE"])("rejects %s requests", async (method) => {
    const { env } = enabledEnv();
    const response = await dispatch("/astro-pop/orange-cream.png", env, { method });
    expect(response.status).toBe(405);
    expect(response.headers.get("Allow")).toBe("GET, HEAD");
  });

  it("serves a single byte range through R2 ranged reads", async () => {
    const { match } = installCache();
    const { env, get, head } = enabledEnv({ "astro-pop/testimonials/walter.mp4": "0123456789" });
    const response = await dispatch("/astro-pop/testimonials/walter.mp4", env, { headers: { Range: "bytes=2-5" } });
    expect(response.status).toBe(206);
    expect(await response.text()).toBe("2345");
    expect(response.headers.get("Content-Range")).toBe("bytes 2-5/10");
    expect(response.headers.get("Content-Length")).toBe("4");
    expect(head).toHaveBeenCalledWith("astro-pop/testimonials/walter.mp4");
    expect(get).toHaveBeenCalledWith("astro-pop/testimonials/walter.mp4", { range: { offset: 2, length: 4 } });
    expect(match).not.toHaveBeenCalled();
  });

  it("bypasses the image cache for byte ranges", async () => {
    const { env, get, head } = enabledEnv({ "astro-pop/orange-cream.png": "0123456789" });
    const { match, put } = installCache();
    const response = await dispatch("/astro-pop/orange-cream.png", env, { headers: { Range: "bytes=2-5" } });

    expect(response.status).toBe(206);
    expect(await response.text()).toBe("2345");
    expect(head).toHaveBeenCalledWith("astro-pop/orange-cream.png");
    expect(get).toHaveBeenCalledWith("astro-pop/orange-cream.png", { range: { offset: 2, length: 4 } });
    expect(match).not.toHaveBeenCalled();
    expect(put).not.toHaveBeenCalled();
  });

  it.each([["bytes=7-", "789"], ["bytes=-3", "789"]])("supports %s ranges", async (range, expected) => {
    const { env } = enabledEnv({ "astro-pop/testimonials/walter.mp4": "0123456789" });
    const response = await dispatch("/astro-pop/testimonials/walter.mp4", env, { headers: { Range: range } });
    expect(response.status).toBe(206);
    expect(await response.text()).toBe(expected);
  });

  it.each(["bytes=10-", "bytes=4-2", "bytes=0-1,4-5", "items=0-1"])("rejects unsupported range %s", async (range) => {
    const { env, get } = enabledEnv({ "astro-pop/testimonials/walter.mp4": "0123456789" });
    const response = await dispatch("/astro-pop/testimonials/walter.mp4", env, { headers: { Range: range } });
    expect(response.status).toBe(416);
    expect(response.headers.get("Content-Range")).toBe("bytes */10");
    expect(get).not.toHaveBeenCalled();
  });

  it("hides R2 failures and never writes, deletes, or lists", async () => {
    const { put } = installCache();
    const { env, get, bucket } = enabledEnv({ "astro-pop/image.png": "image" });
    get.mockRejectedValueOnce(new Error("internal storage error"));
    const response = await dispatch("/astro-pop/image.png", env);

    expect(response.status).toBe(502);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(await response.text()).toBe("Media delivery failed");
    expect((bucket.put as ReturnType<typeof vi.fn>).mock.calls).toHaveLength(0);
    expect((bucket.delete as ReturnType<typeof vi.fn>).mock.calls).toHaveLength(0);
    expect((bucket.list as ReturnType<typeof vi.fn>).mock.calls).toHaveLength(0);
    expect(put).not.toHaveBeenCalled();
  });

  it("caches a full image GET and serves its canonical key without another R2 read", async () => {
    const { env, get } = enabledEnv({ "astro-pop/orange-cream.png": "image" });
    const cache = installCache();
    const firstContext = executionContext();
    const first = await dispatch("/astro-pop/orange-cream.png?campaign=launch", env, undefined, firstContext.context);

    expect(first.status).toBe(200);
    expect(await first.text()).toBe("image");
    expect(first.headers.get("Cache-Control")).toBe("public, max-age=300, s-maxage=300, must-revalidate");
    await Promise.all(firstContext.pending);

    const second = await dispatch("/astro-pop/orange-cream.png?utm_source=elsewhere", env);
    expect(second.status).toBe(200);
    expect(await second.text()).toBe("image");
    expect(get).toHaveBeenCalledTimes(1);
    expect(cache.match).toHaveBeenCalledTimes(2);
    expect(cache.put).toHaveBeenCalledTimes(1);
    expect(cache.match.mock.calls[0][0].url).toBe("https://media.cosmos-universe.com/astro-pop/orange-cream.png");
    expect(cache.match.mock.calls[1][0].url).toBe("https://media.cosmos-universe.com/astro-pop/orange-cream.png");
  });

  it("does not cache misses or failures", async () => {
    const missing = enabledEnv();
    const cache = installCache();
    expect((await dispatch("/astro-pop/missing.webp", missing.env)).status).toBe(404);
    expect(cache.put).not.toHaveBeenCalled();

    const failed = enabledEnv({ "astro-pop/broken.webp": "image" });
    failed.get.mockRejectedValueOnce(new Error("R2 unavailable"));
    expect((await dispatch("/astro-pop/broken.webp", failed.env)).status).toBe(502);
    expect(cache.put).not.toHaveBeenCalled();
  });

  it("falls back to R2 when image cache matching or writing fails", async () => {
    const { env, get } = enabledEnv({ "astro-pop/fallback.jpeg": "image" });
    const cache = installCache();
    cache.match.mockRejectedValueOnce(new Error("cache unavailable"));
    cache.put.mockRejectedValueOnce(new Error("cache write unavailable"));
    const context = executionContext();

    const response = await dispatch("/astro-pop/fallback.jpeg", env, undefined, context.context);
    expect(response.status).toBe(200);
    expect(await response.text()).toBe("image");
    await Promise.all(context.pending);
    expect(get).toHaveBeenCalledWith("astro-pop/fallback.jpeg");
  });
});
