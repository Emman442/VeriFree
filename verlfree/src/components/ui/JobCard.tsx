import react from "react";
import { Badge } from "@/components/ui/badge";
import { Users, Clock, Check } from "lucide-react";
import { useGetJobApplications, useUserProfile } from "@/hooks/useVerifree";
import { Card, CardContent } from "./card";
import { Button } from "./button";
import Link from "next/link";
import { useWallet } from "../genlayer/wallet";
import { toast } from "sonner";
import { Job } from "@/lib/types/types";
import { usePrivy, useWallets } from "@privy-io/react-auth"

export default function JobCard({ job, setSelectedJob, setIsApplyModalOpen }: { job: Job; setSelectedJob: (job: any) => void; setIsApplyModalOpen: (isOpen: boolean) => void }) {
      const { wallets, ready } = useWallets();
  const { logout } = usePrivy();
  const embeddedWallet = wallets[0];
  const address = embeddedWallet?.address;

    const { data: userProfile } = useUserProfile(address || "")
    const handleOpenApply = (job: any) => {
        if (!address) {
            toast.info("Please connect your wallet to apply for jobs.");
            return;
        }
        setSelectedJob(job);
        setIsApplyModalOpen(true);
    };
    const isOwnJob = Boolean(
        address &&
        job.client &&
        job.client.toLowerCase() === address.toLowerCase()
    );

    const isClient = Boolean(
        address && userProfile && userProfile.role === "client"
    );

    const { data: jobApplications } = useGetJobApplications(job.job_id);
    const applicantCount = jobApplications ? jobApplications.length : 0;

    const isApplied = jobApplications?.some((app: any) => app.applicant
        .toLowerCase() === address?.toLowerCase()
    );

    return (

        <Card
            className="hover:border-primary/50 transition-all group overflow-hidden">
            <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between gap-6">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                            <Badge variant="secondary" className="bg-primary/10 text-primary border-none">
                                {job.category}
                            </Badge>
                            <Badge variant="outline" className="border-border text-muted-foreground">
                                <Users className="w-3 h-3 mr-1" />
                                {applicantCount || 0} applicants
                            </Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1 ml-auto md:ml-0">
                                <Clock className="w-3 h-3" /> {job.deadline}
                            </span>
                        </div>
                        <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                            {job.title}
                        </h3>
                        <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                            {job.description}
                        </p>
                    </div>
                    <div className="flex flex-row md:flex-col justify-between md:items-end gap-4 shrink-0">
                        <div className="text-left md:text-right">
                            <p className="text-2xl font-black text-foreground">{job.escrow_amount} $GEN</p>
                            <p className="text-xs text-muted-foreground uppercase tracking-widest">Fixed Price</p>
                        </div>

                        {isApplied ? (
                            <Button variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20 cursor-default" disabled>
                                <Check className="w-4 h-4 mr-2" />
                                Applied
                            </Button>
                        ) : (
                            <div className="flex gap-2">
                                <Button asChild variant="ghost" className="text-xs">
                                    <Link href={`/jobs/${job.job_id}`}>Details</Link>
                                </Button>
                                <Button onClick={() => handleOpenApply(job)} className="bg-primary px-8" disabled={isOwnJob || isApplied || isClient}>
                                    Apply Now
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}