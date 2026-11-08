export type RegisterFormValues = {
  name: string;
  secondName: string;
  middleName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type RegisterRequest = {
  name: string;
  second_name: string;
  middle_name: string | null;
  email: string;
  password: string;
};

export type RegisterResponse = {
  id: number;
  name: string;
  second_name: string;
  middle_name: string | null;
  email: string;
};