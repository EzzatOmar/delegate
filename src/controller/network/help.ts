import { insertLog, logStruct } from "../database/models/logs"

async function toLoggerable(response: Response):Promise<Omit<logStruct, "id" | "unix_timestamp">> {
  const { status, statusText } = response;
  const headers: {[key:string]: string} =[...response.headers.entries()].reduce((acc, [key, value]) => ({...acc, [key]: value}), {});
  if(headers['Authorization']) {
    headers['Authorization'] = `<MASKED>`;
  }
  const contentType = response.headers.get('content-type');
  let body:any = undefined;
  if(contentType === 'application/json') {
    body = await response.json();
  } else if(contentType === 'text/plain') {
    body = await response.text();
  } else if(contentType === 'text/event-stream') {
    body = await response.text();
  }

  return {
    log_type: "http_response",
    message: JSON.stringify({body, status, statusText, headers})
  };
}

export async function fetch(url: string, options: RequestInit) {
  let messageLog = {url, ...options};
  // @ts-ignore
  let contentType = options.headers && options.headers['Content-Type'] || '';
  if(contentType === 'application/json' && options.body) {
    messageLog.body = JSON.parse(options.body as string);
  }

  const log: Omit<logStruct, "id" | "unix_timestamp">  = {
    log_type: "http_request",
    message: JSON.stringify(messageLog)
  };
  insertLog(log).catch(err => console.error(err));

  return window.fetch(url, options)
  .then(async response => {
    const log = await toLoggerable( response.clone() );
    insertLog(log).catch(err => console.error(err));
    return response;
  })

}