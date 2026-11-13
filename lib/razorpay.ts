import { api } from "./api";
import { User } from "@/types";

declare global {
  interface Window {
    Razorpay: any;
  }
}

/**
 * Dynamically loads the official Razorpay Checkout SDK script
 */
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (window.Razorpay) return resolve(true);

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

interface InitiatePaymentOptions {
  plan: "monthly" | "yearly";
  user: User;
  onSuccess: (updatedUser: User) => void;
  onError: (errorMessage: string) => void;
}

/**
 * Initiates the complete Razorpay checkout flow (UPI, Debit/Credit Cards, Netbanking)
 */
export const initiateRazorpayPayment = async ({
  plan,
  user,
  onSuccess,
  onError,
}: InitiatePaymentOptions) => {
  try {
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      onError("Razorpay payment gateway failed to load. Please check your internet connection.");
      return;
    }

    // 1. Create order on backend
    const orderRes = await api.post("/payment/create-order", { plan });
    const { orderId, amount, currency, keyId, label } = orderRes.data;

    // 2. Configure Razorpay Standard Checkout modal
    const options = {
      key: keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_TzlAXGhZ73pPvm",
      amount: amount,
      currency: currency || "INR",
      name: "ResumeAI Pro",
      description: label || `${plan === "yearly" ? "Annual" : "Monthly"} Unlimited AI ATS Membership`,
      image: "https://cdn-icons-png.flaticon.com/512/4712/4712109.png",
      order_id: orderId,
      prefill: {
        name: user.name || "",
        email: user.email || "",
      },
      theme: {
        color: "#4f46e5", // Indigo theme
      },
      modal: {
        ondismiss: () => {
          console.log("[Razorpay] Checkout window closed by user.");
        },
      },
      handler: async (response: {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
      }) => {
        try {
          // 3. Cryptographically verify signature on backend
          const verifyRes = await api.post("/payment/verify", {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            plan,
          });

          if (verifyRes.data?.success && verifyRes.data?.user) {
            onSuccess(verifyRes.data.user);
          } else {
            onError("Payment verification failed. Please contact support.");
          }
        } catch (verifyErr: any) {
          console.error("Payment verification request failed:", verifyErr);
          onError(verifyErr.response?.data?.error || "Could not verify payment with server.");
        }
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.on("payment.failed", (failedRes: any) => {
      console.error("[Razorpay] Payment failed:", failedRes.error);
      onError(failedRes.error?.description || "Payment was declined or cancelled.");
    });
    razorpay.open();
  } catch (err: any) {
    console.error("Razorpay initiation error:", err);
    onError(err.response?.data?.error || "Failed to initialize payment order.");
  }
};
