import { Metadata } from "next";
import ForgotPasswordClient from './ForgotPasswordClient';

export const metadata: Metadata = {
  title: "Forgot Password - TempRx360",
  description: "Reset your TempRx360 account password",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordClient />;
}