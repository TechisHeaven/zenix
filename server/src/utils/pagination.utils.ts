import { PgColumn, PgSelect } from "drizzle-orm/pg-core";

import { SQL } from "drizzle-orm";
import { PAGE_SIZE_LIMIT } from "../constants/main.constants";

export function withPagination<T extends PgSelect>(
  qb: T,
  orderByColumn: PgColumn | SQL | SQL.Aliased,
  page = 1,
  pageSize = PAGE_SIZE_LIMIT
) {
  return qb
    .orderBy(orderByColumn)
    .limit(pageSize)
    .offset((page - 1) * pageSize);
}

// get Columns Dynamic based on table for pagination sorting
export const getSortColumn = (
  table: any,
  columnName: any,
  defaultColumn = "updated_at"
) => {
  return columnName in table ? table[columnName] : table[defaultColumn];
};
