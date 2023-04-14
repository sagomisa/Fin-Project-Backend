require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const userRoute = require("./routes/userRoute");
const loanRoute = require("./routes/loanRoute");
const eventRoute = require("./routes/eventRoute");
const constantRoute = require("./routes/constantRoute");
const depositRoute = require("./routes/depositRoute");
const errorHandler = require("./middleware/errorMiddleware");

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser.json());

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://fininvestmentsinc.vercel.app",
      "https://www.fininvestmentsinc.com",
    ],
    credentials: true,
  })
);

// Routes
app.use("/api/users", userRoute);
app.use("/api/loans", loanRoute);
app.use("/api/events", eventRoute);
app.use("/api/constants", constantRoute);
app.use("/api/deposits", depositRoute);

app.get("/", (req, res) => {
  res.send("Home Page");
});

// Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 8001;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on ${PORT}`);
    });
  })
  .catch((err) => console.log(err));

//s0vwcp2plmxbLwHL
