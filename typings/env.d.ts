declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
      email: string;
      PORT?: number;
      redirect_url: string;
      client_id: string;
      client_secret: string;
      secret?: string;
      NODE_ENV: "production" | "dev" | "development";
    }
  }
}

export {};
