"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FormInput } from "@/components/form";
import { LogoIcon } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import {
  type SignUpFormInput,
  type SignUpFormOutput,
  signUpSchema,
} from "@/features/auth/schemas/auth";
import { signUpAction } from "../actions/actions";
import { signInWithFacebook, signInWithGoogle } from "@/lib/auth/client";

export default function SignUpPage() {
  const form = useForm<SignUpFormInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstname: "",
      lastname: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: SignUpFormInput) {
    // zodResolver ensures data is transformed to output type
    const res = await signUpAction(data as SignUpFormOutput);

    if (res?.success === false) {
      toast.error(res.error || "Failed to create account");
    } else {
      // If signUpAction succeeds, it will redirect server-side
      // So we only handle errors here
      form.reset();
      toast.success("Account created successfully!");
    }
  }

  return (
    <section className="flex min-h-screen bg-zinc-50 px-4 py-16 md:py-32 dark:bg-transparent">
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="bg-card m-auto h-fit w-full max-w-sm rounded-[calc(var(--radius)+.125rem)] border p-0.5 shadow-md dark:[--color-muted:var(--color-zinc-900)]"
      >
        <div className="p-8 pb-6">
          <div>
            <Link href="/" aria-label="go home">
              <LogoIcon />
            </Link>
            <h1 className="mb-1 mt-4 text-xl font-semibold">
              Create a SellerBoost Account
            </h1>
            <p className="text-sm">Welcome! Create an account to get started</p>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => signInWithGoogle()}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="0.98em"
                height="1em"
                viewBox="0 0 256 262"
              >
                <path
                  fill="#4285f4"
                  d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622l38.755 30.023l2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
                ></path>
                <path
                  fill="#34a853"
                  d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055c-34.523 0-63.824-22.773-74.269-54.25l-1.531.13l-40.298 31.187l-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
                ></path>
                <path
                  fill="#fbbc05"
                  d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82c0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602z"
                ></path>
                <path
                  fill="#eb4335"
                  d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0C79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
                ></path>
              </svg>
              <span>Google</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => signInWithFacebook()}
            >
              <svg viewBox="0 0 666.667 666.667" width="1em" height="1em">
                <defs>
                  <clipPath
                    id="facebook_icon__b"
                    clipPathUnits="userSpaceOnUse"
                  >
                    <path d="M0 700h700V0H0Z" />
                  </clipPath>
                </defs>
                <g
                  clipPath="url(#facebook_icon__b)"
                  transform="matrix(1.33333 0 0 -1.33333 -133.333 800)"
                >
                  <path
                    d="M0 0c0 138.071-111.929 250-250 250S-500 138.071-500 0c0-117.245 80.715-215.622 189.606-242.638v166.242h-51.552V0h51.552v32.919c0 85.092 38.508 124.532 122.048 124.532 15.838 0 43.167-3.105 54.347-6.211V81.986c-5.901.621-16.149.932-28.882.932-40.993 0-56.832-15.528-56.832-55.9V0h81.659l-14.028-76.396h-67.631v-171.773C-95.927-233.218 0-127.818 0 0"
                    style={{
                      fill: "#0866ff",
                      fillOpacity: 1,
                      fillRule: "nonzero",
                      stroke: "none",
                    }}
                    transform="translate(600 350)"
                  />
                  <path
                    d="m0 0 14.029 76.396H-67.63v27.019c0 40.372 15.838 55.899 56.831 55.899 12.733 0 22.981-.31 28.882-.931v69.253c-11.18 3.106-38.509 6.212-54.347 6.212-83.539 0-122.048-39.441-122.048-124.533V76.396h-51.552V0h51.552v-166.242a250.559 250.559 0 0 1 60.394-7.362c10.254 0 20.358.632 30.288 1.831V0Z"
                    style={{
                      fill: "#fff",
                      fillOpacity: 1,
                      fillRule: "nonzero",
                      stroke: "none",
                    }}
                    transform="translate(447.918 273.604)"
                  />
                </g>
              </svg>
              <span>Facebook</span>
            </Button>
          </div>

          <hr className="my-4 border-dashed" />

          <FieldGroup>
            <div className="grid grid-cols-2 gap-3">
              <FormInput
                control={form.control}
                name="firstname"
                label="Firstname"
              />
              <FormInput
                control={form.control}
                name="lastname"
                label="Lastname"
              />
            </div>

            <FormInput control={form.control} name="email" label="Email" />

            <FormInput
              control={form.control}
              name="password"
              label="Password"
              type="password"
            />

            <Button className="w-full" type="submit">
              Continue
            </Button>
          </FieldGroup>
        </div>

        <div className="bg-muted rounded-lg border p-3">
          <p className="text-accent-foreground text-center text-sm">
            Have an account ?
            <Button asChild variant="link" className="px-2">
              <Link href="/login">Sign In</Link>
            </Button>
          </p>
        </div>
      </form>
    </section>
  );
}
