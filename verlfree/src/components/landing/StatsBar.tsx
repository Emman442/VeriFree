
"use client";

import { calculateTotalEscrowFromCompletedJobs } from "@/helpers/calculateTotalEscroeFromCompletedJobs";
import { useGetJobs } from "@/hooks/useVerifree";
import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";

function CountUp({ end, suffix = "", duration = 2 }: { end: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      let startTime: number;
      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
        setCount(Math.floor(progress * end));
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }
  }, [isInView, end, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

export default function StatsBar() {
   const { isFetching, data: jobs } = useGetJobs();
  
    const completedJobs = jobs?.filter(j => j.status === 'completed')
    const totalEscrowed = calculateTotalEscrowFromCompletedJobs(completedJobs || [])
  const stats = [
    { label: "Total Jobs Completed", value: completedJobs?.length || 0, suffix: "" },
    { label: "Total Value Escrowed", value: totalEscrowed, suffix: " $GEN" },
    { label: "Average Payout Time", value: 45, suffix: " Seconds" },
  ];

  return (
    <section className="py-16 border-y border-border bg-background">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center py-8 md:py-0 px-8">
              <div className="text-4xl md:text-5xl font-extrabold mb-2 tracking-tight">
                <CountUp end={stat.value === 4.8 ? 4 : stat.value} suffix={stat.suffix} />
              </div>
              <p className="text-muted-foreground font-medium text-sm uppercase tracking-wider">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
