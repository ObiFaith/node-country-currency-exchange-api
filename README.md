# Country Data REST API

A RESTful API that fetches country data from an external API, enriches it with exchange rates, computes an estimated GDP, caches the results in a MySQL database, and provides CRUD operations and summary endpoints.

## Features

- Fetch country data from REST Countries API
- Fetch currency exchange rates from Exchange Rate API
- Compute estimated_gdp for each country using:
  ```js
  estimated_gdp = population × random(1000–2000) ÷ exchange_rate
  ```
- Store and update country data in MySQL
- CRUD operations for countries
- Filtering and sorting support
- Summary image generation of top GDP countries
- Robust validation and error handling

## External APIs

- [Rest Countries API](https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies): Fetch country data such as name, capital, population, etc

- [Exchange Rates API](https://open.er-api.com/v6/latest/USD): Get exchange rate per dollar using its currency code

## API Endpoints

### 1. Refresh Countries Data

**`POST /countries/refresh`**

- Fetch all countries and exchange rates
- Insert or update countries in the database
- Generate a summary image at cache/summary.png
- Updates global last_refreshed_at timestamp
- **Currency Handling**:
  - If a country has multiple currencies, only the first is stored
  - If currency is missing, currency_code & exchange_rate set to null, estimated_gdp = 0
  - If currency not found in exchange rates, exchange_rate & estimated_gdp = null
  - `estimated_gdp` recalculated on every refresh with a fresh random multiplier (1000–2000)
- **Error Handling**:
  External API failures return `503 Service Unavailable` and response message:

  ```json
  {
    "error": "External data source unavailable",
    "details": "Could not fetch data from [API name]"
  }
  ```

### 2. Get All Countries

**`GET /countries`**

- Supports optional query parameters:

      - ?region=Africa
      - ?currency=NGN
      - ?sort=gdp_desc (descending by estimated GDP)

**Sample Response:**

```json
[
  {
    "id": 1,
    "name": "Nigeria",
    "capital": "Abuja",
    "region": "Africa",
    "population": 206139589,
    "currency_code": "NGN",
    "exchange_rate": 1600.23,
    "estimated_gdp": 25767448125.2,
    "flag_url": "https://flagcdn.com/ng.svg",
    "last_refreshed_at": "2025-10-22T18:00:00Z"
  }
]
```

### 3. Get Country by Name

**`GET /countries/:name`**

- Case-insensitive search
- `404` status code if country not found

### 4. Delete Country

**`DELETE /countries/:name`**

- Deletes a country record by name
- `404` status code if country not found

### 5. Status Endpoint

**`GET /status`**

Returns total countries and last refresh timestamp

**Sample Response:**

```json
{
  "total_countries": 250,
  "last_refreshed_at": "2025-10-22T18:00:00Z"
}
```

### 6. Summary Image Endpoint

**`GET /countries/image`**

Serves generated summary image (`cache/summary.png`)

If no image exists, returns:

```json
{ "error": "Summary image not found" }
```

## Country Data Model

| Field             | Type       | Notes                                             |
| ----------------- | ---------- | ------------------------------------------------- |
| id                | `integer`  | Auto-generated                                    |
| name              | `string`   | Required                                          |
| capital           | `string`   | Optional                                          |
| region            | `string`   | Optional                                          |
| population        | `integer`  | Required                                          |
| currency_code     | `string`   | Required                                          |
| exchange_rate     | `float`    | Required                                          |
| estimated_gdp     | `float`    | Computed from population × random ÷ exchange_rate |
| flag_url          | `string`   | Optional                                          |
| last_refreshed_at | `datetime` | Auto timestamp                                    |

## Validation Rules

- `name, population, currency_code` are required
- Returns 400 Bad Request for missing/invalid data

**Example:**

```json
{
  "error": "Validation failed",
  "details": {
    "currency_code": "is required"
  }
}
```

## Error Handling

| Status Response | Example                                                                                            |
| --------------- | -------------------------------------------------------------------------------------------------- |
| `400`           | { "error": "Validation failed" }                                                                   |
| `404`           | { "error": "Country not found" }                                                                   |
| `500`           | { "error": "Internal server error" }                                                               |
| `503`           | { "error": "External data source unavailable", "details": "Could not fetch data from [API name]" } |
