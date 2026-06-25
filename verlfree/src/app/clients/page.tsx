
"use client";

import Navbar from "@/components/layout/Navbar";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, Zap, Users, BarChart3, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function ClientsPage() {
  const benefits = [
    {
      icon: ShieldCheck,
      title: "Trustless Escrow",
      description: "Funds are locked in a secure contract and only released when success criteria are met.",
    },
    {
      icon: Zap,
      title: "AI-Powered Verification",
      description: "Automated review of deliverables means you don't have to manually check every detail.",
    },
    {
      icon: Users,
      title: "Verified Talent",
      description: "Hire from a pool of freelancers with verified on-chain reputations and histories.",
    },
    {
      icon: BarChart3,
      title: "Instant Analytics",
      description: "Track project progress and spend with real-time data directly from the blockchain.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-32 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6">
            Scale your team with <span className="gradient-text">confidence.</span>
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Eliminate the stress of hiring. VeriFree uses AI to ensure your project requirements are met before a single $GEN token is released.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
              <Link href="/post-job">Post Your First Job</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {benefits.map((benefit, i) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="h-full hover:border-primary/50 transition-colors">
                <CardContent className="pt-8">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                    <benefit.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{benefit.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {benefit.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <section className="bg-card/50 rounded-3xl p-12 border border-border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">How VeriFree protects you</h2>
              <div className="space-y-4">
                {[
                  "Immutable project agreements on-chain",
                  "AI-driven deliverable analysis (code, design, writing)",
                  "Automatic dispute resolution paths",
                  "Lower platform fees (only 5%) compared to web2 rivals",
                ].map((item) => (
                  <div key={item} className="flex gap-3 items-center">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    <span className="text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative aspect-video bg-primary/5 rounded-2xl border border-primary/10 flex items-center justify-center overflow-hidden">
               <div className="text-center p-8">
                  <BarChart3 className="w-16 h-16 text-primary/20 mx-auto mb-4" />
                  <p className="text-sm font-medium text-muted-foreground">Client Analytics Dashboard Preview</p>
               </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
