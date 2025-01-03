import MessageResponse from "./message.types";

export default interface ErrorResponse extends MessageResponse {
  stack?: string;
}

export type DecodedJWTBody = {
  user_id: string;
};
