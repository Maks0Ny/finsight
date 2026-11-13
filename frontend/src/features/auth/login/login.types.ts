export type LoginFormValues = {
  email: string;
  password: string;
  remember: boolean;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  access_token: string;
  refresh_token: string;
  token_type: "bearer";
};
