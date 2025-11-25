// lib/supabase/middleware.ts (in your SECOND Next.js project)

import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

/**
 * Creates a Supabase client and handles response initialization for Next.js middleware
 * using getAll/setAll pattern for cookies.
 *
 * @param request - The incoming NextRequest object.
 * @returns An object containing the initialized Supabase client and the initial NextResponse object.
 */
export const createSupabaseMiddlewareClient = (request: NextRequest) => {
  // Initialize NextResponse to be used and potentially modified
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Define getAll to retrieve all cookies from the request
        getAll() {
          return request.cookies.getAll();
        },
        // Define setAll to apply cookies to the response
        setAll(cookiesToSet) {
          // Note: We need to recreate the response object here to ensure
          // headers are correctly applied when cookies are set by Supabase.
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Return both the client and the response object
  return { supabase, response };
};
