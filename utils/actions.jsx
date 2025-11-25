"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

const signInWith = (provider) => async () => {
  const supabase = await createClient();

  // Check if the provider is supported
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      queryParams: {
        access_type: "offline",
        prompt: "consent", // Forces Google to ask for consent again each time
      },
      redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`, // Make sure to set the correct callback URL
    },
  });

  if (data.url) {
    redirect(data.url); // use the redirect API for your server framework
  }

  console.log(data);

  if (error) {
    console.log(error);
  }

  redirect(data.url);
};

// This function is used to sign in with Google using the OAuth provider.
const signinWithGoogle = signInWith("google");

const signOut = async () => {
  try {
    // Get current user ID before sign out
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    console.log(
      "DEBUG: signOut called, typeof window:",
      typeof window,
      "user:",
      user
    );
    if (typeof window !== "undefined" && user?.id) {
      console.log(
        "DEBUG: Sending POST to /api/expert-set-offline for user",
        user.id
      );
      await fetch("/api/expert-set-offline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
        keepalive: true,
      });
      await new Promise((resolve) => setTimeout(resolve, 200));
    } else {
      console.log(
        "DEBUG: Not in browser or no user.id found, not sending offline request"
      );
    }
  } catch (e) {
    console.log("DEBUG: Error in signOut pre-signout logic", e);
    // Ignore errors, proceed with sign out
  }
  const supabase = await createClient();
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error during sign out:", error.message);
      return { error }; // Return the error object
    }
    return { error: null }; // Return success with no error
  } catch (err) {
    console.error("Unexpected error during sign out:", err.message);
    return { error: err }; // Return the caught error
  }
};

// This function is used to sign in with an OTP (One Time Password) sent to the user's email.
const signinWithOtp = async (prev, formData) => {
  const supabase = await createClient();

  const email = formData.get("email");

  if (!email) {
    return {
      success: null,
      error: "Email is required.",
    };
  }

  const { data, error } = await supabase.auth.signInWithOtp({
    email,
  });

  if (error) {
    console.log("error", error);

    return {
      success: null,
      error: error.message,
    };
  }

  redirect(`/verify-otp?email=${email}`);
};

// This function is used to verify the OTP (One Time Password) sent to the user's email.
const verifyOtp = async (prev, formData) => {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.verifyOtp({
    token: formData.get("token"),
    email: formData.get("email"),
    type: "email",
  });

  if (error) {
    console.log("error", error);

    return {
      success: null,
      error: error.message,
    };
  }

  redirect("/");
};

// This function is used to resend an OTP (One Time Password) to the user's email.
const resendOtp = async (prev, formData) => {
  const supabase = await createClient();
  const email = formData.get("email");
  if (!email) {
    return {
      success: null,
      error: "Email is required.",
    };
  }
  const { error } = await supabase.auth.signInWithOtp({ email });
  if (error) {
    return {
      success: null,
      error: error.message,
    };
  }
  return {
    success: "OTP resent to your email.",
    error: null,
  };
};

export { signinWithGoogle, signOut, signinWithOtp, verifyOtp, resendOtp };
