// Mock data store — module-level (demo session state)
export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: "credit" | "debit";
  balance: number;
  category: string;
}

export interface CustomerAccount {
  accountNumber: string;
  iban: string;
  balance: number;
  currency: string;
  accountType: string;
  status: string;
  openedDate: string;
  customer: {
    name: string;
    nameAr: string;
    idNumber: string;
    nationality: string;
    dob: string;
    gender: string;
    phone: string;
    email: string;
    address: string;
  };
  transactions: Transaction[];
  recommendations: { title: string; titleAr: string; desc: string; rate: string; icon: string }[];
}

export const MOCK_ACCOUNT: CustomerAccount = {
  accountNumber: "AE07 0331 2345 6789 0123 456",
  iban: "AE070331234567890123456",
  balance: 47250.0,
  currency: "AED",
  accountType: "Current Account",
  status: "Active",
  openedDate: new Date().toLocaleDateString("en-AE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }),
  customer: {
    name: "Mohammed Al Hosani",
    nameAr: "محمد الحوسني",
    idNumber: "784-1985-1234567-1",
    nationality: "United Arab Emirates",
    dob: "15/03/1985",
    gender: "Male",
    phone: "+971 50 123 4567",
    email: "m.alhosani@email.ae",
    address: "Al Khalidiyah, Abu Dhabi, UAE",
  },
  transactions: [
    {
      id: "t1",
      date: "01 Apr 2026",
      description: "Salary Credit — Emirates Group",
      amount: 15000,
      type: "credit",
      balance: 47250,
      category: "Income",
    },
    {
      id: "t2",
      date: "30 Mar 2026",
      description: "DEWA — Utility Payment",
      amount: -450,
      type: "debit",
      balance: 32250,
      category: "Utilities",
    },
    {
      id: "t3",
      date: "29 Mar 2026",
      description: "Careem — Transport",
      amount: -35,
      type: "debit",
      balance: 32700,
      category: "Transport",
    },
    {
      id: "t4",
      date: "28 Mar 2026",
      description: "Noon — Online Shopping",
      amount: -1200,
      type: "debit",
      balance: 32735,
      category: "Shopping",
    },
    {
      id: "t5",
      date: "25 Mar 2026",
      description: "ATM Withdrawal — Burjuman",
      amount: -2000,
      type: "debit",
      balance: 33935,
      category: "Cash",
    },
    {
      id: "t6",
      date: "22 Mar 2026",
      description: "Transfer from Ahmad Hassan",
      amount: 5000,
      type: "credit",
      balance: 35935,
      category: "Transfer",
    },
  ],
  recommendations: [
    {
      title: "Al Masraf Savings Account",
      titleAr: "حساب التوفير",
      desc: "Grow your savings with competitive returns",
      rate: "3.5% p.a.",
      icon: "💰",
    },
    {
      title: "Platinum Credit Card",
      titleAr: "بطاقة الائتمان البلاتينية",
      desc: "Exclusive rewards & travel benefits",
      rate: "Up to 5% cashback",
      icon: "💳",
    },
    {
      title: "Personal Finance",
      titleAr: "التمويل الشخصي",
      desc: "Quick approval up to AED 500,000",
      rate: "From 3.49% p.a.",
      icon: "🏦",
    },
  ],
};

// Session store — used to pass created account data to WhatsApp bot
let _sessionAccount: CustomerAccount | null = null;
let _sessionPhone: string | null = null;

export function setSessionAccount(account: CustomerAccount, phone: string) {
  _sessionAccount = account;
  _sessionPhone = phone;
}
export function getSessionAccount(): CustomerAccount | null {
  return _sessionAccount || MOCK_ACCOUNT;
}
export function getSessionPhone(): string | null {
  return _sessionPhone;
}
