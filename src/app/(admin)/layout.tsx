"use client";

import React from "react";
import { useUser } from "@clerk/nextjs";
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
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return; // Still loading

    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }

    // TODO: Add user approval check here if needed
    // if (!user.publicMetadata.isApproved) {
    //   router.push("/sign-in?error=not-approved");
    //   return;
    // }
  }, [isLoaded, isSignedIn, user, router]);

  // Show loading while checking authentication
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Don't render anything if not authenticated
  if (!isSignedIn) {
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