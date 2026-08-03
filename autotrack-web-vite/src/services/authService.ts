import { apiGet, apiPost } from "./api";

export type RegisterRequest = {
  email: string;
  password: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type ForgotPasswordRequest = {
  email: string;
};

export type ResetPasswordRequest = {
  token: string;
  newPassword: string;
};

export type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
};

export type UserProfile = {
  id: number;
  email: string;
  isEmailConfirmed: boolean;
  createdAt: string;
};

type MessageResponse = {
  message?: string;
};

export function register(data: RegisterRequest) {
  return apiPost<MessageResponse>("auth/register", data);
}

export function login(data: LoginRequest) {
  return apiPost<MessageResponse>("auth/login", data);
}

export function logout() {
  return apiPost<MessageResponse>("auth/logout", {});
}

export function confirmEmail(token: string) {
  return apiPost<MessageResponse>("auth/confirm-email", { token });
}

export function forgotPassword(email: string) {
  const payload: ForgotPasswordRequest = { email };
  return apiPost<MessageResponse>("auth/forgot-password", payload);
}

export function resetPassword(token: string, newPassword: string) {
  const payload: ResetPasswordRequest = { token, newPassword };
  return apiPost<MessageResponse>("auth/reset-password", payload);
}

export function getMe() {
  return apiGet<UserProfile>("auth/me");
}

export function changePassword(currentPassword: string, newPassword: string) {
  const payload: ChangePasswordRequest = { currentPassword, newPassword };
  return apiPost<MessageResponse>("auth/change-password", payload);
}
