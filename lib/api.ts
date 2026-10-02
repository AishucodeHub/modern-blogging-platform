import { NextResponse } from "next/server";
import type { PaginatedResponse } from "./types/database";

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}

export function paginatedResponse<T>(
  data: T[],
  page: number,
  perPage: number,
  total: number
) {
  const body: PaginatedResponse<T> = {
    data,
    meta: {
      page,
      perPage,
      total,
      totalPages: Math.ceil(total / perPage),
    },
  };
  return NextResponse.json(body, { status: 200 });
}

export function errorResponse(code: string, message: string, status: number) {
  return NextResponse.json(
    { error: { code, message } },
    { status }
  );
}

export const ApiErrors = {
  unauthorized: () => errorResponse("UNAUTHORIZED", "Authentication required", 401),
  forbidden: () => errorResponse("FORBIDDEN", "You do not have permission to do this", 403),
  notFound: (resource = "Resource") =>
    errorResponse("NOT_FOUND", `${resource} not found`, 404),
  badRequest: (message = "Bad request") =>
    errorResponse("BAD_REQUEST", message, 400),
  internal: () => errorResponse("INTERNAL", "Internal server error", 500),
};
