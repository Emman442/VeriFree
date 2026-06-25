
"use client";

import { useMemo, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Search, Filter, Clock, Sparkles, } from "lucide-react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { toast } from "sonner";
import { useGetJobs, useApplyToJob } from "@/hooks/useVerifree";
import JobCard from "@/components/ui/JobCard";
import Link from "next/link";


export default function JobBoard() {
  const { isFetching, data: jobs } = useGetJobs()
  const { wallets, ready } = useWallets();
  const { logout } = usePrivy();
  const embeddedWallet = wallets[0];
  const address = embeddedWallet?.address;
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [coverNote, setCoverNote] = useState("");
  const { mutate: ApplyToJob, isPending: isApplying } = useApplyToJob()


  const handleApply = async () => {
    try {
      if (!address) {
        toast.info("Please connect your wallet to apply for jobs.");
        return;
      }
      await ApplyToJob({
        job_id: selectedJob.job_id,
        cover_note: coverNote,
      }, {
        onSuccess(data, variables, onMutateResult, context) {
          setIsApplyModalOpen(false);
          setCoverNote("");
          setSelectedJob(null);
          toast.success("Weldone! Your application has been submitted to the client.")
        },
      });

    } catch (error) {
      console.error("Failed to apply to job:", error);
      toast.error("Failed to submit application. Please try again.");
    } finally {
    }

  };

  // Add this near the top of your component, after the hooks
  const displayedJobs = useMemo(() => {
    if (!jobs) return [];
    return [...jobs].reverse();        // Create a copy first, then reverse
  }, [jobs]);

  const activeJobs = jobs?.filter(j => j.status === 'active')

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
          <div className="max-w-xl w-full">
            <h1 className="text-4xl font-bold mb-4 tracking-tight">Job Board</h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input className="pl-11 h-12 bg-card border-border/50" placeholder="Search jobs, skills, or keywords..." />
            </div>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Button variant="outline" className="h-12">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
            <Button className="h-12 bg-primary">Search</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="hidden md:block space-y-8">
            <div>
              <h3 className="font-bold mb-4 uppercase text-xs tracking-widest text-primary/80">Category</h3>
              <div className="space-y-2">
                {["Web Development", "Design", "Content Writing", "Video Editing"].map(cat => (
                  <label key={cat} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
                    <input type="checkbox" className="rounded border-border bg-card text-primary focus:ring-primary" />
                    {cat}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-bold mb-4 uppercase text-xs tracking-widest text-primary/80">Budget ($GEN)</h3>
              <div className="space-y-4">
                <input type="range" className="w-full accent-primary" min="0" max="5000" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0 $GEN</span>
                  <span>5000+ $GEN</span>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-3 space-y-4">
            {activeJobs?.map((job, i) => {
              return (
                <motion.div
                  key={job.job_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >

                  <JobCard job={job} setSelectedJob={setSelectedJob} setIsApplyModalOpen={setIsApplyModalOpen} />

                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      <Dialog open={isApplyModalOpen} onOpenChange={setIsApplyModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Apply for {selectedJob?.title}
            </DialogTitle>
            <DialogDescription>
              Submit your cover note to the client. This will build your on-chain reputation.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Cover Note</h4>
              <Textarea
                placeholder="Why are you the best fit for this project? Mention relevant experience..."
                value={coverNote}
                onChange={(e) => setCoverNote(e.target.value)}
                rows={6}
                className="resize-none"
              />
            </div>
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl flex items-start gap-3 text-xs text-muted-foreground">
              <Clock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <p>Applications are processed by the protocol. Your reputation builds upon verified completion.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsApplyModalOpen(false)}>Cancel</Button>
            <Button
              onClick={handleApply}
              disabled={!coverNote}
              className="bg-primary min-w-[140px]"
            >
              {isApplying ? "Submitting..." : "Submit Application"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
