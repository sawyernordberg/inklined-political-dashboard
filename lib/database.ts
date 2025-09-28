// Database schema and utilities for supporter management
export interface Supporter {
  id: string;
  email: string;
  name: string;
  amount: number;
  currency: string;
  stripe_customer_id: string;
  stripe_payment_intent_id: string;
  created_at: Date;
  email_sent: boolean;
  email_sent_at?: Date;
}

// For now, we'll use a simple JSON file-based database
// In production, you'd want to use a proper database like PostgreSQL, MongoDB, or Supabase
import fs from 'fs';
import path from 'path';

const DB_FILE = path.join(process.cwd(), 'data', 'supporters.json');

export class SupporterDatabase {
  private static ensureDbFile() {
    const dbDir = path.dirname(DB_FILE);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2));
    }
  }

  static async addSupporter(supporter: Omit<Supporter, 'id' | 'created_at' | 'email_sent'>): Promise<Supporter> {
    this.ensureDbFile();
    
    const supporters = this.getAllSupporters();
    const newSupporter: Supporter = {
      ...supporter,
      id: `supporter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date(),
      email_sent: false
    };
    
    supporters.push(newSupporter);
    fs.writeFileSync(DB_FILE, JSON.stringify(supporters, null, 2));
    
    return newSupporter;
  }

  static getAllSupporters(): Supporter[] {
    this.ensureDbFile();
    
    try {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      return JSON.parse(data).map((s: Record<string, unknown>) => ({
        ...s,
        created_at: new Date(s.created_at as string)
      })) as Supporter[];
    } catch (error) {
      console.error('Error reading supporters database:', error);
      return [];
    }
  }

  static async markEmailSent(supporterId: string): Promise<void> {
    this.ensureDbFile();
    
    const supporters = this.getAllSupporters();
    const supporter = supporters.find(s => s.id === supporterId);
    
    if (supporter) {
      supporter.email_sent = true;
      supporter.email_sent_at = new Date();
      fs.writeFileSync(DB_FILE, JSON.stringify(supporters, null, 2));
    }
  }

  static getSupporterByStripeCustomerId(customerId: string): Supporter | null {
    const supporters = this.getAllSupporters();
    return supporters.find(s => s.stripe_customer_id === customerId) || null;
  }
}
