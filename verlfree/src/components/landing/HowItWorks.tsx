
"use client";

import { motion } from "framer-motion";
import { PlusCircle, FileCheck, Upload, Rocket } from "lucide-react";

const steps = [
  {
    icon: PlusCircle,
    title: "Post a Job",
    desc: "Outline your project and set a budget in $GEN tokens.",
  },
  {
    icon: FileCheck,
    title: "Agree on Criteria",
    desc: "Define SMART success criteria for the AI to verify.",
  },
  {
    icon: Upload,
    title: "Submit Deliverable",
    desc: "Freelancers upload work directly to the platform.",
  },
  {
    icon: Rocket,
    title: "AI Verifies & Pays",
    desc: "Our AI checks the work and releases funds instantly.",
  },
];
export default function HowItWorks() {

  return (
    <section id="how-it-works" className="py-24 bg-card/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">How it works</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Experience the future of freelance work with our trustless automated escrow system.
          </p>
        </div>

        <div className="relative">
          {/* Connector Line for Desktop */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-border to-transparent -translate-y-1/2" />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="bg-background border border-border p-8 rounded-2xl text-center group hover:border-primary/50 transition-all"
              >
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <step.icon className="w-8 h-8 text-primary" />
                </div>
                <div className="text-sm font-bold text-primary mb-2">Step {index + 1}</div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
