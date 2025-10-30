import express from "express";
import {
  getCountry,
  getCountries,
  deleteCountry,
  RefreshCountries,
  getCountryStatus,
  getSummaryImage,
} from "../controllers/country.js";

const router = express.Router();

router.route("/countries").get(getCountries);
router.route("/status").get(getCountryStatus);
router.route("/countries/image").get(getSummaryImage);
router.route("/countries/:name").get(getCountry).delete(deleteCountry);
router.route("/countries/refresh").post(RefreshCountries);

export default router;
