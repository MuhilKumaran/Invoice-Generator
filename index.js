const express = require("express");
const path = require("path");
const puppeteer = require("puppeteer");
const bodyParser = require("body-parser");
const app = express();

// Set EJS as templating engine

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Serve static files (for images)
app.use(express.static(path.join(__dirname, "public")));

// Middleware to parse JSON and urlencoded data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Route to render HTML with dynamic data from req.body
app.post("/bill", (req, res) => {
  const { customer, items } = req.body;
  const subTotalA = 6736.0 || 0; // Replace with actual calculation or default to 0
  const discount = 3368.0 || 0; // Replace with actual calculation or default to 0
  const subTotalB = subTotalA - discount || 0;
  const nonDiscountedItems = 418.0 || 0; // Replace with actual calculation or default to 0
  const grandTotal = subTotalB + nonDiscountedItems || 0;

  const billData = {
    billNo: "A0012",
    customer,
    items,
    subTotalA: subTotalA || 0,
    discount: discount || 0,
    subTotalB: subTotalB || 0,
    nonDiscountedItems: nonDiscountedItems || 0,
    grandTotal: grandTotal || 0,
  };

  res.render("bill", { bill: billData });
});

// Route to generate PDF with dynamic data from req.body
app.post("/generate-pdf", async (req, res) => {
  const { customer, items } = req.body;
  const billData = {
    billNo: "A0012", // You can also make this dynamic
    customer,
    items,
  };

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(await renderTemplate("bill", { bill: billData }), {
    waitUntil: "networkidle2",
  });

  const pdf = await page.pdf({ format: "A4" });
  await browser.close();

  res.contentType("application/pdf");
  res.send(pdf);
});

// Function to render the EJS template to string
const renderTemplate = (view, data) => {
  return new Promise((resolve, reject) => {
    app.render(view, data, (err, html) => {
      if (err) return reject(err);
      resolve(html);
    });
  });
};

const PORT = 8001;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
