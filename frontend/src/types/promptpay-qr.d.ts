declare module "promptpay-qr" {
  export default function generatePayload(target: string | number, opts?: { amount?: number }): string;
}

