# Presto SQL Performance & Cost Optimization Toolkit

## Overview
This toolkit provides a systematic approach to **tuning heavy Presto/Trino queries** and optimizing storage layouts for **speed, efficiency, and cost reduction**.  
It combines query profiling, best-practice rewrites, materialized rollups, and storage design strategies to deliver consistent improvements in query latency, resource usage, and dashboard responsiveness.

---

## Key Capabilities
- **Query Profiling**
  - Capture and analyze slow/expensive queries from Presto/Trino (`system.runtime.queries`).
  - Run `EXPLAIN` / `EXPLAIN ANALYZE` automatically to surface execution plan details.

- **Optimization Patterns**
  - Apply systematic rewrites using semi-joins, anti-joins, and window functions.
  - Replace costly `COUNT(DISTINCT ...)` with `approx_distinct`.
  - Detect and remove cross joins, skewed joins, and missing filters.

- **Materialized Rollups**
  - Daily tables (e.g., `daily_user_engagement`, `event_agg_by_geo`) pre-aggregate metrics.
  - Cuts repeated full-table scans and reduces dashboard load times.

- **Storage Layout Advisor**
  - Hive table redesign guidance:
    - Partitioning by date/app_id for partition pruning.
    - Bucketing on user_id to reduce shuffle costs.
    - Predicate pushdown checks.

- **Runbook & Knowledge Base**
  - Internal SQL optimization guide covering:
    - Anti-joins vs. `NOT IN`.
    - Semi-joins vs. `IN`.
    - Broadcast hints and join skew handling.
    - When to use approximate functions.

---

## Architecture (MVP v0)
1. **Logs & Data Source**  
   - Query logs pulled from `system.runtime.queries` or audit logs.  
   - Stored in S3 (raw → bronze → silver).  

2. **dbt Models**  
   - `fact_query_perf`: query-level performance fact table.  
   - `rollup_daily_perf`: daily latency and scan cost trends.  
   - `top_queries`: N slowest queries.  

3. **Frontend (Next.js / Vercel)**  
   - `/dashboard`: latency and scan trends.  
   - `/queries/top`: slowest queries with issues flagged.  
   - `/profile`: paste query → run `EXPLAIN ANALYZE` → optimization suggestions.  
   - `/runbook`: searchable optimization knowledge base.  

4. **APIs (Vercel Serverless)**  
   - `/api/profile`: analyze query plan + suggest rewrites.  
   - `/api/top_queries`: fetch top costly queries.  
   - `/api/cost_trends`: fetch daily performance rollups.  

---

## Example Workflow
1. Analyst pastes query in `/profile`.  
2. Toolkit runs `EXPLAIN ANALYZE` against Presto.  
3. Engine parses plan → detects issues (full scans, cross joins, DISTINCT, etc).  
4. Suggestions returned as JSON + rendered in UI.  
5. Daily rollups show how optimizations improve latency and reduce costs.

---

## Example Optimization Suggestions
- **Detected:** `COUNT(DISTINCT user_id)`  
  - **Suggestion:** Use `approx_distinct(user_id)` for faster aggregates when exact count not required.  

- **Detected:** `NOT IN (SELECT ...)`  
  - **Suggestion:** Rewrite using anti-join (`LEFT JOIN ... WHERE col IS NULL`).  

- **Detected:** No partition filter on `event_date`.  
  - **Suggestion:** Add `WHERE event_date BETWEEN ...` to enable partition pruning.  

- **Detected:** Large shuffle skew in join on `device_id`.  
  - **Suggestion:** Use bucketing or broadcast join to reduce skew.  

---

## Example dbt Model: Daily Rollup
```sql
select
  query_date,
  approx_percentile(latency_ms, 0.5) as median_latency,
  approx_percentile(bytes_scanned, 0.5) as median_bytes_scanned,
  count(*) as queries
from {{ ref('fact_query_perf') }}
group by query_date
order by query_date desc
