const bodyParser = require("body-parser");
const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const route = require("./routes/index");
const { connection } = require("./configuration/dbConfig");
const path = require("path");

dotenv.config();
const port = process.env.SERVER_PORT;


// Connect to the database
connection.connect((err) => {
  if (err) {
    console.log("Database Connection Failed !!!", err);
  } else {
    console.log("Connected to Database Successfully");
  }
});

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "DELETE", "PUT", "PATCH", "HEAD"],
    credentials: true,
  })
);

// // Lấy dữ liệu từ mục public để trả lên server (dùng cho changeAvatar)
// app.use('/public', express.static(path.join(__dirname, 'public')));

//Set up băng thông payload
app.use(bodyParser.json({ limit: "100mb", extended: true }));
app.use(
  bodyParser.urlencoded({
    limit: "100mb",
    extended: true,
    parameterLimit: 50000000,
  })
);
app.use(bodyParser.text({ limit: "100mb" }));

app.use(cookieParser());
app.use(express.json());
route(app);

app.listen(process.env.SERVER_PORT, console.log("Server is running on port: " + process.env.SERVER_PORT));
