import Stripe from "stripe";

export async function POST(req: Request) {
  const { artistSlug } = await req.json();

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey || secretKey.includes("placeholder")) {
    return Response.json(
      { error: "Stripe not configured. Add STRIPE_SECRET_KEY to .env.local." },
      { status: 503 }
    );
  }

  const stripe = new Stripe(secretKey);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "Tattoo Appointment Deposit",
            description:
              "Deposit to secure your appointment with Miguel Rodriguez. Applied to the final tattoo cost.",
          },
          unit_amount: 10000, // $100.00
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${baseUrl}/${artistSlug}?payment=success`,
    cancel_url: `${baseUrl}/${artistSlug}?payment=canceled`,
  });

  return Response.json({ url: session.url });
}
