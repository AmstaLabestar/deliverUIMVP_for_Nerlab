import { QueryClientProvider } from "@tanstack/react-query";
import React, { useState } from "react";
import { createAppQueryClient } from "@/src/core/query/queryClient";

export const QueryProvider = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = useState(createAppQueryClient);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};
