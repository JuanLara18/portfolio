---
title: "SQL, Pandas, PySpark, and DuckDB: The Data Engineer's Complete Reference"
date: "2026-05-12"
excerpt: "Four tools, one mental model. SQL for declarative in-database logic. Pandas for in-memory exploration. PySpark for distributed scale. DuckDB for the vast middle ground that doesn't need a cluster. Every pattern you need, side by side, with clear rules for when to reach for each."
tags: ["SQL", "Pandas", "PySpark", "DuckDB", "Data Engineering", "BigQuery", "Python"]
headerImage: "/blog/headers/data-python-header.webp"
readingTimeMinutes: 42
slug: sql-pandas-pyspark-duckdb
estimatedWordCount: 9500
---

# SQL, Pandas, PySpark, and DuckDB: The Data Engineer's Complete Reference

Four tools. Four different answers to the same question: how do you transform data?

**SQL** is declarative: you describe the result, the engine decides how to compute it. It runs inside the database, it's composable, it's what every data engineer reads and writes every day.

**Pandas** is imperative: you describe each step. It runs in Python memory, it's interactive, it's how most data engineers explore and prototype.

**PySpark** is distributed: it runs across a cluster, processing data that doesn't fit on one machine. You pay for the operational overhead in complexity and latency; the reward is horizontal scale.

**DuckDB** runs in-process, speaks SQL, queries Parquet files and Pandas DataFrames without a server, and benchmarks at 3–100× faster than Spark for datasets under 1TB. It changed the answer to "when do I need Spark?" more than any other development in data tooling in the last five years.

This is a reference post. Minimal prose, maximum code. Every pattern you'll reach for, across all four tools.

---

## The Dataset

Two tables used throughout. All examples reference these schemas.

```
transactions
├── transaction_id   STRING       primary key
├── customer_id      STRING       foreign key → customers
├── amount           FLOAT64      transaction value in USD
├── category         STRING       merchant category (food, travel, retail, ...)
├── status           STRING       pending | completed | failed | refunded
├── country          STRING       ISO 3166-1 alpha-2
└── created_at       TIMESTAMP    event timestamp

customers
├── customer_id      STRING       primary key
├── name             STRING
├── country          STRING
├── tier             STRING       standard | premium | vip
└── joined_at        DATE
```

---

## Part 1 — SQL

BigQuery dialect throughout. The patterns translate directly to PostgreSQL, Snowflake, and DuckDB with minimal adjustments noted where they differ.

### Reads and Projections

```sql
-- Basic select
SELECT transaction_id, customer_id, amount, status
FROM `project.dataset.transactions`
LIMIT 100;

-- Column expressions and aliases
SELECT
    transaction_id,
    amount,
    amount * 0.19 AS vat,
    ROUND(amount, 2) AS amount_rounded,
    UPPER(category) AS category_upper,
    DATE(created_at) AS txn_date
FROM `project.dataset.transactions`;
```

### Filtering

```sql
-- Simple predicates
SELECT * FROM `project.dataset.transactions`
WHERE status = 'completed'
  AND amount BETWEEN 10 AND 10000
  AND created_at >= TIMESTAMP('2025-01-01');

-- IN / NOT IN
WHERE category IN ('food', 'retail', 'travel')

-- NULL handling in filters
WHERE country IS NOT NULL
  AND COALESCE(amount, 0) > 0

-- Pattern matching
WHERE REGEXP_CONTAINS(transaction_id, r'^TXN-[0-9]{8}$')
```

### CTEs and Subqueries

```sql
-- CTE: prefer over subqueries for readability and reuse
WITH completed AS (
    SELECT *
    FROM `project.dataset.transactions`
    WHERE status = 'completed'
),

monthly_totals AS (
    SELECT
        customer_id,
        DATE_TRUNC(created_at, MONTH) AS month,
        SUM(amount) AS monthly_spend,
        COUNT(*) AS n_transactions
    FROM completed
    GROUP BY 1, 2
)

SELECT
    customer_id,
    month,
    monthly_spend,
    n_transactions,
    SUM(monthly_spend) OVER (PARTITION BY customer_id ORDER BY month) AS cumulative_spend
FROM monthly_totals
ORDER BY customer_id, month;
```

### GROUP BY and Aggregation

```sql
-- Standard aggregations
SELECT
    category,
    COUNT(*) AS n,
    SUM(amount) AS total,
    AVG(amount) AS avg,
    MIN(amount) AS min_amount,
    MAX(amount) AS max_amount,
    APPROX_QUANTILES(amount, 4)[OFFSET(2)] AS median  -- BigQuery APPROX_QUANTILES
FROM `project.dataset.transactions`
WHERE status = 'completed'
GROUP BY category
HAVING COUNT(*) > 100
ORDER BY total DESC;

-- Multi-level grouping with ROLLUP
SELECT
    country,
    category,
    SUM(amount) AS total
FROM `project.dataset.transactions`
GROUP BY ROLLUP(country, category);

-- Conditional aggregation
SELECT
    customer_id,
    SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) AS completed_amount,
    COUNTIF(status = 'failed') AS failed_count,
    COUNTIF(amount > 1000) AS large_txn_count
FROM `project.dataset.transactions`
GROUP BY customer_id;
```

### Window Functions

