"use client";
import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function WorkingSignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Prevent browser password breach notifications
    if (window.navigator && window.navigator.credentials) {
      try {
        // Disable credential management temporarily
        window.navigator.credentials.preventSilentAccess?.();
      } catch (err) {
        // Ignore errors
      }
    }

    try {
      console.log('🔐 Attempting login for:', email);
      
      const response = await fetch('/api/manual-signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          password,
        }),
      });

      const data = await response.json();
      console.log('📊 Login response:', data);

      if (data.success) {
        setSuccess(`Welcome back, ${data.user.name}! Redirecting...`);
        
        // Multiple redirect strategies
        setTimeout(() => {
          try {
            window.location.replace('/');
          } catch (err) {
            window.location.href = '/';
          }
        }, 1000);
        
      } else {
        setError(data.error || 'Login failed');
        console.error('❌ Login failed:', data.error);
      }
    } catch (err) {
      console.error('❌ Network error:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="w-full max-w-md sm:pt-10 mx-auto mb-5">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          Back to dashboard
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign In to TempRx360
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your email and password to access the pharmacy monitoring system
            </p>
          </div>
          
          {/* Test Credentials Info */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md dark:bg-blue-900/20 dark:border-blue-800">
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">Available Login Credentials:</h3>
            <div className="text-xs text-blue-800 dark:text-blue-200 space-y-1 max-h-32 overflow-y-auto">
              <div><strong>Admin:</strong> admin@georgiesrx.com / admin123</div>
              <div><strong>Manager:</strong> manager@georgiesrx.com / manager123</div>
              <div><strong>Staff:</strong> staff@georgiesrx.com / staff123</div>
              <div><strong>IT Admin:</strong> itadmin@georgiesrx.com / admin123</div>
              <div><strong>Family Pharmacy:</strong> familyrx@stgeorgesrx.com / pharmacy123</div>
              <div><strong>Parlin Pharmacy:</strong> parlinrx@gmail.com / pharmacy123</div>
              <div><strong>Specialty Pharmacy:</strong> specialtyrx@stgeorgiesrx.com / pharmacy123</div>
              <div><strong>Vineet:</strong> vinitbparikh@gmail.com / pharmacy123</div>
              <div><strong>Rose:</strong> Rose@georgiesrx.com / pharmacy123</div>
            </div>
          </div>

          <div>
            <form onSubmit={handleSubmit} autoComplete="off" data-lpignore="true">
              <div className="space-y-6">
                <div>
                  <Label>
                    Email <span className="text-error-500">*</span>{" "}
                  </Label>
                  <Input 
                    placeholder="admin@georgiesrx.com" 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="username"
                    data-lpignore="true"
                  />
                </div>
                <div>
                  <Label>
                    Password <span className="text-error-500">*</span>{" "}
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      data-lpignore="true"
                      data-form-type="other"
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                      )}
                    </span>
                  </div>
                </div>

                {error && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md dark:bg-green-900/20 dark:border-green-800 dark:text-green-400">
                    {success}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox checked={isChecked} onChange={setIsChecked} />
                    <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                      Keep me logged in
                    </span>
                  </div>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div>
                  <Button 
                    className="w-full" 
                    size="sm" 
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? 'Signing in...' : 'Sign in'}
                  </Button>
                </div>
              </div>
            </form>

            <div className="mt-5 space-y-3">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                Don&apos;t have an account? {""}
                <Link
                  href="/signup"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Sign Up
                </Link>
              </p>
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                Is your pharmacy or healthcare organization facility interested in using TempRx360? {""}
                <Link
                  href="/contact"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400 font-medium"
                >
                  Click Here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}