import axios from "axios";
import { StatusCodes } from "http-status-codes";
import { PrismaClient } from "../generated/prisma/client.js";

const prisma = new PrismaClient({
  omit: {
    country: {
      normalized_name: true,
    },
  },
});

/* 
[
    {
        "id": 1,
        "name": "Nigeria",
        "capital": "Abuja",
        "region": "Africa",
        "population": 206139589,
        "currency_code": "NGN",
        "exchange_rate": 1600.23,
        "estimated_gdp": 25767448125.2, // estimated_gdp = population × random(1000–2000) ÷ exchange_rate
        "flag_url": "https://flagcdn.com/ng.svg",
        "last_refreshed_at": "2025-10-22T18:00:00Z"
    }
]


    const contryCodes = countryData.map(
      (country) => country.currencies[0].code
    );
*/

const getRandomNumBtw1000To2000 = () =>
  Math.floor(Math.random() * (2000 - 1000 + 1)) + 1000;

export const getCountries = async (req, res) => {
  const countries = await prisma.country.findMany();
  res.status(StatusCodes.OK).json({ countries });
};

export const RefreshCountries = async (req, res) => {
  try {
    const { data: countryData } = await axios.get(process.env.REST_COUNTRY_URL);
    console.log("Country Data Fetched!");

    const {
      data: { rates: exchangeRates },
    } = await axios.get(process.env.COUNTRY_RATE_URL);

    const countries = countryData.map((country) => {
      const population = country.population;
      const currency_code = country.currencies?.[0]?.code || null;

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
        capital: country.capital,
        region: country.region,
        population,
        currency_code,
        exchange_rate,
        estimated_gdp,
        flag_url: country.flag,
      };
    });

    const data = await Promise.all(
      countries.map(async (country) => {
        const normalized_name = country.name.toLowerCase().trim();

        await prisma.country.upsert({
          where: { normalized_name },
          update: { ...country, last_refreshed_at: new Date().toISOString() },
          create: {
            ...country,
            normalized_name,
            last_refreshed_at: new Date().toISOString(),
          },
        });
      })
    );

    console.log(data[data.length - 1]);

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
