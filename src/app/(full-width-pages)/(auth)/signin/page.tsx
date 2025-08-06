import WorkingSignInForm from "@/components/auth/WorkingSignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In - TempRx360",
  description: "Sign in to TempRx360 pharmacy temperature monitoring system",
};

export default function SignIn() {
  return <WorkingSignInForm />;
}