```sql
-- ROW_NUMBER — pick latest transaction per customer
SELECT * FROM (
    SELECT *,
        ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY created_at DESC) AS rn
    FROM `project.dataset.transactions`
)
WHERE rn = 1;

-- QUALIFY — BigQuery/Snowflake shorthand (no outer SELECT needed)
SELECT *
FROM `project.dataset.transactions`
QUALIFY ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY created_at DESC) = 1;

-- Ranking
SELECT
    customer_id,
    amount,
    RANK() OVER (PARTITION BY category ORDER BY amount DESC) AS rank_in_category,
    DENSE_RANK() OVER (ORDER BY amount DESC) AS global_dense_rank,
    PERCENT_RANK() OVER (ORDER BY amount) AS percentile
FROM `project.dataset.transactions`;

-- LAG / LEAD — time-series comparisons
SELECT
    customer_id,
    created_at,
    amount,
    LAG(amount, 1) OVER w AS prev_amount,
    LEAD(amount, 1) OVER w AS next_amount,
    amount - LAG(amount, 1) OVER w AS delta
FROM `project.dataset.transactions`
WINDOW w AS (PARTITION BY customer_id ORDER BY created_at);

-- Running totals and moving averages
SELECT
    customer_id,
    created_at,
    amount,
    SUM(amount) OVER (
        PARTITION BY customer_id
        ORDER BY created_at
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS running_total,
    AVG(amount) OVER (
        PARTITION BY customer_id
        ORDER BY created_at
        ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
    ) AS rolling_7_avg
FROM `project.dataset.transactions`;
```

### Joins

```sql
-- INNER JOIN
SELECT t.*, c.name, c.tier
FROM `project.dataset.transactions` t
JOIN `project.dataset.customers` c USING (customer_id);

-- LEFT JOIN — keep all transactions, null if no customer record
SELECT t.*, c.name
FROM `project.dataset.transactions` t
LEFT JOIN `project.dataset.customers` c USING (customer_id);

-- ANTI JOIN — transactions with no customer record
SELECT t.*
FROM `project.dataset.transactions` t
LEFT JOIN `project.dataset.customers` c USING (customer_id)
WHERE c.customer_id IS NULL;

-- SELF JOIN — find consecutive transactions within 1 minute (fraud pattern)
SELECT a.transaction_id, b.transaction_id AS next_txn_id
FROM `project.dataset.transactions` a
JOIN `project.dataset.transactions` b
  ON a.customer_id = b.customer_id
  AND b.created_at BETWEEN a.created_at AND TIMESTAMP_ADD(a.created_at, INTERVAL 1 MINUTE)
  AND a.transaction_id != b.transaction_id;
```

### Arrays and Structs

```sql
-- ARRAY_AGG — collect rows into an array
SELECT
    customer_id,
    ARRAY_AGG(category ORDER BY created_at) AS categories_ordered,
    ARRAY_AGG(STRUCT(amount, category, created_at) ORDER BY created_at) AS txn_history
FROM `project.dataset.transactions`
GROUP BY customer_id;

-- UNNEST — explode an array column
SELECT customer_id, category
FROM `project.dataset.transactions`,
UNNEST(tags) AS category;  -- if tags is an ARRAY<STRING>
```

### Dates and Strings

```sql
-- Date arithmetic
SELECT
    created_at,
    DATE(created_at) AS txn_date,
    DATE_TRUNC(created_at, MONTH) AS month_start,
    DATE_TRUNC(created_at, WEEK) AS week_start,
    EXTRACT(HOUR FROM created_at) AS hour,
    EXTRACT(DAYOFWEEK FROM created_at) AS day_of_week,
    DATE_DIFF(CURRENT_DATE(), DATE(created_at), DAY) AS days_ago,
    FORMAT_TIMESTAMP('%Y-%m', created_at) AS year_month
FROM `project.dataset.transactions`;

-- String operations
SELECT
    transaction_id,
    UPPER(category) AS category_upper,
    TRIM(LOWER(status)) AS status_clean,
    SPLIT(transaction_id, '-')[OFFSET(1)] AS id_suffix,
    CONCAT(country, '-', category) AS country_category,
    REGEXP_EXTRACT(transaction_id, r'TXN-(\d+)') AS numeric_id,
    CHAR_LENGTH(transaction_id) AS id_length
FROM `project.dataset.transactions`;
```

### PIVOT

```sql
-- BigQuery PIVOT syntax
SELECT *
FROM (
    SELECT customer_id, category, amount
    FROM `project.dataset.transactions`
    WHERE status = 'completed'
)
PIVOT (
    SUM(amount)
    FOR category IN ('food', 'retail', 'travel', 'other')
);
```

### MERGE (Upsert)

```sql
-- Idempotent upsert pattern — core to data pipeline reliability
MERGE `project.dataset.transactions_clean` AS target
USING `project.dataset.transactions_staging` AS source
ON target.transaction_id = source.transaction_id

WHEN MATCHED AND source.updated_at > target.updated_at THEN
    UPDATE SET
        status = source.status,
        amount = source.amount,
        updated_at = source.updated_at

WHEN NOT MATCHED THEN
    INSERT (transaction_id, customer_id, amount, category, status, created_at, updated_at)
    VALUES (source.transaction_id, source.customer_id, source.amount,
            source.category, source.status, source.created_at, source.updated_at);
```

---

## Part 2 — Pandas

Pandas 2.x with the Copy-on-Write (CoW) behavior enabled by default in 2.0+. Works on DataFrames in memory. Best for datasets under ~5GB per machine — beyond that, memory pressure and GIL become real problems.

### Setup and Reads

```python
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

pd.set_option("display.max_columns", 50)
pd.set_option("display.float_format", "{:.2f}".format)

# Read from files
df = pd.read_parquet("transactions.parquet")
df = pd.read_csv("transactions.csv", parse_dates=["created_at"])
df = pd.read_json("transactions.jsonl", lines=True)

# Read from BigQuery
df = pd.read_gbq(
    "SELECT * FROM `project.dataset.transactions`",
    project_id="my-project",
    dtypes={"amount": "float64"},
)

# Read from PostgreSQL / AlloyDB
from sqlalchemy import create_engine
engine = create_engine("postgresql+pg8000://user:pass@host/db")
df = pd.read_sql("SELECT * FROM transactions WHERE status = 'completed'", engine)

# Inspect
df.shape          # (rows, cols)
df.dtypes         # column types
df.describe()     # summary stats
df.info()         # memory + nulls
df.head()
```

