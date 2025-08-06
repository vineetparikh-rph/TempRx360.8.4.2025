"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { SidebarProvider } from "@/context/SidebarContext";
import AppSidebar from "@/layout/AppSidebar";
import AppHeader from "@/layout/AppHeader";
import PasswordChangeWrapper from "@/components/auth/PasswordChangeWrapper";
import Backdrop from "@/layout/Backdrop";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // Still loading

    if (!session) {
      router.push("/signin");
      return;
    }

    if (!session.user.isApproved) {
      router.push("/signin?error=not-approved");
      return;
    }
  }, [session, status, router]);

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Don't render anything if not authenticated
  if (!session || !session.user.isApproved) {
    return null;
  }

  return (
    <PasswordChangeWrapper>
      <SidebarProvider>
        <div className="flex h-screen overflow-hidden">
          <AppSidebar />
          <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden transition-all duration-300 ease-in-out lg:ml-[290px]">
            <AppHeader />
            <main className="flex-1 p-4 md:p-6 2xl:p-10">
              <div className="ml-4">
                {children}
              </div>
            </main>
          </div>
          <Backdrop />
        </div>
      </SidebarProvider>
    </PasswordChangeWrapper>
  );
}