import { PaginatedResponse, PaginationState } from "../types/Response";

export const getErrorMessage = (error: unknown) => {
  let message: string;

  if (error instanceof Error) {
    message = error.message;
  } else if (error && typeof error === "object" && "message" in error) {
    message = String(error.message);
  } else if (typeof error === "string") {
    message = error;
  } else {
    message = "An unknown error has occurred";
  }

  return message;
};

export const getPaginatedResponse = <T>(
  data: T[],
  page: number,
  limit: number,
  totalData: number,
  additionalInfo?: Record<string, any>
): PaginatedResponse<T> => {
  const totalPages = Math.ceil(totalData / limit);
  const startIndex = (page - 1) * limit + 1;
  const endIndex = page * limit > totalData ? totalData : page * limit;

  const paginationState: PaginationState = {
    totalData,
    dataPerpage: limit,
    currentPage: page,
    totalPages,
    startIndex,
    endIndex,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };

  const paginatedResponse: PaginatedResponse<T> = {
    data,
    paginationState,
    additionalInfo,
  };

  return paginatedResponse;
};

export type FileWithFirebase = Express.Multer.File & { firebaseUrl: string };
export type FilesWithFirebase = FileWithFirebase[];
