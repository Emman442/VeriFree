"use client";

import { useMemo, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle2, Clock, MessageSquare, ShieldCheck, Users,
  XCircle, Sparkles, Rocket, AlertCircle
} from "lucide-react";
import { useParams } from "next/navigation";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import {
  useAIShortlist,
  useGetJobApplications,
  useGetJobMilestones,
  useJobByID,
  useRaiseDispute,
  useRejectFreelancer,
  useSelectFreelancer,
  useSubmitDeliverable,
  useVerifyAndCompleteJob,
} from "@/hooks/useVerifree";
import { toast } from "sonner";
import { JobMilestone } from "@/lib/types/types";
import { useQueryClient } from "@tanstack/react-query";
import { parseAIVerification } from "@/helpers/parseAIVerificationResult";

export default function JobDetail() {
  const { id } = useParams();
  const { wallets, ready } = useWallets();
  const { logout } = usePrivy();
  const embeddedWallet = wallets[0];
  const address = embeddedWallet?.address;
  const queryClient = useQueryClient();
  // State
  const [deliverableUrl, setDeliverableUrl] = useState("");
  const [deliverableNote, setDeliverableNote] = useState("");
  const [disputeContextUrl, setDisputeContextUrl] = useState("");
  const [disputeExplanation, setDisputeExplanation] = useState("");
  const [isAIReordering, setIsAIReordering] = useState(false);
  const { isFetching: jobLoading, data: jobData } = useJobByID(id as string);
  const { isFetching: isLoadingApplications, data: applications = [] } = useGetJobApplications(id as string);
  const { data: jobMilestones = [] } = useGetJobMilestones(id as string);
  const { mutate: SubmitDeliverable, isPending: isSubmitting } = useSubmitDeliverable();
  const { mutate: selectFreelancer, isPending: isSelectingFreelancer } = useSelectFreelancer();
  const { mutate: rejectFreelancer, isPending: isRejectingFreelancer } = useRejectFreelancer();
  const { mutate: raiseDispute, isPending: isRaisingDispute } = useRaiseDispute();
  const { mutate: runAIVerification, isPending: isVerifying } = useVerifyAndCompleteJob();
  const { mutate: AIShortlist, isPending: isShortlisting } = useAIShortlist();

  // Role checks
  const isClient = address && jobData?.client?.toLowerCase() === address.toLowerCase();
  const isAssignedFreelancer = address && jobData?.freelancer?.toLowerCase() === address.toLowerCase();

  // Derived states
  const activeApplications = applications.filter(
    (app: any) => app.status === "pending" || app.status === "shortlisted"
  );

  const sortedApplications = [...activeApplications].sort((a: any, b: any) => {
    const scoreA = parseFloat(a.ai_score || "0");
    const scoreB = parseFloat(b.ai_score || "0");
    return scoreB - scoreA;
  });

  const highestScore = sortedApplications.length > 0
    ? parseFloat(sortedApplications[0].ai_score || "0")
    : 0;

  const aiResult = useMemo(() => {
    return parseAIVerification(jobData?.ai_reasoning || "");
  }, [jobData?.ai_reasoning]);

  // Handlers
  const handleAIShortlist = async () => {
    await AIShortlist({ job_id: jobData?.job_id || "" }, {
      onSuccess() { toast.success("AI shortlist completed successfully.") },
      onError() { toast.error("AI shortlisting failed.") },
    });
  };

  const handleSelectFreelancer = (appId: string) => {
    selectFreelancer({ job_id: jobData?.job_id || "", freelancer_address: appId });
  };

  const handleRejectApplicant = (appId: string) => {
    rejectFreelancer({ job_id: jobData?.job_id || "", freelancer_address: appId });
  };

  const handleSubmitDeliverable = () => {
    if (!deliverableUrl) return;
    SubmitDeliverable({
      job_id: jobData?.job_id || "",
      deliverable_url: deliverableUrl,
      deliverable_note: deliverableNote,
    }, {
      onSuccess() {
        toast.success("Deliverable submitted successfully.");
        queryClient.invalidateQueries({ queryKey: ["jobByID", id as string] });
      },
      onError() { toast.error("Failed to submit deliverable.") }
    });
  };

  const handleRunAIVerification = () => {
    runAIVerification({ job_id: jobData?.job_id || "" }, {
      onSuccess() { toast.success("AI verification completed.") },
      onError() { toast.error("Failed to run AI verification.") },
    });
  };

  const handleRaiseDispute = () => {
    if (!disputeContextUrl || !disputeExplanation) {
      toast.error("Please provide both context URL and explanation.");
      return;
    }
    raiseDispute({
      job_id: jobData?.job_id || "",
      context_url: disputeContextUrl,
      explanation: disputeExplanation,
    }, {
      onSuccess() { toast.success("Dispute raised successfully.") },
      onError() { toast.error("Failed to raise dispute.") },
    });
  };

  // Loading & Error states
  if (jobLoading && !jobData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-primary font-bold animate-pulse">Synchronizing Node Data...</p>
        </div>
      </div>
    );
  }

  if (!jobData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Job Not Found</h2>
          <Button asChild variant="outline">
            <a href="/jobs">Return to Job Board</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Job Header */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center gap-3 mb-4">
                <Badge className="bg-primary/10 text-primary border-none">{jobData.category}</Badge>
                <Badge variant="outline" className="capitalize">{jobData.status}</Badge>
              </div>
              <h1 className="text-4xl font-extrabold mb-4 tracking-tight">{jobData.title}</h1>
              <p className="text-muted-foreground text-lg leading-relaxed">{jobData.description}</p>
            </motion.div>

            {/* Applications Section - Client Only */}
            {isClient && jobData.status === "active" && (
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    <CardTitle>Applications ({activeApplications.length})</CardTitle>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAIShortlist}
                    disabled={isShortlisting || activeApplications.length === 0}
                  >
                    <Sparkles className={`w-4 h-4 mr-2 ${isShortlisting ? "animate-spin" : ""}`} />
                    {isShortlisting ? "Analyzing..." : "AI Shortlist"}
                  </Button>
                </CardHeader>

                <CardContent className="space-y-4">
                  <AnimatePresence mode="popLayout">
                    {sortedApplications.map((app: any, index: number) => {
                      const aiScore = parseFloat(app.ai_score || "0");
                      const isHighest = index === 0 && aiScore > 0;

                      return (
                        <motion.div
                          key={app.applicant}
                          layout
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`p-4 rounded-xl border transition-all ${isHighest ? "border-yellow-500/50 ring-1 ring-yellow-500/20" : "border-border"}`}
                        >
                          <div className="flex flex-col md:flex-row gap-6">
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <Avatar className="w-8 h-8">
                                    <AvatarFallback>{app.applicant?.slice(2, 4)}</AvatarFallback>
                                  </Avatar>
                                  <span className="font-bold text-sm">{app.applicant}</span>
                                  {isHighest && (
                                    <Badge className="bg-yellow-500 text-black text-[10px]">AI RECOMMENDED</Badge>
                                  )}
                                </div>
                                {aiScore > 0 && (
                                  <div className="text-xs text-yellow-500 font-bold">
                                    Score: {aiScore}
                                  </div>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground italic">"{app.cover_note}"</p>
                            </div>

                            {(app.status === "pending" || app.status === "shortlisted") && (
                              <div className="flex md:flex-col gap-2 justify-end">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-destructive"
                                  onClick={() => handleRejectApplicant(app.applicant)}
                                  disabled={isSelectingFreelancer || isRejectingFreelancer}
                                >
                                  <XCircle className="w-4 h-4 mr-2" /> Reject
                                </Button>
                                <Button
                                  size="sm"
                                  className="bg-primary"
                                  onClick={() => handleSelectFreelancer(app.applicant)}
                                  disabled={isSelectingFreelancer || isRejectingFreelancer}
                                >
                                  <ShieldCheck className="w-4 h-4 mr-2" /> Select
                                </Button>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </CardContent>
              </Card>
            )}

            {/* Deliverable & Verification Section */}
            {(jobData.status === "in_progress" ||
              jobData.status === "pending_review" ||
              jobData.status === "revision_requested") && (
                <Card className="border-primary/20 bg-primary/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Rocket className="w-5 h-5 text-primary" />
                      Deliverable & Verification
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Freelancer Submit */}
                    {isAssignedFreelancer && jobData.status === "in_progress" && (
                      <div className="space-y-4">
                        <div>
                          <Label>Submission URL</Label>
                          <Input
                            placeholder="https://github.com/..."
                            value={deliverableUrl}
                            onChange={(e) => setDeliverableUrl(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>Notes (optional)</Label>
                          <Textarea
                            placeholder="Any additional notes for the client..."
                            value={deliverableNote}
                            onChange={(e) => setDeliverableNote(e.target.value)}
                            rows={4}
                          />
                        </div>
                        <Button
                          onClick={handleSubmitDeliverable}
                          disabled={!deliverableUrl || isSubmitting}
                          className="w-full"
                        >
                          {isSubmitting ? "Submitting..." : "Submit Deliverable"}
                        </Button>
                      </div>
                    )}

                    {/* Client - Run AI Verification */}
                    {isClient && jobData.status === "pending_review" && (
                      <div className="space-y-6">
                        <div className="p-6 bg-card rounded-xl border">
                          <h3 className="font-semibold mb-3">Submitted Deliverable</h3>
                          <p><strong>URL:</strong> {jobData.deliverable_url}</p>
                          {jobData.deliverable_note && <p><strong>Note:</strong> {jobData.deliverable_note}</p>}
                        </div>

                        <Button
                          onClick={handleRunAIVerification}
                          disabled={isVerifying}
                          className="w-full bg-primary py-6 text-lg font-bold"
                        >
                          {isVerifying ? "Running AI Verification..." : "Run AI Verification & Pay"}
                        </Button>
                      </div>
                    )}

                    {/* Freelancer - Being Reviewed */}
                    {isAssignedFreelancer && jobData.status === "pending_review" && (
                      <div className="p-12 text-center border-2 border-dashed border-border rounded-2xl">
                        <ShieldCheck className="w-16 h-16 mx-auto mb-6 text-primary/60" />
                        <h3 className="text-xl font-medium mb-2">Your work is being reviewed</h3>
                        <p className="text-muted-foreground max-w-md mx-auto">
                          The client and AI are currently reviewing your submission.
                          You will be notified once the verification is complete.
                        </p>
                      </div>
                    )}

                    {/* Freelancer - Raise Dispute */}
                    {isAssignedFreelancer && jobData.status === "revision_requested" && (
                      <div className="space-y-6">
                        <div className="p-6 bg-red-500/5 border border-red-500/30 rounded-xl">
                          <h3 className="font-semibold text-red-500 mb-2">Revision Requested</h3>
                          <p className="text-sm">{jobData.ai_reasoning}</p>
                        </div>

                        <div className="space-y-4">
                          <Label>Evidence / Context URL</Label>
                          <Input
                            placeholder="https://..."
                            value={disputeContextUrl}
                            onChange={(e) => setDisputeContextUrl(e.target.value)}
                          />
                          <Label>Your Explanation</Label>
                          <Textarea
                            placeholder="Explain why this should be accepted..."
                            value={disputeExplanation}
                            onChange={(e) => setDisputeExplanation(e.target.value)}
                            rows={5}
                          />
                          <Button
                            onClick={handleRaiseDispute}
                            disabled={isRaisingDispute || !disputeContextUrl || !disputeExplanation}
                            className="w-full"
                          >
                            {isRaisingDispute ? "Raising Dispute..." : "Raise Dispute"}
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

            {/* STANDALONE AI VERDICT CARD - This is the important part */}
            {(jobData.ai_verdict === "passed" || jobData.ai_verdict === "failed") && (
              <Card className={`border ${jobData.ai_verdict === "passed"
                ? "border-green-500/50 bg-green-500/5"
                : "border-red-500/50 bg-red-500/5"
                }`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-lg">
                    {jobData.ai_verdict === "passed" ? (
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-500" />
                    )}
                    AI Verification Result
                    <Badge variant={jobData.ai_verdict === "passed" ? "default" : "destructive"} className="ml-auto">
                      {jobData.ai_verdict.toUpperCase()} • Score: {aiResult?.score || "N/A"}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-0">
                  <div>
                    <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                      {jobData.ai_reasoning || aiResult?.reasoning || "No detailed reasoning provided."}
                    </p>
                  </div>

                  {aiResult?.milestoneChecks?.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3">Milestone Breakdown</h4>
                      <div className="space-y-3">
                        {aiResult.milestoneChecks.map((check: any, i: number) => (
                          <div key={i} className="flex items-start gap-3 text-sm border-l-2 border-muted pl-3">
                            {check.verdict === "YES" ? (
                              <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                            )}
                            <div className="flex-1">
                              <p className="font-medium">{check.item}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{check.milestoneId}</p>
                            </div>
                            <Badge variant={check.verdict === "YES" ? "default" : "destructive"}>
                              {check.verdict}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Project Log */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" /> Project Log
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Clock className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold">Contract Initialized</p>
                      <p className="text-xs text-muted-foreground">Just now</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Contract Details</CardTitle></CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Escrow Amount</span>
                  <span className="font-bold">{jobData.escrow_amount} $GEN</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Deadline</span>
                  <span className="font-bold">{jobData.deadline}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Protocol Fee</span>
                  <span className="font-bold text-primary">5%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Success Criteria</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {jobMilestones.map((c: JobMilestone, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
                    <span className="text-sm">{c.title}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}