### Select and Filter

```python
# Column selection
df[["customer_id", "amount", "category"]]
df.filter(like="amount")          # columns whose name contains "amount"
df.filter(regex=r"^customer_")    # columns matching regex

# Row filtering — use .query() for readability
df.query("status == 'completed' and amount > 100")
df.query("category in ['food', 'retail'] and country != 'CO'")
df.query("created_at >= '2025-01-01' and created_at < '2026-01-01'")

# Boolean indexing (equivalent, more flexible for dynamic conditions)
mask = (df["status"] == "completed") & (df["amount"] > 100)
df.loc[mask, ["customer_id", "amount", "category"]]

# iloc for positional slicing
df.iloc[:5]            # first 5 rows
df.iloc[:, :3]         # first 3 columns
df.iloc[0:100, 2:5]
```

### Adding Columns

```python
# Simple computed columns
df = df.assign(
    vat=lambda x: x["amount"] * 0.19,
    amount_rounded=lambda x: x["amount"].round(2),
    is_large=lambda x: x["amount"] > 1000,
    category_upper=lambda x: x["category"].str.upper(),
)

# Conditional column — np.where (fast, vectorized)
df["tier"] = np.where(
    df["amount"] > 1000, "high",
    np.where(df["amount"] > 100, "medium", "low")
)

# Multiple conditions — pd.cut for binning
df["amount_band"] = pd.cut(
    df["amount"],
    bins=[0, 10, 100, 1000, float("inf")],
    labels=["micro", "small", "medium", "large"]
)

# apply for logic that can't be vectorized (slow — last resort)
def classify_txn(row):
    if row["status"] == "failed" and row["amount"] > 500:
        return "high_risk_failed"
    return "normal"

df["risk_flag"] = df.apply(classify_txn, axis=1)
```

### Group By and Aggregation

```python
# Named aggregation (preferred in Pandas 2.x)
df.groupby("category").agg(
    total=("amount", "sum"),
    avg=("amount", "mean"),
    median=("amount", "median"),
    n=("transaction_id", "count"),
    unique_customers=("customer_id", "nunique"),
    pct_large=("is_large", "mean"),
).reset_index().sort_values("total", ascending=False)

# Multi-level groupby
df.groupby(["country", "category"]).agg(
    total=("amount", "sum"),
    n=("transaction_id", "count"),
).reset_index()

# Transform — adds group aggregate as column without collapsing rows
df["customer_total"] = df.groupby("customer_id")["amount"].transform("sum")
df["pct_of_customer_total"] = df["amount"] / df["customer_total"]

# Custom aggregation function
def coefficient_of_variation(x):
    return x.std() / x.mean() if x.mean() != 0 else 0

df.groupby("category")["amount"].agg(coefficient_of_variation)
```

### Method Chaining

```python
# Method chaining — readable, no intermediate variables
result = (
    df
    .query("status == 'completed'")
    .assign(
        month=lambda x: x["created_at"].dt.to_period("M"),
        week=lambda x: x["created_at"].dt.to_period("W"),
    )
    .groupby(["customer_id", "month"])
    .agg(
        total=("amount", "sum"),
        n=("transaction_id", "count"),
        categories=("category", lambda x: list(x.unique())),
    )
    .reset_index()
    .rename(columns={"month": "period"})
    .sort_values("total", ascending=False)
    .head(100)
)
```

### Joins and Merges

```python
# Left join — keep all transactions
merged = df_txn.merge(df_cust, on="customer_id", how="left")

# All join types
df_txn.merge(df_cust, on="customer_id", how="inner")    # only matched
df_txn.merge(df_cust, on="customer_id", how="right")    # all customers
df_txn.merge(df_cust, on="customer_id", how="outer")    # all rows both sides

# Join on multiple keys
df_a.merge(df_b, on=["customer_id", "country"], how="inner")

# Anti-join — transactions with no customer record
anti = (
    df_txn
    .merge(df_cust[["customer_id"]], on="customer_id", how="left", indicator=True)
    .query('_merge == "left_only"')
    .drop(columns=["_merge"])
)

# concat — vertical stack (union)
pd.concat([df_2024, df_2025], ignore_index=True)
pd.concat([df_a, df_b], ignore_index=True).drop_duplicates(subset="transaction_id")
```

### Window Functions

```python
# Rank per partition
df = df.sort_values("created_at")
df["rank_in_category"] = (
    df.groupby("category")["amount"]
    .rank(method="dense", ascending=False)
)

# LAG / LEAD — shift within group
df = df.sort_values(["customer_id", "created_at"])
df["prev_amount"] = df.groupby("customer_id")["amount"].shift(1)
df["next_amount"] = df.groupby("customer_id")["amount"].shift(-1)
df["delta"] = df["amount"] - df["prev_amount"]

# Running total
df["running_total"] = df.groupby("customer_id")["amount"].cumsum()

# Top-N per group — equivalent to QUALIFY ROW_NUMBER() = 1
latest_per_customer = (
    df
    .sort_values("created_at", ascending=False)
    .groupby("customer_id")
    .head(1)
    .reset_index(drop=True)
)

# Time-based rolling window (requires datetime index)
df_indexed = df.set_index("created_at").sort_index()
rolling_7d = (
    df_indexed
    .groupby("customer_id")["amount"]
    .rolling("7D")
    .sum()
    .reset_index()
    .rename(columns={"amount": "rolling_7d_spend"})
)
```

### Pivot and Reshape

```python
# pivot_table — SQL PIVOT equivalent
pivot = df.pivot_table(
    values="amount",
    index="customer_id",
    columns="category",
    aggfunc="sum",
    fill_value=0,
)

# melt — unpivot (wide → long)
long = pivot.reset_index().melt(
    id_vars="customer_id",
    value_vars=["food", "retail", "travel"],
    var_name="category",
    value_name="amount",
)

# crosstab — count matrix
ct = pd.crosstab(df["country"], df["status"], values=df["amount"], aggfunc="sum")
```

