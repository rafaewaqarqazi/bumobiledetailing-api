export interface Config {
  port: number;

  // URL
  baseURL: string;
  frontendURL: string;

  // db
  dbHost: string;
  dbPort: number;
  dbName: string;
  dbUser: string;
  dbPassword: string;

  // EmailAuth
  smtpService: string;
  smtpEmail: string;
  smtpLoginEmail: string;
  smtpPassword: string;

  secret: string;
  hashSaltRounds: number;
  syncDb: boolean;

  // SPACE
  spacesKey: string;
  spacesSecret: string;
  bucket: string;
  DEV: boolean;
}
const config: Config = {
  port: +(process.env.PORT || 4005),

  // URL
  baseURL: process.env.BASE_URL,
  frontendURL: process.env.FRONTEND_URL,

  // db
  dbHost: process.env.DB_HOST,
  dbPort: +(process.env.DB_PORT || 3306),
  dbName: process.env.DB_NAME,
  dbUser: process.env.DB_USER,
  dbPassword: process.env.DB_PASSWORD,

  // EmailAuth
  smtpService: process.env.SMTP_SERVICE,
  smtpEmail: process.env.SMTP_EMAIL,
  smtpLoginEmail: process.env.SMTP_LOGIN_EMAIL,
  smtpPassword: process.env.SMTP_PASS,

  secret: process.env.SECRET,
  hashSaltRounds: +process.env.HASH_SALT_ROUNDS,
  syncDb: Boolean(process.env.SYNC_DB),

  // SPACES
  spacesKey: process.env.SPACES_KEY,
  spacesSecret: process.env.SPACES_SECRET,
  bucket: process.env.SPACES_BUCKET,
  DEV: process.env.NODE_ENV === 'development',
};

export { config };
