// Used class file to determine what packages were needed
// and how to use them within the file
const express = require("express");
const app = express();
const joi = require("joi");
const multer = require("multer");
app.use(express.static("public"));
app.use(express.json());
const cors = require("cors");
app.use(cors());
const mongoose = require("mongoose");
const upload = multer({ dest: __dirname + "/public/images" });

app.listen(3000, () => {
  console.log("Listening");
});

/*mongoose
  .connect(
    "mongodb+srv://ryanmalone192:KAFVLG0JaapFgWhK@cluster0.j3hawrv.mongodb.net/?retryWrites=true&w=majority/cities"
  )
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.log("Couldn't connect to MongoDB", error);
  });*/

mongoose
  .connect("mongodb://localhost/cities")
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.log("Couldn't connect to MongoDB", error);
  });

const citySchema = new mongoose.Schema({
  /*_id: mongoose.SchemaTypes.ObjectId,*/
  name: String,
  country: String,
  population: Number,
  prominentLanguage: String,
  landmarks: [String],
  funFact: String,
});

const City = mongoose.model("City", citySchema);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.post("/api/cities", upload.single("img"), (req, res) => {
  const result = validateCity(req.body);

  if (result.error) {
    res.status(400).send(result.error.details[0].message);
    return;
  }

  const city = new City({
    name: req.body.name,
    country: req.body.country,
    population: req.body.population,
    prominentLanguage: req.body.prominentLanguage,
    landmarks: req.body.landmarks.split(","),
    funFact: req.body.funFact,
  });

  createCity(res, city);
});

const createCity = async (res, city) => {
  const result = await city.save();
  res.send(city);
};

app.put("/api/cities/:id", upload.single("img"), (req, res) => {
  const result = validateCity(req.body);
  if (result.error) {
    res.status(400).send(result.error.details[0].message);
    return;
  }
  updateCity(req, res);
});

const updateCity = async (req, res) => {
  let fields = {
    name: req.body.name,
    country: req.body.country,
    population: req.body.population,
    prominentLanguage: req.body.prominentLanguage,
    landmarks: req.body.landmarks.split(","),
    funFact: req.body.funFact,
  };

  const result = await City.updateOne({ _id: req.params.id }, fields);
  res.send(result);
};

app.delete("/api/cities/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const city = cities.find((cityCheck) => cityCheck._id === id);

  if (!city) {
    res.status(404).send("The city not found");
  }
  const index = cities.indexOf(city);
  cities.splice(index, 1);
  res.send(city);
});

const validateCity = (city) => {
  const citySchema = joi.object({
    _id: joi.allow(""),
    name: joi.string().min(4).required(),
    country: joi.string().min(2).required(),
    population: joi.number().min(1).required(),
    prominentLanguage: joi.string().min(4).required(),
    landmarks: joi.string().min(4).required(),
    funFact: joi.string().required(),
  });

  return citySchema.validate(city);
};

app.get("/api/cities", (req, res) => {
  getCities(res);
});

const getCities = async (res) => {
  const cities = await City.find();
  res.send(cities);
};

app.get("/api/cities/:id", (req, res) => {
  getCity(res, req.params.id);
});

const getCity = async (res, id) => {
  const city = await City.findOne({ _id: id });
  res.send(city);
};
