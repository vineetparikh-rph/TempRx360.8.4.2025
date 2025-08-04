import { Metadata } from "next";
import ResetPasswordClient from './ResetPasswordClient';

export const metadata: Metadata = {
  title: "Reset Password - TempRx360",
  description: "Reset your TempRx360 account password",
};

export default function ResetPasswordPage() {
  return <ResetPasswordClient />;
}