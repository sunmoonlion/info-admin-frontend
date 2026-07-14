export type CrudSortOrder = "ascend" | "descend";
export type CrudFilterValue = string | number | boolean;

export interface CrudSort {
  field: string;
  order: CrudSortOrder;
}

export interface CrudListParams {
  page: number;
  pageSize: number;
  sort?: CrudSort;
  filters?: Readonly<Record<string, readonly CrudFilterValue[]>>;
}

export interface CrudListResult<Row> {
  items: readonly Row[];
  total: number;
}

export type CrudListAdapter<Row> = (
  params: CrudListParams,
  signal?: AbortSignal,
) => Promise<CrudListResult<Row>>;

export interface CrudListParamsInput {
  page?: number;
  pageSize?: number;
  sortField?: string;
  sortOrder?: CrudSortOrder;
  filters?: Readonly<Record<string, readonly CrudFilterValue[] | undefined>>;
}

/**
 * Normalizes table state before it crosses into a domain list adapter. The
 * template deliberately does not know the API's resource or filter names.
 */
export function createCrudListParams(
  input: CrudListParamsInput = {},
): CrudListParams {
  const page = Number.isFinite(input.page) ? Math.floor(input.page ?? 1) : 1;
  const pageSize = Number.isFinite(input.pageSize)
    ? Math.floor(input.pageSize ?? 20)
    : 20;
  const sort =
    input.sortField && input.sortOrder
      ? { field: input.sortField, order: input.sortOrder }
      : undefined;
  const filters = Object.fromEntries(
    Object.entries(input.filters ?? {})
      .filter((entry): entry is [string, readonly CrudFilterValue[]] =>
        Array.isArray(entry[1]) && entry[1].length > 0,
      )
      .sort(([left], [right]) => left.localeCompare(right)),
  );

  return {
    page: Math.max(1, page),
    pageSize: Math.min(200, Math.max(1, pageSize)),
    ...(sort ? { sort } : {}),
    ...(Object.keys(filters).length > 0 ? { filters } : {}),
  };
}

/** Stable, transport-neutral query encoding for adapters that use URLs. */
export function toCrudQueryParams(params: CrudListParams): URLSearchParams {
  const query = new URLSearchParams({
    page: String(params.page),
    page_size: String(params.pageSize),
  });
  if (params.sort) {
    query.set("sort", params.sort.field);
    query.set("order", params.sort.order === "ascend" ? "asc" : "desc");
  }
  for (const [name, values] of Object.entries(params.filters ?? {})) {
    for (const value of values) query.append(`filter.${name}`, String(value));
  }
  return query;
}
