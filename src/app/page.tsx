import Link from 'next/link';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function LandingPage() {
  const session = await getServerSession(authOptions);

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
      {/* Navigation - Minimal */}
      <nav className="w-full py-6 px-6 md:px-12 flex justify-between items-center border-b border-gray-100 dark:border-gray-800">
        <div className="font-serif text-2xl font-bold tracking-tight">TrackEasy.</div>
        <div className="flex gap-4 items-center">
          {session ? (
            <Link href="/dashboard" className="text-sm font-medium hover:underline underline-offset-4">
              Dashboard
            </Link>
          ) : (
            <Link href="/login" className="text-sm font-medium hover:underline underline-offset-4">
              Log in
            </Link>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 md:px-12 py-20 md:py-32 flex flex-col items-center text-center max-w-5xl mx-auto">
        <h1 className="font-serif text-6xl md:text-8xl font-medium tracking-tight leading-tight mb-8">
          The new <span className='bg-white text-black'>standard</span> for <br /> <span className="italic underline">order tracking</span>.
        </h1>
        <p className="max-w-xl text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-10 leading-relaxed">
          Create, share, and track orders with effortless simplicity. A minimal tool for modern businesses who value clarity over clutter.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          {session ? (
            <Link
              href="/dashboard"
              className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-full bg-foreground px-8 font-medium text-background transition-all duration-300 hover:opacity-90 sm:w-auto"
            >
              <span className="mr-2">Go to Dashboard</span>
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-full bg-foreground px-8 font-medium text-background transition-all duration-300 hover:opacity-90 sm:w-auto"
            >
              <span className="mr-2">Start Tracking</span>
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          )}
          <Link
            href="#how-it-works"
            className="inline-flex h-12 items-center justify-center rounded-full border border-gray-200 dark:border-gray-800 px-8 font-medium transition-colors hover:bg-gray-50 dark:hover:bg-gray-900 sm:w-auto"
          >
            How it works
          </Link>
        </div>
      </section>

      {/* Feature Section / How it works */}
      <section id="how-it-works" className="px-6 md:px-12 py-24 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <h2 className="font-serif text-4xl md:text-5xl mb-6">Designed for focus.</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-lg">Everything you need to manage orders, nothing you don't. Stripped back to the essentials.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                step: "01",
                title: "Input Details",
                description: "Enter customer information and product details in a distraction-free interface."
              },
              {
                step: "02",
                title: "Generate Link",
                description: "Instantly create a secure, shareable link unique to each order. No logins required for customers."
              },
              {
                step: "03",
                title: "Real-time Updates",
                description: "Update statuses with a click. Customers stay informed without endless email chains."
              }
            ].map((feature) => (
              <div key={feature.step} className="group border-t border-gray-200 dark:border-gray-800 pt-8 transition-colors hover:border-black dark:hover:border-white">
                <span className="font-mono text-sm text-gray-400 mb-4 block">{feature.step}</span>
                <h3 className="font-serif text-2xl mb-3 group-hover:translate-x-1 transition-transform duration-300">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 md:px-12 py-12 border-t border-gray-100 dark:border-gray-800 text-sm text-gray-500 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="font-serif font-bold text-foreground">TrackEasy.</div>
        <div>
          © {new Date().getFullYear()} TrackEasy Inc.
        </div>
      </footer>
    </main>
  );
}
