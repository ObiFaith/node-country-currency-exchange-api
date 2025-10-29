import express from "express";
import {
  getCountry,
  getCountries,
  deleteCountry,
  RefreshCountries,
  getCountryStatus,
} from "../controllers/country.js";

const router = express.Router();

router.route("/").get(getCountries);
router.route("/status").get(getCountryStatus);
router.route("/:name").get(getCountry).delete(deleteCountry);
router.route("/refresh").post(RefreshCountries);

export default router;
