export type LoginState = {
  errors?: {
    email?: string[];
    password?: string[];
    _form?: string[];
  };
  message?: string;
} | null;

export type ErrorState = {
  email?: string[];
  password?: string[];
  token?: string[];
  _form?: string[];
};

export type SendCodeState = {
  errors?: ErrorState;
  message?: string;
  success?: boolean;
} | null;

export type VerifyCodeState = {
  errors?: ErrorState;
  message?: string;
  success?: boolean;
} | null;

export type UpdatePasswordState = {
  errors?: ErrorState;
  message?: string;
  success?: boolean;
} | null;

export type RegisterState = {
  errors?: {
    name?: string[];
    organizationName?: string[];
    email?: string[];
    password?: string[];
    _form?: string[];
  };
  message?: string;
} | null;
