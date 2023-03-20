
// TODO: Add more error types https://platform.openai.com/docs/guides/error-codes/api-errors
#[derive(Debug)]
pub enum OpenAiError {
  InvalidAuthentication(String),
  IncorrectApiKey(String),
  UndefinedError(String),
}

#[derive(Debug)]
pub enum GlobalError {
  DieselConnectionError(diesel::ConnectionError), // TODO: remove after diesel is removed
  DieselError(diesel::result::Error), // TODO: remove after diesel is removed
  OpenAiError(OpenAiError),
  ServerError(String),
  ParseError(String),
  UserWarning(String), // this error is explicitly to show the user a warning message
  UserAlert(String), // this error is explicitly to show the user an alert message
  UserInfo(String), // this error is explicitly to show the user an info message
}

impl std::fmt::Display for GlobalError {
  fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
      write!(f, "{:?}", self)
      // or, alternatively:
      // fmt::Debug::fmt(self, f)
  }
}