### Dates and Strings

```python
# Date operations via .dt accessor
df["txn_date"] = df["created_at"].dt.date
df["month"] = df["created_at"].dt.to_period("M")
df["year"] = df["created_at"].dt.year
df["hour"] = df["created_at"].dt.hour
df["day_name"] = df["created_at"].dt.day_name()
df["days_ago"] = (pd.Timestamp.now() - df["created_at"]).dt.days
df["week_start"] = df["created_at"] - pd.to_timedelta(df["created_at"].dt.dayofweek, unit="D")

# String operations via .str accessor
df["category_upper"] = df["category"].str.upper()
df["category_clean"] = df["category"].str.strip().str.lower().str.replace("-", "_")
df["id_suffix"] = df["transaction_id"].str.split("-").str[-1]
df["is_food"] = df["category"].str.contains("food", case=False, na=False)
df["country_category"] = df["country"].str.cat(df["category"], sep="-")
df["numeric_id"] = df["transaction_id"].str.extract(r"TXN-(\d+)")[0]
```

### Null Handling

```python
# Detection
df.isna().sum()
df.isna().mean()             # null rate per column
df["amount"].notna()

# Filling
df["amount"].fillna(0)
df["country"].fillna("UNKNOWN")
df.fillna({"amount": 0, "category": "other", "status": "unknown"})

# Forward-fill / backward-fill (time series)
df.sort_values("created_at").ffill()

# Drop rows missing critical fields
df.dropna(subset=["customer_id", "amount", "created_at"])
```

### Write Output

```python
# Parquet — preferred for data pipelines
df.to_parquet("output.parquet", index=False, compression="snappy")
df.to_parquet("output/", partition_cols=["country", "status"])  # partitioned

# CSV (avoid for large data)
df.to_csv("output.csv", index=False)

# BigQuery
df.to_gbq(
    destination_table="project.dataset.output_table",
    project_id="my-project",
    if_exists="replace",          # "append", "replace", "fail"
    chunksize=10_000,
)

# PostgreSQL / AlloyDB
df.to_sql("output_table", engine, if_exists="append", index=False, method="multi")
```

---

## Part 3 — PySpark

PySpark 4.0/4.1. Distributed across a cluster. The right tool when data exceeds single-node memory or when you need distributed writes at scale. Overhead — cluster startup, shuffle — makes it overkill for anything under a few hundred GB.

### Setup and Reads

```python
from pyspark.sql import SparkSession
from pyspark.sql import functions as F
from pyspark.sql import types as T
from pyspark.sql.window import Window

spark = (
    SparkSession.builder
    .appName("data-engineering")
    # Tune for GCS + BigQuery connector
    .config("spark.sql.adaptive.enabled", "true")       # AQE: auto-tune shuffles
    .config("spark.sql.adaptive.coalescePartitions.enabled", "true")
    .config("spark.sql.shuffle.partitions", "200")      # default 200; tune to data size
    .getOrCreate()
)

# Read from GCS (Parquet)
df = spark.read.parquet("gs://bucket/transactions/")
df = spark.read.parquet("gs://bucket/transactions/year=2025/")  # partition pruning

# Read from BigQuery (spark-bigquery-connector)
df = (
    spark.read.format("bigquery")
    .option("table", "project.dataset.transactions")
    .option("filter", "status = 'completed'")            # pushes filter to BQ
    .load()
)

# Read from Parquet with schema enforcement
schema = T.StructType([
    T.StructField("transaction_id", T.StringType(), nullable=False),
    T.StructField("customer_id", T.StringType(), nullable=True),
    T.StructField("amount", T.DoubleType(), nullable=True),
    T.StructField("created_at", T.TimestampType(), nullable=True),
])
df = spark.read.schema(schema).parquet("gs://bucket/transactions/")

# Inspect
df.printSchema()
df.count()
df.show(5, truncate=False)
df.describe().show()
```

### Select and Filter

```python
# Select
df.select("customer_id", "amount", "category")
df.select(
    "transaction_id",
    F.col("amount"),
    (F.col("amount") * 0.19).alias("vat"),
    F.round("amount", 2).alias("amount_rounded"),
    F.upper("category").alias("category_upper"),
    F.to_date("created_at").alias("txn_date"),
)

# Filter
df.filter(F.col("status") == "completed")
df.filter(
    (F.col("status") == "completed") &
    (F.col("amount") > 100) &
    (F.col("created_at") >= F.lit("2025-01-01").cast(T.TimestampType()))
)
df.filter(F.col("category").isin("food", "retail", "travel"))
df.filter(~F.col("category").isin("food"))                    # NOT IN
df.filter(F.col("country").isNotNull())
```

### Adding Columns

```python
# withColumn — adds or replaces a column
df = (
    df
    .withColumn("vat", F.col("amount") * 0.19)
    .withColumn("is_large", F.col("amount") > 1000)
    .withColumn("category_upper", F.upper("category"))
    .withColumn("txn_date", F.to_date("created_at"))
)

# Conditional — F.when / F.otherwise
df = df.withColumn(
    "tier",
    F.when(F.col("amount") > 1000, "high")
     .when(F.col("amount") > 100, "medium")
     .otherwise("low")
)

# Buckets — equivalent to pd.cut
from pyspark.ml.feature import Bucketizer
bucketizer = Bucketizer(
    splits=[0, 10, 100, 1000, float("inf")],
    inputCol="amount",
    outputCol="amount_bucket"
)
df = bucketizer.transform(df)
```

### Group By and Aggregation

