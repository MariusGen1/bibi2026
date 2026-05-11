import Link from "next/link";
import { redirect } from "next/navigation";
import { isOwnerLoggedIn } from "@/lib/owner-auth";
import { loginAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function OwnerLogin({
  searchParams,
}: {
  searchParams: Promise<{ e?: string }>;
}) {
  if (await isOwnerLoggedIn()) {
    redirect("/owner/dashboard");
  }
  const sp = await searchParams;
  const showError = sp.e === "1";

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col px-6 py-10">
      <header className="rise flex items-baseline justify-between">
        <Link href="/" className="display text-2xl">
          Bibi
        </Link>
        <span className="eyebrow">Owner · sign in</span>
      </header>
      <div className="rule mt-4" />

      <section className="rise mt-20">
        <div className="eyebrow">Luigi&#39;s Trattoria</div>
        <h1 className="display mt-3 text-4xl">
          Good evening,
          <br />
          <span className="display-italic">Luigi.</span>
        </h1>
        <p className="mt-5 text-stone">
          Enter the owner passcode to open this week&#39;s feedback.
        </p>

        <form action={loginAction} className="mt-10">
          <label className="eyebrow block">Passcode</label>
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            autoFocus
            className="mt-2 w-full border-b border-ink/30 bg-transparent py-2 text-lg tnum focus:border-tomato focus:outline-none"
            placeholder="••••••"
          />
          {showError && (
            <p className="mt-3 text-sm text-tomato">
              That&#39;s not the right passcode.
            </p>
          )}
          <button
            type="submit"
            className="mt-8 inline-flex w-full items-center justify-center gap-2 bg-ink px-5 py-3 text-paper hover:bg-tomato transition-colors"
          >
            Open dashboard
          </button>
          <p className="eyebrow mt-5 text-center opacity-60">
            Demo passcode: <span className="tnum">luigi</span>
          </p>
        </form>
      </section>
    </main>
  );
}
