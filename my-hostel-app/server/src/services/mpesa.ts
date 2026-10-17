import axios from 'axios';
import qs from 'qs';
import prisma from '../prisma/client';
import { addPayment } from '../data/mockData';

const SANDBOX_OAUTH = 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';
const SANDBOX_STK = 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';

let tokenCache: { token?: string; expiresAt?: number } = {};

export async function getOAuthToken() {
  // Use cached token when valid
  if (tokenCache.token && tokenCache.expiresAt && Date.now() < tokenCache.expiresAt) {
    return tokenCache.token;
  }

  const key = process.env.MPESA_CONSUMER_KEY;
  const secret = process.env.MPESA_CONSUMER_SECRET;
  if (!key || !secret) return undefined;

  const basic = Buffer.from(`${key}:${secret}`).toString('base64');
  const res = await axios.get(SANDBOX_OAUTH, { headers: { Authorization: `Basic ${basic}` } });
  const token = res.data.access_token as string;
  const expiresIn = res.data.expires_in || 3600;
  tokenCache = { token, expiresAt: Date.now() + (expiresIn - 30) * 1000 };
  return token;
}

function makePassword(shortCode: string, passkey: string, timestamp: string) {
  return Buffer.from(shortCode + passkey + timestamp).toString('base64');
}

export async function stkPush({ tenantId, amount, phoneNumber }: { tenantId: number; amount: number; phoneNumber?: string }) {
  const key = process.env.MPESA_CONSUMER_KEY;
  const secret = process.env.MPESA_CONSUMER_SECRET;
  const shortCode = process.env.MPESA_SHORTCODE;
  const passkey = process.env.MPESA_PASSKEY;

  if (!key || !secret || !shortCode || !passkey) {
    // Sandbox not configured — simulate response
    const checkoutRequestID = `SIM_${Date.now()}`;
    return { simulated: true, checkoutRequestID };
  }

  const token = await getOAuthToken();
  if (!token) return { error: 'oauth_failed' };

  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
  const password = makePassword(shortCode, passkey, timestamp);

  const payload = {
    BusinessShortCode: shortCode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: amount,
    PartyA: phoneNumber || shortCode,
    PartyB: shortCode,
    PhoneNumber: phoneNumber || shortCode,
    CallBackURL: process.env.MPESA_CALLBACK_URL || 'http://localhost:4000/api/mpesa/callback',
    AccountReference: `Hostel-${tenantId}`,
    TransactionDesc: `Rent payment for tenant ${tenantId}`,
  };

  const res = await axios.post(SANDBOX_STK, payload, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
}

export async function handleDarajaCallback(payload: any) {
  try {
    // Daraja wraps callback in body.Body.StkCallback
    const stk = payload?.Body?.StkCallback || payload;
    const resultCode = stk?.ResultCode;
    if (resultCode !== 0) return { status: 'failed', detail: stk?.ResultDesc };

    // Find amount and phone from CallbackMetadata
    const items = stk?.CallbackMetadata?.Item || [];
    let amount = 0;
    let mpesaReceipt = '';
    let phone = '';
    items.forEach((it: any) => {
      if (it.Name === 'Amount') amount = Number(it.Value);
      if (it.Name === 'MpesaReceiptNumber') mpesaReceipt = it.Value;
      if (it.Name === 'PhoneNumber') phone = String(it.Value);
    });

    // Try to find tenant by phone (normalize to 254...) or use AccountReference
    let tenantId: number | undefined;
    if (phone) {
      // Normalize phone
      const normalized = phone.startsWith('0') ? `254${phone.slice(1)}` : phone.startsWith('7') ? `254${phone}` : phone;
      // Attempt DB lookup
      try {
        if (process.env.DATABASE_URL) {
          const t = await prisma.tenant.findFirst({ where: { phoneNumber: normalized } });
          if (t) tenantId = t.id;
        }
      } catch (e) {
        // ignore DB lookup errors
      }
    }

    // fallback: check if AccountReference holds tenant id
    const acctRef = stk?.AccountReference || payload?.AccountReference || payload?.Body?.AccountReference;
    if (!tenantId && acctRef) {
      const m = String(acctRef).match(/(\d+)/);
      if (m) tenantId = Number(m[1]);
    }

    if (!tenantId) {
      // couldn't map to tenant — record generic or return
      return { status: 'no_tenant', phone, amount };
    }

    // Save payment to DB if available, else to mock
    if (process.env.DATABASE_URL) {
      try {
        const p = await prisma.payment.create({ data: { tenantId, amount, mpesaReceipt, rawPayload: payload } });
        // Update or create ledger
        await prisma.ledger.upsert({
          where: { tenantId },
          update: { currentBalance: { decrement: amount }, totalBilled: { increment: 0 } },
          create: { tenantId, totalBilled: 0, currentBalance: -amount },
        });
        return { status: 'ok', payment: p };
      } catch (e) {
        // fallback
        const p = addPayment({ tenantId, amount, mpesaReceipt });
        return { status: 'ok_mock', payment: p };
      }
    } else {
      const p = addPayment({ tenantId, amount, mpesaReceipt });
      return { status: 'ok_mock', payment: p };
    }
  } catch (err) {
    return { status: 'error', error: String(err) };
  }
}