```python
# Named aggregation
df.groupBy("category").agg(
    F.sum("amount").alias("total"),
    F.avg("amount").alias("avg"),
    F.count("transaction_id").alias("n"),
    F.countDistinct("customer_id").alias("unique_customers"),
    F.max("amount").alias("max_amount"),
    F.percentile_approx("amount", 0.5).alias("median"),
)

# Multi-level groupby
df.groupBy("country", "category").agg(
    F.sum("amount").alias("total"),
    F.count("*").alias("n"),
).orderBy(F.desc("total"))

# Conditional aggregation
df.groupBy("customer_id").agg(
    F.sum(F.when(F.col("status") == "completed", F.col("amount")).otherwise(0)).alias("completed_amount"),
    F.count(F.when(F.col("status") == "failed", 1)).alias("failed_count"),
)
```

### Window Functions

```python
# Partition spec
w_customer = Window.partitionBy("customer_id").orderBy("created_at")
w_category = Window.partitionBy("category").orderBy(F.desc("amount"))

# Rank, row number
df = (
    df
    .withColumn("row_num", F.row_number().over(w_customer))
    .withColumn("rank_in_category", F.rank().over(w_category))
    .withColumn("dense_rank", F.dense_rank().over(w_category))
)

# Latest per customer (row_num = 1)
latest = df.filter(F.col("row_num") == 1)

# LAG / LEAD
df = (
    df
    .withColumn("prev_amount", F.lag("amount", 1).over(w_customer))
    .withColumn("next_amount", F.lead("amount", 1).over(w_customer))
    .withColumn("delta", F.col("amount") - F.col("prev_amount"))
)

# Running total — ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
w_running = w_customer.rowsBetween(Window.unboundedPreceding, Window.currentRow)
df = df.withColumn("running_total", F.sum("amount").over(w_running))

# Trailing 7-row average
w_rolling = w_customer.rowsBetween(-6, 0)
df = df.withColumn("rolling_7_avg", F.avg("amount").over(w_rolling))
```

### Joins

```python
# Standard joins
df_txn.join(df_cust, on="customer_id", how="inner")
df_txn.join(df_cust, on="customer_id", how="left")
df_txn.join(df_cust, on=["customer_id", "country"], how="inner")

# Broadcast join — critical for large + small table joins
# Forces the small table into every executor's memory → avoids shuffle
df_txn.join(F.broadcast(df_cust), on="customer_id", how="left")
# Rule: broadcast when one side < 100MB (Spark auto-broadcasts at spark.sql.autoBroadcastJoinThreshold)

# Anti join
df_txn.join(df_cust, on="customer_id", how="left_anti")

# Semi join — keep left rows that have a match
df_txn.join(df_cust, on="customer_id", how="left_semi")
```

### Pivot

```python
# Pivot — same concept as SQL PIVOT and pd.pivot_table
df.groupBy("customer_id").pivot("category").sum("amount").fillna(0)

# Pivot with explicit values (faster — no scan for distinct values)
df.groupBy("customer_id").pivot("category", ["food", "retail", "travel"]).sum("amount")
```

### Dates and Strings

```python
# Dates
df.withColumn("txn_date", F.to_date("created_at"))
df.withColumn("month", F.date_trunc("month", "created_at"))
df.withColumn("year", F.year("created_at"))
df.withColumn("hour", F.hour("created_at"))
df.withColumn("day_of_week", F.dayofweek("created_at"))
df.withColumn("days_ago", F.datediff(F.current_date(), F.to_date("created_at")))
df.withColumn("year_month", F.date_format("created_at", "yyyy-MM"))

# Strings
df.withColumn("category_upper", F.upper("category"))
df.withColumn("category_clean", F.trim(F.lower(F.col("category"))))
df.withColumn("id_suffix", F.split("transaction_id", "-").getItem(1))
df.withColumn("is_food", F.col("category").contains("food"))
df.withColumn("numeric_id", F.regexp_extract("transaction_id", r"TXN-(\d+)", 1))
```

### UDFs

```python
# Regular UDF — slow (Python ↔ JVM serialization per row)
@F.udf(returnType=T.StringType())
def classify_txn(status, amount):
    if status == "failed" and amount > 500:
        return "high_risk_failed"
    return "normal"

df.withColumn("risk_flag", classify_txn("status", "amount"))

# Pandas UDF (vectorized) — 10–100× faster than regular UDF
# Uses Apache Arrow for batch transfer; eliminates row-by-row overhead
from pyspark.sql.functions import pandas_udf

@pandas_udf(T.StringType())
def classify_txn_vectorized(status: pd.Series, amount: pd.Series) -> pd.Series:
    return pd.Series([
        "high_risk_failed" if s == "failed" and a > 500 else "normal"
        for s, a in zip(status, amount)
    ])

df.withColumn("risk_flag", classify_txn_vectorized("status", "amount"))
```

### Partitioning and Performance

```python
# Check current partition count (affects parallelism and shuffle)
df.rdd.getNumPartitions()

# repartition — increases OR decreases partitions, triggers full shuffle
df.repartition(50)                          # by count
df.repartition("customer_id")               # by column hash (good before joins)
df.repartition(50, "customer_id")           # by count + column

# coalesce — decreases partitions only, avoids full shuffle
df.coalesce(1)                              # single file output

# Persist (cache) — avoid recomputing expensive transformations
df.cache()                                  # MEMORY_AND_DISK by default in Spark 4
df.persist()
df.unpersist()

# Partitioned write (creates directory structure date=2025-01-01/country=CO/)
df.write.partitionBy("txn_date", "country").parquet("gs://bucket/output/")

# Repartition before joining large tables to same column
df_txn_repartitioned = df_txn.repartition("customer_id")
df_cust_repartitioned = df_cust.repartition("customer_id")
joined = df_txn_repartitioned.join(df_cust_repartitioned, "customer_id")
```

### Write Output

