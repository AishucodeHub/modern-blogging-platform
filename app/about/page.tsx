import type { Metadata } from "next";
import { Feather, PenLine, MessageCircle, Sparkles, Shield, Zap, Heart } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about Inkwell — a modern blogging platform built for writers who care about craft.",
};

const values = [
  {
    icon: PenLine,
    title: "Writing first",
    description: "We believe the best writing tools are the ones that disappear. Our editor gets out of your way so you can focus on what matters: your words.",
  },
  {
    icon: Heart,
    title: "Reader experience",
    description: "Beautiful typography, comfortable reading, and thoughtful design. Every article on Inkwell is a pleasure to read.",
  },
  {
    icon: MessageCircle,
    title: "Community",
    description: "Writing is a conversation. Threaded comments and real-time interactions help you connect with your readers.",
  },
  {
    icon: Shield,
    title: "Privacy & security",
    description: "Your data is yours. We use industry-standard security and row-level access controls to keep your work protected.",
  },
  {
    icon: Zap,
    title: "Fast & modern",
    description: "Built on the latest web technologies for speed and reliability. No bloat, no tracking, just a great writing experience.",
  },
  {
    icon: Sparkles,
    title: "Always evolving",
    description: "We are constantly improving Inkwell with new features and refinements based on writer feedback.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 left-1/3 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          </div>
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20 sm:py-28 text-center">
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Feather className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-foreground mb-6 leading-tight">
              About Inkwell
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
              Inkwell was born from a simple idea: writers deserve a platform
              that respects their craft. A place where words matter more than
              algorithms, where design enhances reading instead of distracting
              from it, and where community feels genuine.
            </p>
          </div>
        </section>

        {/* Story */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground mb-6">
            Our story
          </h2>
          <div className="prose-content space-y-4">
            <p>
              We started Inkwell because we were frustrated with existing
              blogging platforms. They were either too complex, too cluttered
              with ads, or too focused on metrics over meaning. We wanted
              something simpler, something better.
            </p>
            <p>
              So we built it. Inkwell is a clean, typography-focused platform
              that puts the reading and writing experience first. No popups,
              no intrusive ads, no dark patterns. Just beautiful writing and
              thoughtful design.
            </p>
            <p>
              Today, Inkwell is home to writers who care about their craft.
              Whether you are publishing your first essay or your hundredth,
              we are here to help you share your stories with the world.
            </p>
          </div>
        </section>

        {/* Values */}
        <section className="border-t border-border bg-card/50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
            <div className="text-center mb-12">
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground mb-4">
                What we value
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                The principles that guide everything we build.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {values.map((value) => (
                <div
                  key={value.title}
                  className="glass-card rounded-xl p-6"
                >
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <value.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-foreground mb-2">
                    {value.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-border">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Join the Inkwell community
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Start writing today. It is free to join and always will be.
            </p>
            <a
              href="/register"
              className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8 font-medium transition-colors"
            >
              Get started
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
