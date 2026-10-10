declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    BUCKET?: R2Bucket;
    ADMIN_EMAIL?: string;
    INQUIRY_RATE_LIMIT_SECRET?: string;
  }
}