```python
# Parquet to GCS
df.write.mode("overwrite").parquet("gs://bucket/output/")
df.write.mode("append").partitionBy("txn_date").parquet("gs://bucket/transactions/")

# BigQuery
df.write.format("bigquery") \
    .option("table", "project.dataset.output_table") \
    .option("temporaryGcsBucket", "my-temp-bucket") \
    .mode("overwrite") \
    .save()

# Apache Iceberg (Spark 4 + Iceberg catalog)
df.write.format("iceberg") \
    .mode("append") \
    .option("write.target-file-size-bytes", "134217728") \  # 128MB files
    .saveAsTable("catalog.db.transactions")

# Delta Lake
df.write.format("delta").mode("overwrite").save("gs://bucket/delta/transactions/")
```

---

## Part 4 — DuckDB

DuckDB 1.4+ (2025 LTS). An in-process analytical database: no server, no cluster, no configuration. Install with `pip install duckdb`. Speaks standard SQL. Reads Parquet, CSV, JSON, Arrow, and Pandas DataFrames natively.

The benchmark reality: for datasets up to 1TB with OLAP query patterns (aggregation, joins, filtering on Parquet), DuckDB on a single machine consistently matches or beats Spark on a cluster. The cluster adds network overhead, shuffle management, and JVM costs that DuckDB avoids entirely.

### Core Usage

```python
import duckdb
import pandas as pd

# In-memory database (default)
con = duckdb.connect()

# Persistent database file
con = duckdb.connect("analytics.duckdb")

# Query a Parquet file — no load step
con.sql("SELECT * FROM 'transactions.parquet' LIMIT 10").df()

# Glob — query multiple files as one table
con.sql("SELECT COUNT(*) FROM 'data/transactions_*.parquet'").show()

# GCS / S3 (with httpfs extension)
con.sql("INSTALL httpfs; LOAD httpfs;")
con.sql("""
    SET s3_region = 'us-central1';
    SELECT * FROM 'gs://bucket/transactions/*.parquet'
    WHERE status = 'completed'
""").df()
```

### SQL on Pandas DataFrames

```python
# DuckDB can query a Pandas DataFrame directly by name — zero copy via Arrow
df = pd.read_parquet("transactions.parquet")

result = duckdb.sql("""
    SELECT
        customer_id,
        SUM(amount) AS total,
        COUNT(*) AS n,
        ROW_NUMBER() OVER (ORDER BY SUM(amount) DESC) AS rank
    FROM df
    WHERE status = 'completed'
    GROUP BY customer_id
    QUALIFY ROW_NUMBER() OVER (ORDER BY SUM(amount) DESC) <= 10
""").df()

# Join two DataFrames with SQL
df_txn = pd.read_parquet("transactions.parquet")
df_cust = pd.read_parquet("customers.parquet")

joined = duckdb.sql("""
    SELECT t.*, c.name, c.tier
    FROM df_txn t
    LEFT JOIN df_cust c USING (customer_id)
""").df()
```

### Full Analytical Pipeline

```python
# Complete ETL in DuckDB — replaces a Spark job for medium-scale data

result = con.sql("""
    WITH base AS (
        SELECT *
        FROM 'gs://bucket/transactions/*.parquet'
        WHERE status = 'completed'
          AND created_at >= '2025-01-01'
    ),

    customer_monthly AS (
        SELECT
            customer_id,
            DATE_TRUNC('month', created_at) AS month,
            SUM(amount) AS monthly_spend,
            COUNT(*) AS n_transactions,
            COUNT(DISTINCT category) AS unique_categories
        FROM base
        GROUP BY 1, 2
    ),

    ranked AS (
        SELECT *,
            ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY month DESC) AS rn,
            AVG(monthly_spend) OVER (PARTITION BY customer_id) AS avg_monthly_spend,
            SUM(monthly_spend) OVER (PARTITION BY customer_id ORDER BY month) AS cumulative_spend
        FROM customer_monthly
    )

    SELECT * FROM ranked WHERE rn <= 6
    ORDER BY customer_id, month DESC
""").df()

# Write result to Parquet
con.sql("COPY (SELECT * FROM result) TO 'output.parquet' (FORMAT PARQUET, COMPRESSION SNAPPY)")
```

### DuckDB vs Spark Decision

| Dimension | DuckDB | PySpark |
|-----------|--------|---------|
| Data size | < 500GB comfortably | 500GB to petabytes |
| Setup | `pip install duckdb` | Cluster + JVM + config |
| Latency | Milliseconds to seconds | Minutes (cluster startup) |
| SQL dialect | Standard SQL + QUALIFY | Spark SQL (similar) |
| Python integration | Zero-copy Pandas/Arrow | Pandas UDF via Arrow |
| Parallelism | Multi-core single node | Multi-node distributed |
| Streaming | No | Yes (Structured Streaming) |
| Cost model | Free (compute you already have) | Cluster cost per hour |

The rule: **reach for DuckDB first. Only upgrade to Spark when the data or the write pattern requires a cluster.**

---

## Part 5 — Contrasts

The same seven operations across all four tools. Read this section with the specific operation in mind — which syntax you prefer is secondary to understanding what each tool is actually doing.

### 1. Filter and Select

```sql
-- SQL
SELECT customer_id, amount FROM transactions
WHERE status = 'completed' AND amount > 100;
```

```python
# Pandas
df.query("status == 'completed' and amount > 100")[["customer_id", "amount"]]
```

```python
# PySpark
df.filter((F.col("status") == "completed") & (F.col("amount") > 100)) \
  .select("customer_id", "amount")
```

```python
# DuckDB
duckdb.sql("""
    SELECT customer_id, amount FROM df
    WHERE status = 'completed' AND amount > 100
""").df()
```

---

### 2. Group By and Aggregate

