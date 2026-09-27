const API_BASE = (import.meta.env.VITE_API_URL ?? "http://localhost:4000").replace(/\/$/, "");

export interface PincodeDeliveryResult {
  available: boolean;
  pincode: string;
  city: string;
  sameDay: boolean;
  nextDay: boolean;
  estimate: string;
}

export async function checkDeliveryPincode(pincode: string): Promise<PincodeDeliveryResult> {
  const response = await fetch(`${API_BASE}/api/pincode/${encodeURIComponent(pincode)}`);
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload?.message ?? "Could not check this PIN code.");
  }

  return payload as PincodeDeliveryResult;
}
