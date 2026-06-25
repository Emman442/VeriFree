
"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ShieldCheck, Zap, DollarSign } from "lucide-react";
import Link from "next/link";

export default function Hero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section className="relative pt-32 pb-20 overflow-hidden hero-gradient">
      <div className="container mx-auto px-4 text-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto"
        >
          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6"
          >
            Get Paid. <span className="gradient-text">Automatically.</span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Post a job, agree on criteria, submit your work. Our AI verifies
            delivery and releases payment instantly. no disputes, no delays,
            no middlemen.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Button
              asChild
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-10 h-14 text-lg w-full sm:w-auto transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Link href="/post-job">Post a Job</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-primary/20 hover:bg-primary/10 text-primary font-bold px-10 h-14 text-lg w-full sm:w-auto transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Link href="/jobs">Find Work</Link>
            </Button>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="flex flex-wrap justify-center items-center gap-6 text-sm text-muted-foreground"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span>AI Verified</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              <span>Instant Payout</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-primary" />
              <span>5% Fee Only</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Animated Mockup Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="mt-20 max-w-2xl mx-auto"
        >
          <div className="bg-card border border-border p-6 rounded-2xl shadow-2xl shadow-primary/5 text-left relative group">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold mb-1">Modern React Landing Page</h3>
                <p className="text-sm text-muted-foreground">Budget: 500 $GEN</p>
              </div>
              <Badge variant="outline" className="border-primary/50 text-primary">
                completed
              </Badge>
            </div>

            <div className="space-y-3 mb-6">
              {[
                "Fully responsive layout",
                "Dark mode implemented",
                "Framer Motion animations added",
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-3">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1.5 + i * 0.5 }}
                    className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center"
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-primary" />
                  </motion.div>
                  <span className="text-sm opacity-80">{text}</span>
                </div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 3.5 }}
              className="flex items-center justify-between pt-4 border-t border-border"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-sm font-bold text-green-500">AI Verified Successfully</span>
              </div>
              <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white">
                Funds Released
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
