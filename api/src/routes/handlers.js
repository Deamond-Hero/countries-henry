const { Router } = require("express");
const { loadCountries, getCountriesByID } = require("./controllers");
const { Country, Activity } = require("../db.js");
const axios = require("axios");
const { Op } = require("sequelize");

//////////////////////////////////////////////////////////////////
// Carga de paises a db

const countriesDb = async (req, res) => {
  try {
    const countries = await loadCountries();
    res.status(200).json("Loaded countries");
  } catch {
    res.status(400).send("There was a problem");
  }
};

//////////////////////////////////////////////////////////////////
// FILTRADO POR NOMBRE Y TRAE TODOS LOS PAISES

const getCountries = async (req, res) => {
  const name = req.query.name;
  if (name) {
    const searchCountry = await Country.findAll({
      attributes: [
        "id",
        "name",
        "imageFlag",
        "continent",
        "capital",
        "subRegion",
        "area",
        "population",
      ],
      where: {
        name: {
          [Op.iLike]: `%${name}%`,
        },
      },
    });
    searchCountry.length
      ? res.status(200).send(searchCountry)
      : res.status(404).send("No results found");
  } else {
    const allCountries = await Country.findAll();
    allCountries.length
      ? res.status(200).send(allCountries)
      : res
          .status(404)
          .send("Ups! Something went wrong, refresh the page and try again");
  }
};

//////////////////////////////////////////////////////////////////
// FILTRADO POR ID

const filterCountriesByID = async (req, res) => {
  const id = req.params.id;
  //buscar id entre los elementos
  if (await getCountriesByID(id))
    res.status(200).send(await getCountriesByID(id));
  else {
    res.status(400).send(`no country found with id : ${id}`);
  }
};

//////////////////////////////////////////////////////////////////
// FILTRADO POR ACTIVIDADES

const getActivities = async (req, res) => {
  const activities = await Activity.findAll();
  try {
    activities.length;
    res.status(200).send(activities);
  } catch {
    res.status(400).send("No exist activities");
  }
};

//////////////////////////////////////////////////////////////////
// CREACIÓN DE ACTIVIDADES

const createActivities = async (req,res) => {
  const {countries, name, dificulty, duration, season } = req.body;
  if (!name || !dificulty || !countries || !season)
    res.status(404).send("Fill required fields.");
  // console.log(countries);
  // console.log(dificulty);
  // console.log(duration);
  // console.log(season);
  // console.log(name);

    const newActivity = await Activity.create({
      name,
      dificulty,
      duration,
      season,
    });
    // console.log(newActivity);
    // console.log(countries);

    Promise.all(countries.map(async (c) => {
      await newActivity.setCountries(await Country.findByPk(c))

      res.json(newActivity);

    }));



};

module.exports = {
  countriesDb,
  getCountries,
  createActivities,
  getActivities,
  filterCountriesByID,
};
