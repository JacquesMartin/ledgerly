'use client';

import { Button } from '@/components/ui/button';
import { Landmark, ArrowRight, Bot, HandCoins, BookCopy } from 'lucide-react';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';

function AnimatedAvatars() {
  const avatars = PlaceHolderImages.slice(0, 5);
  return (
    <div className="flex -space-x-4 rtl:space-x-reverse">
      {avatars.map((avatar, index) => (
        <Image
          key={avatar.id}
          className="h-12 w-12 rounded-full border-2 border-background"
          src={avatar.imageUrl}
          alt={avatar.description}
          data-ai-hint={avatar.imageHint}
          width={48}
          height={48}
          style={{
            animation: `float 6s ease-in-out infinite`,
            animationDelay: `${index * 0.5}s`,
            zIndex: avatars.length - index,
          }}
        />
      ))}
    </div>
  );
}

const features = [
  {
    icon: HandCoins,
    title: 'Peer-to-Peer Lending',
    description: 'Easily apply for loans from your network or issue loans to others, all in one place.',
  },
  {
    icon: Bot,
    title: 'AI-Powered Assessments',
    description: 'Leverage our AI assistant to get smart recommendations on loan applications (Pro feature).',
  },
  {
    icon: BookCopy,
    title: 'Complete Transaction Ledger',
    description: 'Maintain a clear, chronological record of all your borrowing and lending activities.',
  },
];


export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <Landmark className="h-6 w-6 text-primary" />
              <span className="font-bold">Ledgerly</span>
            </Link>
          </div>
          <nav className="flex flex-1 items-center justify-end space-x-2">
            <Button asChild variant="ghost">
                <Link href="/login">Login</Link>
            </Button>
            <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Link href="/register">Sign Up</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="absolute top-0 left-0 -z-10 h-full w-full bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-4">
                  <h1 className="text-4xl font-bold font-headline tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Modern Loan Management for
                    <br/>
                    <span className="text-primary">Everyone</span>
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Ledgerly simplifies peer-to-peer lending with powerful, easy-to-use tools. Manage applications, track loans, and get AI-powered insights, all in one platform.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                    <Link href="/register">
                      Get Started for Free
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-center">
                 <AnimatedAvatars />
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full bg-secondary/50 py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold font-headline tracking-tighter sm:text-5xl">Key Features</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Everything you need to manage loans within your personal and professional networks.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 lg:gap-16 mt-12">
              {features.map((feature) => (
                 <div key={feature.title} className="grid gap-2">
                    <div className="flex items-center gap-2">
                         <feature.icon className="h-6 w-6 text-accent" />
                         <h3 className="text-lg font-bold">{feature.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="flex w-full shrink-0 flex-col items-center gap-2 border-t px-4 py-6 sm:flex-row md:px-6">
        <p className="text-xs text-muted-foreground">&copy; 2024 Ledgerly. All rights reserved.</p>
      </footer>
       <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
      `}</style>
    </div>
  );
}
