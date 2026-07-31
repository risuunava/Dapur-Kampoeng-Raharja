import { google } from 'googleapis';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const rawPrivateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY || '';
const privateKey = rawPrivateKey
  .replace(/\\n/g, '\n') // Convert literal \n to actual newlines
  .replace(/^"|"$/g, '') // Remove surrounding quotes if accidentally pasted with quotes
  .trim();

const auth = new google.auth.JWT(
  process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
  undefined,
  privateKey,
  ['https://www.googleapis.com/auth/spreadsheets']
);

export const sheets = google.sheets({ version: 'v4', auth });
export const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID || '';
