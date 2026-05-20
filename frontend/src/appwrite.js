import { Client, Account, Databases, Storage, ID, Query } from 'appwrite';

const client = new Client()
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)  // e.g. https://cloud.appwrite.io/v1
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

export const account  = new Account(client);
export const databases = new Databases(client);
export const storage  = new Storage(client);
export { ID, Query, client };

// Collection & Bucket IDs (set these in your .env)
export const DB_ID        = import.meta.env.VITE_APPWRITE_DB_ID;
export const USERS_COL    = import.meta.env.VITE_APPWRITE_USERS_COL;
export const RESUMES_COL  = import.meta.env.VITE_APPWRITE_RESUMES_COL;
export const BUCKET_ID    = import.meta.env.VITE_APPWRITE_BUCKET_ID;
