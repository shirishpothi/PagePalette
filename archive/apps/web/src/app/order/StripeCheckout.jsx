import { loadStripe } from "@stripe/stripe-js";
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";

// Initialize Stripe (use your publishable key from environment)
const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 
  'pk_live_51SZpys0z7bZoqy7rQVhDQRdkd96XSYr5Yvqh7oWGYEhQiPLWZqV6wQTWLYHwQcvJKpLZrR4MuQEAqf88pW2aS9LM00dGwKCTZj'
);

export default function StripeCheckout({ fetchClientSecret }) {
  return (
    <EmbeddedCheckoutProvider
      stripe={stripePromise}
      options={{ fetchClientSecret }}
    >
      <EmbeddedCheckout />
    </EmbeddedCheckoutProvider>
  );
}
