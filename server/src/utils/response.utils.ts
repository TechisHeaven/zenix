// utils/response.util.ts

import { Response } from "express";

interface SuccessResponse<T> {
  statusCode: number;
  ok: boolean;
  message: string;
  data?: T;
}

export const returnResponse = (status: number, message: string, data?: any) => {
  return (res: Response) => {
    res.status(status).json({ statusCode: status, ok: true, message, data });
  };
};
