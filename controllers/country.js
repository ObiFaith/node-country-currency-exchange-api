import axios from "axios";
import { StatusCodes } from "http-status-codes";
import { NotFoundError } from "../errors/index.js";
import { PrismaClient } from "../generated/prisma/client.js";

const prisma = new PrismaClient();

const sortFieldMap = {
  name: "name",
  region: "region",
  population: "population",
  currency: "currency_code",
  gdp: "estimated_gdp",
  exchange_rate: "exchange_rate",
  last_refreshed: "last_refreshed_at",
  capital: "capital",
};

const getRandomNumBtw1000To2000 = () =>
  Math.floor(Math.random() * (2000 - 1000 + 1)) + 1000;

const getNormalizedName = async (name) => name.toLowerCase().trim();

export const getCountries = async (req, res) => {
  let orderBy;
  const filters = {};

  const {
    name,
    sort,
    region,
    capital,
    currency,
    min_population,
    max_population,
  } = req.query;

  if (name) filters.name = { contains: name };
  if (region) filters.region = { equals: region };
  if (capital) filters.capital = { equals: capital };
  if (currency) filters.currency_code = { equals: currency };

  if (min_population || max_population) {
    filters.population = {};
    if (min_population) filters.population.gte = Number(min_population);
    if (max_population) filters.population.lte = Number(max_population);
  }

  if (sort) {
    const [field, direction] = sort.split("_");
    const sortField = sortFieldMap[field.toLowerCase()];
    orderBy = {
      [sortField]: direction === "desc" ? "desc" : "asc",
    };
  }

  const countries = await prisma.country.findMany({
    where: filters,
    orderBy,
  });

  res.status(StatusCodes.OK).json(countries);
};

export const RefreshCountries = async (req, res) => {
  try {
    const [countryRes, rateRes] = await Promise.all([
      axios.get(process.env.REST_COUNTRY_URL),
      axios.get(process.env.COUNTRY_RATE_URL),
    ]);

    const countryData = countryRes.data;
    const exchangeRates = rateRes.data.rates;
    const last_refreshed_at = new Date().toISOString();

    const countries = countryData.map(async (country) => {
      const population = country.population;
      const currency_code = country.currencies?.[0]?.code || null;
      const normalized_name = await getNormalizedName(country.name);

      let estimated_gdp = 0;
      let exchange_rate = null;

      if (currency_code) {
        exchange_rate = exchangeRates[currency_code];
        if (exchange_rate)
          estimated_gdp =
            (population * getRandomNumBtw1000To2000()) / exchange_rate;
        else estimated_gdp = null;
      }

      return {
        name: country.name,
        normalized_name,
        capital: country.capital,
        region: country.region,
        population,
        currency_code,
        exchange_rate,
        estimated_gdp,
        flag_url: country.flag,
        last_refreshed_at,
      };
    });

    await prisma.country.deleteMany({});
    await prisma.country.createMany({ data: countries });

    res
      .status(StatusCodes.CREATED)
      .json({ message: "Countries refreshed successfully." });
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Failed to refresh countries." });
  }
};

export const getCountry = async (req, res) => {
  const normalized_name = await getNormalizedName(req.params.name);
  const country = await prisma.country.findUnique({
    where: { normalized_name },
  });

  if (!country) throw new NotFoundError("Country not found!");

  res.status(StatusCodes.OK).json(country);
};

export const deleteCountry = async (req, res) => {
  const normalized_name = await getNormalizedName(req.params.name);
  const country = await prisma.country.delete({ where: { normalized_name } });

  if (!country) throw new NotFoundError("Country not found!");

  res.status(StatusCodes.NO_CONTENT).send();
};

await prisma.$disconnect();
