import { createAppQueryClient } from "@/src/core/query/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import React, { useState } from "react";

export const QueryProvider = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = useState(createAppQueryClient);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

export default QueryProvider;
