import SignUpForm from "@/components/auth/SignUpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Request Access - TempRx360",
  description: "Request access to TempRx360 pharmacy temperature monitoring system",
};

export default function SignUp() {
  return <SignUpForm />;
}
