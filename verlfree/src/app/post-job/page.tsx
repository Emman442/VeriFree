
"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { useCreateJob } from "@/hooks/useVerifree";

export default function PostJob() {
  const [step, setStep] = useState(1);
  const { mutate: createJob, isPending: isCreatingJob } = useCreateJob();
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    budget: "",
    deadline: "",
    milestoneText: "",
    isPublic: true
  });

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const handleNext = () => setStep(s => Math.min(s + 1, totalSteps));
  const handleBack = () => setStep(s => Math.max(s - 1, 1));
  
  const handleCreateJob = async () => {
    console.log("Creating job with data:", formData);
  try {
    
    const milestoneTitles = formData.milestoneText
      .split("\n")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    if (milestoneTitles.length === 0) {
      toast.error("Please add at least one milestone / checklist item.");
      return;
    }

    if (!formData.budget || Number(formData.budget) <= 0) {
      toast.error("Please enter a valid $GEN budget.");
      return;
    }

    await createJob({
      job_id: `job-${Date.now()}`,
      title: formData.title,
      description: formData.description,
      category: formData.category,
      budget: formData.budget,
      deadline: formData.deadline,
      is_public: formData.isPublic,
      milestone_titles: milestoneTitles, 
    }, {
      onSuccess(data, variables, onMutateResult, context) {
        toast.success("Your job has been posted and is now live!");
        window.location.href = "/jobs";
      }
    });
  } catch (err) {
    console.error(err);
    toast.error("Something Went Wrogn while creating job. Please try again later.");
  }
};

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-32 pb-20 max-w-3xl">
        <div className="mb-12">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h1 className="text-3xl font-bold">Create a Job</h1>
              <p className="text-muted-foreground">Define your needs and let AI manage the rest.</p>
            </div>
            <span className="text-sm font-medium text-muted-foreground">Step {step} of {totalSteps}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card className="border-border/50">
          <CardContent className="p-8">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <Label htmlFor="title">Job Title</Label>
                    <Input 
                      id="title" 
                      placeholder="e.g. Build a Web3 Dashboard" 
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select onValueChange={(v) => setFormData({...formData, category: v})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Web Development">Web Development</SelectItem>
                        <SelectItem value="Content Writing">Content Writing</SelectItem>
                        <SelectItem value="Design">Design</SelectItem>
                        <SelectItem value="Social Media">Social Media</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="desc">Description</Label>
                    <Textarea 
                      id="desc" 
                      rows={6} 
                      placeholder="Be specific about your requirements..."
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="flex justify-between items-center mb-4">
                    <Label>Success Criteria</Label>
                  </div>
                  <Textarea 
                    rows={10} 
                    placeholder="Enter one criterion per line. This is what the AI will use to verify completion."
                    value={formData.milestoneText
                    }
                    onChange={(e) => setFormData({ ...formData, milestoneText: e.target.value })}

                  />
                  <p className="text-xs text-muted-foreground">
                    Tip: Be as specific as possible (e.g., "Page must load in under 2s" rather than "Fast loading").
                  </p>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Budget (GEN)</Label>
                      <Input 
                        type="number" 
                        placeholder="0.00"
                        value={formData.budget}
                        onChange={(e) => setFormData({...formData, budget: e.target.value})}
                        required={true}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Deadline</Label>
                      <Input 
                        type="date"
                        value={formData.deadline}
                        onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                        required={true}
                      />
                    </div>
                  </div>
                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/20 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <Wallet className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">Safe-Escrow Active</p>
                      <p className="text-xs text-muted-foreground">Your funds will be locked securely until AI verification.</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="space-y-6 text-center"
                >
                  <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10 text-green-500" />
                  </div>
                  <h3 className="text-2xl font-bold">Review & Post</h3>
                  <div className="bg-muted p-6 rounded-xl text-left space-y-4">
                    <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase">Job Title</p>
                      <p className="font-medium">{formData.title || "Untitled Project"}</p>
                    </div>
                    <div className="flex justify-between">
                      <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase">Budget</p>
                        <p className="font-medium text-primary">{formData.budget || "0"} GEN</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase">Deadline</p>
                        <p className="font-medium">{formData.deadline || "Not set"}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase">Criteria</p>
                      <p className="text-sm text-muted-foreground italic line-clamp-3">
                        {formData.milestoneText || "No criteria specified"}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex justify-between mt-10 pt-6 border-t border-border">
              <Button 
                variant="ghost" 
                onClick={handleBack} 
                disabled={step === 1}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              {step < totalSteps ? (
                <Button onClick={handleNext}>
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button className="bg-primary hover:bg-primary/90 px-8" onClick={handleCreateJob} disabled={isCreatingJob}>
                   {isCreatingJob ? "Posting Job..." : "Deposit & Post Job"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
