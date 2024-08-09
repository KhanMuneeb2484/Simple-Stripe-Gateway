require("dotenv").config();
const express = require("express");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const app = express();
const port = process.env.PORT;

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.post("/checkout", async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "Node.js and Express book",
          },
          unit_amount: 25 * 100,
        },
        quantity: 1,
      },
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "JavaScript book",
          },
          unit_amount: 50 * 100,
        },
        quantity: 5,
      },
    ],
    mode: "payment",
    shipping_address_collection: {
      allowed_countries: ["US", "CA", "PK"],
    },
    success_url: `${process.env.BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.BASE_URL}/cancel`,
  });
  res.redirect(session.url);
});

app.get("/success", async (req, res) => {
  const result = Promise.all([
    stripe.checkout.sessions.retrieve(req.query.session_id, {
      expand: ["payment_intent.payment_method"],
    }),
    await stripe.checkout.sessions.listLineItems(req.query.session_id),
  ]);

  console.log(JSON.stringify(await result));

  res.send("Payment successful");
});

app.get("/cancel", (req, res) => {
  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
