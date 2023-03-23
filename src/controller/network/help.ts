import { Body, fetch as tauriFetch, FetchOptions } from "@tauri-apps/api/http"
import { insertLog, logStruct } from "../database/models/logs"

export async function fetch<T>(url: string, options?: FetchOptions) {
  const log: Omit<logStruct, "id" | "unix_timestamp">  = {
    log_type: "http_request",
    message: JSON.stringify({url, ...options})
  };
  insertLog(log).catch(err => console.error(err));

  return tauriFetch<T>(url, options)
  .then(response => {
    const log: Omit<logStruct, "id" | "unix_timestamp">  = {
      log_type: "http_response",
      message: JSON.stringify(response)
    };
    insertLog(log).catch(err => console.error(err));

    return response;
  });
};
