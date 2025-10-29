import express from "express";
import { getCountries, RefreshCountries } from "../controllers/country.js";

const router = express.Router();

router.route("/").get(getCountries);
router.route("/refresh").post(RefreshCountries);

export default router;
