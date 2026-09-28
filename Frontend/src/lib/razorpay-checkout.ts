const RAZORPAY_CHECKOUT_URL = "https://checkout.razorpay.com/v1/checkout.js";

export interface RazorpayCheckoutResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayCheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: { name: string; email: string; contact: string };
  theme: { color: string };
  handler: (response: RazorpayCheckoutResponse) => void;
  modal: { ondismiss: () => void; confirm_close: boolean; escape: boolean };
}

interface RazorpayCheckoutInstance {
  open: () => void;
  close: () => void;
  on: (event: "payment.failed", callback: (response: { error?: { description?: string } }) => void) => void;
}

interface RazorpayConstructor {
  new (options: RazorpayCheckoutOptions): RazorpayCheckoutInstance;
}

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

let scriptPromise: Promise<void> | null = null;

async function loadRazorpayCheckout() {
  if (window.Razorpay) return;
  if (!scriptPromise) {
    scriptPromise = new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = RAZORPAY_CHECKOUT_URL;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => {
        script.remove();
        scriptPromise = null;
        reject(new Error("Razorpay Checkout could not load. Check your connection and try again."));
      };
      document.head.appendChild(script);
    });
  }
  await scriptPromise;
  if (!window.Razorpay) throw new Error("Razorpay Checkout is unavailable. Please try again.");
}

export async function openRazorpayCheckout(options: RazorpayCheckoutOptions) {
  await loadRazorpayCheckout();

  return new Promise<RazorpayCheckoutResponse>((resolve, reject) => {
    let settled = false;
    const finish = (callback: () => void) => {
      if (settled) return false;
      settled = true;
      callback();
      return true;
    };

    const checkout = new window.Razorpay!({
      ...options,
      handler: (response) => finish(() => resolve(response)),
      modal: {
        ...options.modal,
        ondismiss: () => finish(() => reject(new Error("Payment was cancelled. Your cart is unchanged."))),
      },
    });
    checkout.on("payment.failed", (response) => {
      const message = response.error?.description;
      if (finish(() => reject(new Error(message || "Razorpay could not complete the payment. Please try again.")))) {
        checkout.close();
      }
    });

    checkout.open();
  });
}
