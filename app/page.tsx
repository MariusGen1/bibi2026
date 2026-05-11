import Link from "next/link";
import { ArrowRight, Sparkle, Star } from "@/components/icons";

export default function Home() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-10 sm:py-14">
      {/* masthead */}
      <header className="rise flex items-baseline justify-between">
        <div className="flex items-baseline gap-3">
          <span className="display text-2xl">Bibi</span>
          <span className="eyebrow hidden sm:inline">
            Feedback for restaurants
          </span>
        </div>
        <nav className="flex items-center gap-5 text-sm">
          <Link
            href="/r/luigis"
            className="eyebrow text-stone hover:text-ink"
          >
            See customer flow
          </Link>
          <Link
            href="/owner"
            className="inline-flex items-center gap-1.5 bg-ink px-3 py-2 text-paper hover:bg-tomato transition-colors"
          >
            Owner login
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </nav>
      </header>

      <div className="rule mt-6" />

      {/* hero */}
      <section className="rise mt-14 sm:mt-20 grid grid-cols-12 gap-8">
        <div className="col-span-12 sm:col-span-7">
          <div className="eyebrow">Issue No. 01 · For neighborhood restaurants</div>
          <h1 className="display mt-5 text-[clamp(2.6rem,7.5vw,5.4rem)]">
            Feedback that
            <br />
            <span className="display-italic text-tomato">
              tastes like the meal.
            </span>
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-relaxed text-stone">
            Yelp tells you your stars. Bibi tells you the
            carbonara&#39;s gotten salty since the new line cook started, the
            tiramisu is your best dish and nobody&#39;s ordering it, and the
            fries are coming out cold on Friday nights. Then your AI
            general manager writes it up for Monday morning.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link
              href="/r/luigis"
              className="group inline-flex items-center gap-2 bg-ink px-5 py-3 text-paper hover:bg-tomato transition-colors"
            >
              Try the customer flow
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/owner"
              className="inline-flex items-center gap-2 border border-ink/25 px-5 py-3 hover:border-ink"
            >
              Open the owner dashboard
            </Link>
          </div>

          <p className="eyebrow mt-6 opacity-70">
            Demo restaurant: Luigi&#39;s Trattoria · password{" "}
            <span className="tnum">luigi</span>
          </p>
        </div>

        {/* sample receipt-style card */}
        <aside className="col-span-12 sm:col-span-5">
          <div className="border border-ink/15 bg-mist/40 p-7">
            <div className="flex items-center justify-between">
              <span className="eyebrow flex items-center gap-1.5">
                <Sparkle className="h-3 w-3 text-saffron" />
                Bibi Weekly — No. 18
              </span>
              <span className="eyebrow tnum opacity-70">120 entries</span>
            </div>
            <div className="rule mt-3" />

            <div className="mt-5">
              <div className="eyebrow text-tomato">Fix this week</div>
              <ol className="mt-2 space-y-2 text-[15px]">
                <li>
                  <span className="numeral mr-2">01.</span>
                  Carbonara saltiness — 6 complaints in 14 days, ★3.0
                </li>
                <li>
                  <span className="numeral mr-2">02.</span>
                  Truffle fries coming out cold on weekends
                </li>
                <li>
                  <span className="numeral mr-2">03.</span>
                  Lasagna ratings vary wildly (★2–5)
                </li>
              </ol>
            </div>

            <div className="rule mt-5" />

            <div className="mt-5">
              <div className="eyebrow text-olive">Working</div>
              <ol className="mt-2 space-y-2 text-[15px]">
                <li>
                  <span className="numeral mr-2">01.</span>
                  Tiramisu is ★5 and under-ordered — push it
                </li>
                <li>
                  <span className="numeral mr-2">02.</span>
                  Bar program (esp. Negroni) gets named unprompted
                </li>
              </ol>
            </div>
          </div>
          <p className="eyebrow mt-3 text-center opacity-70">
            ↑ Sample AI summary, written from real feedback
          </p>
        </aside>
      </section>

      {/* three-step */}
      <section className="rise mt-24 sm:mt-32">
        <div className="eyebrow">How it runs</div>
        <div className="rule mt-3" />
        <div className="mt-8 grid grid-cols-12 gap-6 sm:gap-10">
          <Step
            n="01"
            title="QR on the receipt"
            body="Customer scans on their way out. No app, no account. The page opens to your menu — they tap what they ordered."
          />
          <Step
            n="02"
            title="A line per dish"
            body="A star and an optional comment for each item. Then one rating for the evening overall. Average completion: 38 seconds."
          />
          <Step
            n="03"
            title="A discount, by text"
            body="They get a one-time code for their next visit. You get item-level data nobody else collects."
          />
        </div>
      </section>

      {/* what bibi does differently */}
      <section className="rise mt-24 sm:mt-32 grid grid-cols-12 gap-8">
        <div className="col-span-12 sm:col-span-5">
          <div className="eyebrow">Why Bibi exists</div>
          <h2 className="display mt-4 text-4xl sm:text-5xl">
            Yelp reviews
            <br />
            <span className="display-italic">don&#39;t fix dinner.</span>
          </h2>
        </div>
        <div className="col-span-12 sm:col-span-7 space-y-6 text-[17px] leading-relaxed text-stone">
          <p>
            A four-star Google review tells you your customer was vaguely happy.
            It doesn&#39;t tell you the carbonara was salty, the host was
            distracted, or which dishes are paying for the rent.
          </p>
          <p>
            Bibi is the opposite of a review aggregator. The data stays
            private — it&#39;s for you, not for the internet — and it&#39;s
            granular enough to actually change a shift, a recipe, or a hire.
          </p>
          <p className="text-ink">
            <Star filled className="mr-2 inline h-4 w-4 text-tomato" />
            Specific. Private. Actionable. That&#39;s the whole pitch.
          </p>
        </div>
      </section>

      <div className="rule mt-24" />

      <footer className="mt-6 flex flex-wrap items-center justify-between gap-3 pb-10 text-sm text-stone">
        <span>Bibi — built in a weekend, with serifs and pomodoro.</span>
        <span className="eyebrow tnum">© {new Date().getFullYear()}</span>
      </footer>
    </main>
  );
}

function Step({
  n,
  title,
  body,
}: {
  n: string;
  title: string;
  body: string;
}) {
  return (
    <div className="col-span-12 sm:col-span-4">
      <div className="flex items-baseline gap-3">
        <span className="numeral text-4xl leading-none">{n}.</span>
        <span className="display text-2xl">{title}</span>
      </div>
      <div className="rule mt-3" />
      <p className="mt-4 text-[15px] leading-relaxed text-stone">{body}</p>
    </div>
  );
}
