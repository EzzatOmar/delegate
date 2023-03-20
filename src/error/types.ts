export type ErrorString = string | null;

export type GlobalError = {
  DieselConnectionError?: string;
  DieselError?: string;
  OpenAiError?: {
    code?: string | null;
    message?: string | null;
    param?: string[] | null;
    type?: string | null;
  };
  ServerError?: string;
  UserWarning?: string;
  UserAlert?: string;
  UserInfo?: string;
  ErrorString?: string;
}