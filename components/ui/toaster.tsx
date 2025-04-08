"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        duration: 5000,
        style: {
          background: "white",
          color: "#374151", // text-gray-700
          border: "1px solid #E5E7EB", // border-gray-200
        },
        className: "toast",
      }}
      theme="light"
      richColors
    />
  );
} 