```sql
-- SQL
SELECT category, SUM(amount) AS total, COUNT(*) AS n
FROM transactions GROUP BY category ORDER BY total DESC;
```

```python
# Pandas
df.groupby("category").agg(total=("amount", "sum"), n=("transaction_id", "count")) \
  .reset_index().sort_values("total", ascending=False)
```

```python
# PySpark
df.groupBy("category").agg(
    F.sum("amount").alias("total"),
    F.count("*").alias("n")
).orderBy(F.desc("total"))
```

```python
# DuckDB
duckdb.sql("""
    SELECT category, SUM(amount) AS total, COUNT(*) AS n
    FROM df GROUP BY category ORDER BY total DESC
""").df()
```

---

### 3. Join

```sql
-- SQL
SELECT t.*, c.name, c.tier
FROM transactions t LEFT JOIN customers c USING (customer_id);
```

```python
# Pandas
df_txn.merge(df_cust, on="customer_id", how="left")
```

```python
# PySpark
df_txn.join(F.broadcast(df_cust), on="customer_id", how="left")
```

```python
# DuckDB
duckdb.sql("SELECT t.*, c.name, c.tier FROM df_txn t LEFT JOIN df_cust c USING (customer_id)").df()
```

---

### 4. Window: Latest Row Per Group

```sql
-- SQL (BigQuery QUALIFY)
SELECT * FROM transactions
QUALIFY ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY created_at DESC) = 1;
```

```python
# Pandas
df.sort_values("created_at", ascending=False).groupby("customer_id").head(1)
```

```python
# PySpark
w = Window.partitionBy("customer_id").orderBy(F.desc("created_at"))
df.withColumn("rn", F.row_number().over(w)).filter(F.col("rn") == 1).drop("rn")
```

```python
# DuckDB
duckdb.sql("""
    SELECT * FROM df
    QUALIFY ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY created_at DESC) = 1
""").df()
```

---

### 5. Running Total

```sql
-- SQL
SELECT customer_id, created_at, amount,
    SUM(amount) OVER (PARTITION BY customer_id ORDER BY created_at
                      ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running_total
FROM transactions;
```

```python
# Pandas
df = df.sort_values(["customer_id", "created_at"])
df["running_total"] = df.groupby("customer_id")["amount"].cumsum()
```

```python
# PySpark
w = Window.partitionBy("customer_id").orderBy("created_at") \
          .rowsBetween(Window.unboundedPreceding, Window.currentRow)
df.withColumn("running_total", F.sum("amount").over(w))
```

```python
# DuckDB
duckdb.sql("""
    SELECT *, SUM(amount) OVER (
        PARTITION BY customer_id ORDER BY created_at
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS running_total FROM df
""").df()
```

---

### 6. Pivot (Wide Format)

```sql
-- SQL (BigQuery)
SELECT * FROM transactions
PIVOT (SUM(amount) FOR category IN ('food', 'retail', 'travel'));
```

```python
# Pandas
df.pivot_table(values="amount", index="customer_id",
               columns="category", aggfunc="sum", fill_value=0)
```

```python
# PySpark
df.groupBy("customer_id").pivot("category", ["food", "retail", "travel"]).sum("amount").fillna(0)
```

```python
# DuckDB
duckdb.sql("""
    PIVOT df ON category USING SUM(amount)
    GROUP BY customer_id
""").df()
```

---

### 7. Deduplicate (Keep Latest)

```sql
-- SQL
DELETE FROM transactions
WHERE transaction_id NOT IN (
    SELECT transaction_id FROM transactions
    QUALIFY ROW_NUMBER() OVER (PARTITION BY transaction_id ORDER BY updated_at DESC) = 1
);
```

```python
# Pandas
df = df.sort_values("updated_at", ascending=False).drop_duplicates(subset="transaction_id")
```

```python
# PySpark
w = Window.partitionBy("transaction_id").orderBy(F.desc("updated_at"))
df.withColumn("rn", F.row_number().over(w)).filter("rn = 1").drop("rn")
```

```python
# DuckDB
duckdb.sql("""
    SELECT * EXCLUDE(rn) FROM (
        SELECT *, ROW_NUMBER() OVER (PARTITION BY transaction_id ORDER BY updated_at DESC) AS rn
        FROM df
    ) WHERE rn = 1
""").df()
```

---

### When to Use Which

| Scenario | Best Tool | Why |
|----------|-----------|-----|
| Transformation inside a data warehouse | **SQL** | Pushes compute to where data lives; no data movement |
| dbt model or ELT step | **SQL** | Versionable, testable, lineage-tracked |
| Exploratory analysis, prototyping | **Pandas** | Interactive, fast iteration, matplotlib/seaborn integration |
| Data < 5GB in memory | **Pandas** | Simplest, no overhead |
| Data 5GB – 1TB, OLAP queries on Parquet | **DuckDB** | Fast, serverless, standard SQL, Arrow integration |
| Data > 1TB or multi-node distributed writes | **PySpark** | Horizontal scale, fault tolerance |
| Streaming / near-real-time | **PySpark** Structured Streaming | Only distributed streaming engine here |
| ML feature engineering at scale | **PySpark** | Pandas API on Spark, MLlib integration |
| Quick ad-hoc SQL over local files | **DuckDB** | No setup, query Parquet/CSV directly |
| Cross-engine pipeline (Iceberg + BigQuery + Python) | **SQL + DuckDB** | Both speak Iceberg, zero glue code |

---

### The Data Size Decision

