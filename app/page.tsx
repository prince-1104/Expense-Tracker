import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="max-w-xl text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tight">
          Expense Tracker SaaS
        </h1>
        <p className="text-muted-foreground">
          Track your personal spending with a chat-style interface and rich analytics.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Button asChild>
            <Link href="/signup">Get Started</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/login">Log In</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

