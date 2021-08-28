const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const fs = require("fs-extra");
require("dotenv").config();

const { MongoClient } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.o8cqw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const app = express();
const port = 4000;

app.use(bodyParser.json());
app.use(cors());
app.use(express.static("doctors"));
app.use(fileUpload());

app.get("/", (req, res) => {
  res.send("Hello My World!");
});

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  const appointmentCollection = client.db("doctorPortal").collection("doctor");
  const doctorImageCollection = client
    .db("doctorPortal")
    .collection("doctorImage");
  // perform actions on the collection object

  app.post("/addAppointment", (req, res) => {
    const appointment = req.body;
    appointmentCollection.insertOne(appointment).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.post("/appointmentByDate", (req, res) => {
    const date = req.body.date;
    appointmentCollection.find({ date }).toArray((err, appointments) => {
      res.send(appointments);
    });
  });

  app.get("/appointments", (req, res) => {
    appointmentCollection.find().toArray((err, appointments) => {
      res.send(appointments);
    });
  });

  app.post("/addDoctor", (req, res) => {
    const file = req.files.file;
    const name = req.body.name;
    const email = req.body.email;

    const newImg = file.data;
    const encImg = newImg.toString("base64");

    var image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, "base64"),
    };
    doctorImageCollection.insertOne({ name, email, image }).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });
  app.get("/doctors", (req, res) => {
    doctorImageCollection.find().toArray((err, documents) => {
      res.send(documents);
    });
  });
});

app.listen(process.env.PORT || port);