```
Data size:
├── < 1GB    → Pandas (always)
├── 1–50GB   → DuckDB or Pandas (DuckDB preferred for SQL-style aggregations)
├── 50–500GB → DuckDB on a large machine, OR PySpark if you already have a cluster
└── > 500GB  → PySpark (or BigQuery/Snowflake if data lives there)

Query type:
├── Declarative, in-database → SQL (always, if data is there)
├── Complex Python logic      → Pandas (small) or Pandas UDF in Spark (large)
├── OLAP on files             → DuckDB
└── Distributed writes        → PySpark

Team context:
├── dbt stack          → SQL + dbt
├── Databricks/Spark   → PySpark + Delta Lake
├── GCP / BigQuery     → SQL + dbt + DuckDB for local dev
└── Notebook-first     → Pandas → DuckDB → Spark (as data grows)
```

---

## Going Deeper

**Books:**

- McKinney, W. (2022). *Python for Data Analysis, 3rd Edition.* O'Reilly Media.
  - Written by the creator of Pandas. The authoritative reference for the Pandas API. Chapter 12 on advanced GroupBy and Chapter 11 on time series are particularly useful for data engineering.

- Chambers, B. & Zaharia, M. (2018). *Spark: The Definitive Guide.* O'Reilly Media.
  - The most thorough treatment of Spark's internals: catalyst optimizer, tungsten execution, shuffle, caching, and streaming. Read the execution plan chapters before debugging any slow Spark job.

- Kleppmann, M. (2017). *Designing Data-Intensive Applications.* O'Reilly Media.
  - Chapter 2 (Data Models) maps directly to the SQL/document/columnar distinctions above. Chapter 6 (Partitioning) is essential context for understanding why PySpark's `repartition` and `coalesce` decisions matter.

- Tomasz Drabas & Denny Lee. (2017). *Learning PySpark.* Packt Publishing.
  - Focused on applied PySpark engineering rather than theory. Useful for the operational side — debugging, tuning, production deployment.

**Online Resources:**

- [DuckDB Documentation](https://duckdb.org/docs/) — The DuckDB docs are unusually readable. The SQL extensions section (QUALIFY, PIVOT, lambda functions) covers syntax not in standard SQL.
- [PySpark API Reference — Functions](https://spark.apache.org/docs/latest/api/python/reference/pyspark.sql/functions.html) — Complete reference for every `F.` function. Faster to grep than to google.
- [Pandas User Guide — GroupBy](https://pandas.pydata.org/docs/user_guide/groupby.html) — The official guide covers every aggregation pattern. The `transform` vs `agg` vs `apply` distinction is explained clearly here.
- [Modern Polars](https://moderndatastack.xyz/polars) — DuckDB's near-peer for in-process analytics using a Rust-based DataFrame API. If you're already comfortable with Pandas, Polars is worth learning as an alternative for the 5–500GB range.
- [DuckDB vs Spark Benchmarks (dataexpert.io)](https://blog.dataexpert.io/p/duckdb-can-be-100x-faster-than-spark) — Matt Martin's real benchmark comparison with methodology. The 100× headline is real for small data; the nuances matter for medium data.

**Videos:**

- ["Pandas Tutorial: DataFrames in Python"](https://www.youtube.com/watch?v=vmEHCJofslg) by Keith Galli — Comprehensive walkthrough of the Pandas API from first principles. Best for filling gaps in Pandas knowledge before working with the reference above.
- ["PySpark Tutorial for Beginners"](https://www.youtube.com/watch?v=_C8kWso4ne4) by Programming with Mosh — Covers the Spark architecture (driver, executors, DAG) before diving into the DataFrame API. Understanding the execution model is required for debugging Spark jobs.
- ["DuckDB: Analytical SQL for the Modern Data Stack"](https://www.youtube.com/watch?v=f9QlkXW4H9A) — Hannes Mühleisen (DuckDB creator) explaining the design decisions behind DuckDB. The section on columnar vectorized execution explains why DuckDB beats Pandas on OLAP queries.

**Academic Papers:**

- Mühleisen, H. & Raasveldt, M. (2019). ["DuckDB: an Embeddable Analytical Database."](https://dl.acm.org/doi/10.1145/3299869.3320212) *SIGMOD 2019.*
  - The original DuckDB paper. Short and readable. Explains the vectorized execution model and the design decision to embed inside the process rather than run as a server.

- Armbrust, M. et al. (2022). ["Photon: A Fast Query Engine for Lakehouse Systems."](https://dl.acm.org/doi/10.1145/3514221.3526054) *SIGMOD 2022.*
  - Databricks' native vectorized engine that powers the lakehouse query path. Reading this alongside DuckDB's paper shows how columnar vectorized execution became the dominant analytical query model.

**Questions to Explore:**

- DuckDB and PySpark read the same Parquet files. In theory, a data engineer could use DuckDB for local development and PySpark for production runs. What are the edge cases where this symmetry breaks — where a query that works in DuckDB produces different results in Spark, or fails to scale with the same Parquet layout?

- Pandas uses row-oriented storage internally for most operations but benefits from Parquet's columnar layout at read time. DuckDB operates fully columnar end-to-end. For a mixed workload — some row-level mutations, mostly OLAP reads — what is the right in-memory representation, and does Polars's lazy evaluation model offer a better answer than either?

- The PySpark Pandas API (`pyspark.pandas`) allows writing Pandas-style code that executes distributed. It sounds like the ideal bridge. In practice, performance and behavioral divergences make teams choose one or the other rather than mixing. Why does the abstraction leak, and what would a true "Pandas at scale" look like if designed from scratch today?

- SQL is declarative: the query optimizer chooses the execution plan. Pandas is imperative: the programmer chooses every step. DuckDB executes SQL imperatively in columnar batches. For a complex multi-join aggregation, does the programmer or the optimizer produce faster code? Under what conditions does each win?

- Every tool in this post reads and writes Parquet. But Parquet has no concept of updates or deletes — it's immutable. Lakehouse table formats (Iceberg, Delta) layer ACID updates on top of Parquet files using metadata. How should a data engineer decide which layer of update semantics is appropriate for a given use case — raw Parquet, Delta/Iceberg with merge, or a mutable database?
