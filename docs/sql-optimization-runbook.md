# SQL Optimization Runbook for Presto/Trino

## Overview

This runbook provides best practices and optimization patterns for Presto/Trino queries. Use these techniques to reduce query latency, minimize data scanned, and improve overall performance.

## Table of Contents

1. [Partition Pruning](#partition-pruning)
2. [Join Optimization](#join-optimization)
3. [Approximate Aggregations](#approximate-aggregations)
4. [Window Functions](#window-functions)
5. [Storage Layout](#storage-layout)

## Partition Pruning

**Impact: HIGH** - Can reduce scan size by 90%+

Always filter on partition columns (typically `date`, `app_id`, or `region`) to enable partition pruning.

### Bad Example
\`\`\`sql
SELECT user_id, COUNT(*)
FROM events
WHERE event_type = 'click'
GROUP BY user_id;
\`\`\`

### Good Example
\`\`\`sql
SELECT user_id, COUNT(*)
FROM events
WHERE date >= DATE '2025-01-01'
  AND date < DATE '2025-02-01'
  AND event_type = 'click'
GROUP BY user_id;
\`\`\`

## Join Optimization

### Semi-Joins vs IN

Use `EXISTS` (semi-join) instead of `IN` for better performance.

**Bad:**
\`\`\`sql
SELECT * FROM orders
WHERE customer_id IN (SELECT customer_id FROM premium_customers);
\`\`\`

**Good:**
\`\`\`sql
SELECT o.* FROM orders o
WHERE EXISTS (
  SELECT 1 FROM premium_customers pc
  WHERE pc.customer_id = o.customer_id
);
\`\`\`

### Anti-Joins vs NOT IN

Use `LEFT JOIN ... WHERE IS NULL` instead of `NOT IN`.

**Bad:**
\`\`\`sql
SELECT * FROM orders
WHERE customer_id NOT IN (SELECT customer_id FROM cancelled_customers);
\`\`\`

**Good:**
\`\`\`sql
SELECT o.* FROM orders o
LEFT JOIN cancelled_customers cc ON o.customer_id = cc.customer_id
WHERE cc.customer_id IS NULL;
\`\`\`

## Approximate Aggregations

**Impact: MEDIUM** - 10-100x faster on large datasets

Use approximate functions when exact precision is not required.

### approx_distinct()
\`\`\`sql
-- Instead of COUNT(DISTINCT user_id)
SELECT approx_distinct(user_id) as unique_users
FROM events
WHERE date >= DATE '2025-01-01';
\`\`\`

### approx_percentile()
\`\`\`sql
SELECT 
  approx_percentile(latency_ms, 0.5) as p50,
  approx_percentile(latency_ms, 0.95) as p95,
  approx_percentile(latency_ms, 0.99) as p99
FROM query_logs;
\`\`\`

## Window Functions

Optimize window functions by:
1. Filtering data before windowing
2. Reusing window definitions
3. Reducing partition size

### Example
\`\`\`sql
WITH filtered AS (
  SELECT * FROM events
  WHERE date = DATE '2025-01-01'
    AND event_type = 'purchase'
)
SELECT 
  user_id,
  event_time,
  ROW_NUMBER() OVER w as row_num,
  RANK() OVER w as rank
FROM filtered
WINDOW w AS (PARTITION BY user_id ORDER BY event_time);
\`\`\`

## Storage Layout

### Bucketing

Bucket tables on frequently joined columns:

\`\`\`sql
CREATE TABLE events (
  user_id BIGINT,
  event_type VARCHAR,
  event_time TIMESTAMP,
  date DATE
)
WITH (
  partitioned_by = ARRAY['date'],
  bucketed_by = ARRAY['user_id'],
  bucket_count = 256
);
\`\`\`

### Column Selection

**Always specify columns** instead of `SELECT *`:

**Bad:**
\`\`\`sql
SELECT * FROM large_table WHERE date = DATE '2025-01-01';
\`\`\`

**Good:**
\`\`\`sql
SELECT user_id, event_type, event_time
FROM large_table
WHERE date = DATE '2025-01-01';
\`\`\`

## Quick Reference

### High Impact Optimizations
- Add partition filters (date, app_id)
- Use anti-joins instead of NOT IN
- Avoid SELECT * on wide tables

### Medium Impact Optimizations
- Use approx_distinct() for large datasets
- Optimize window function partitions
- Consider table bucketing for joins

### Low Impact Optimizations
- Reuse CTE definitions
- Order predicates by selectivity
- Use UNION ALL instead of UNION when duplicates are acceptable
