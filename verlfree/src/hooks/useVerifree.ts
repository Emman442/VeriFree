"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import VeriFree from "../lib/contracts/Verifree"
import { getContractAddress } from "../components/genlayer/client";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import type { Job, JobApplication, UserProfile } from "../lib/types/types";
import { toast } from "sonner";


export function useVeriFreeContract(): VeriFree | null {
    const { wallets, ready } = useWallets();
    const { logout } = usePrivy();
    const embeddedWallet = wallets[0];
    const address = embeddedWallet?.address;
    const contractAddress = getContractAddress();

    return useMemo(() => {
        if (!contractAddress || !address) {
            return null;
        }
        return new VeriFree(contractAddress, address);
    }, [contractAddress, address]);
}

export function useCheckIfProfileExists(account_address: string | null) {
    const contract = useVeriFreeContract();

    return useQuery<boolean, Error>({
        queryKey: ["profileExists", account_address],
        queryFn: async () => {
            if (!account_address) return false;
            if (!contract) throw new Error("Contract not initialized");

            return await contract.CheckIfProfileExists(account_address);
        },
        enabled: !!account_address && !!contract,
        retry: false,
    });
}

export function useUserProfile(account_address: string) {
    const contract = useVeriFreeContract();

    return useQuery<UserProfile, Error>({
        queryKey: ["userProfile", account_address],
        queryFn: () => {
            if (!contract) {
                throw new Error("Contract not initialized");
            }
            return contract.getUserProfile(account_address);
        },
    });
}

export function useJobByID(job_id: string) {
    const contract = useVeriFreeContract();

    return useQuery<Job, Error>({
        queryKey: ["jobByID", job_id],
        queryFn: () => {
            if (!contract) {
                throw new Error("Contract not initialized");
            }
            return contract.getJobByID(job_id);
        },
    });
}



export function useCreateProfile() {
    const contract = useVeriFreeContract();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            username,
            bio,
            role,
        }: {
            username: string;
            bio: string;
            role: "client" | "freelancer";
        }) => {
            if (!contract) {
                throw new Error("Contract not initialized");
            }

            const receipt = await contract.createProfile(username, bio, role);
            console.log("Profile creation transaction receipt:", receipt);
            return receipt;
        },

        onSuccess: async (_, variables) => {
            // refresh any relevant reads after profile creation
            await queryClient.invalidateQueries({
                queryKey: ["profileExists"],
            });

            await queryClient.invalidateQueries({
                queryKey: ["profile"],
            });
        },
    });
}

export function useCreateJob() {
    const contract = useVeriFreeContract();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            job_id,
            title,
            description,
            category,
            budget,
            deadline,
            is_public,
            milestone_titles,
        }: {
            job_id: string;
            title: string;
            description: string;
            category: string;
            budget: string;
            deadline: string;
            is_public: boolean;
            milestone_titles: string[];
        }) => {
            if (!contract) {
                throw new Error("Contract not initialized");
            }

            const receipt = await contract.createJob(job_id, title, description, category, budget, deadline, is_public, milestone_titles);
            console.log("Job creation transaction receipt:", receipt);
            return receipt;
        },

        onSuccess: async (_, variables) => {
            await queryClient.invalidateQueries({
                queryKey: ["job_created"],
            });

            await queryClient.invalidateQueries({
                queryKey: ["jobs"],
            });
        },
        onError: async (error) => {
            console.error("Error creating job:", error);
            toast.error("Failed to create job. Please try again.");
        }
    });
}

export function useApplyToJob() {
    const contract = useVeriFreeContract();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            job_id,
            cover_note,
        }: {
            job_id: string;
            cover_note: string;
        }) => {
            if (!contract) {
                throw new Error("Contract not initialized");
            }
            const receipt = await contract.ApplyForJob(job_id, cover_note);
            console.log("Job application transaction receipt:", receipt);
            return receipt;
        },

        onSuccess: async (_, variables) => {
            await queryClient.invalidateQueries({
                queryKey: ["job_applications"],
            });
        },
    });
}

export function useGetJobApplications(job_id: string) {
    const contract = useVeriFreeContract();

    return useQuery({
        queryKey: ["job_applications", job_id],
        queryFn: async () => {
            if (!contract) {
                throw new Error("Contract not initialized");
            }
            return contract.getJobApplications(job_id);
        },
        enabled: !!contract,
    });
}

export function useGetJobs() {
    const contract = useVeriFreeContract();

    return useQuery({
        queryKey: ["jobs"],
        queryFn: async () => {
            if (!contract) {
                throw new Error("Contract not initialized");
            }
            return contract.getAllJobs();
        },
        enabled: !!contract,
    });
}


export function useGetJobMilestones(job_id: string) {
    const contract = useVeriFreeContract();

    return useQuery({
        queryKey: ["job_milestones", job_id],
        queryFn: async () => {

            if (!contract) {
                throw new Error("Contract not initialized");
            }
            return contract.getJobMilestones(job_id);
        },
        enabled: !!contract && !!job_id,
    });
}

export function useGetFreelancerJobs(freelancer_address: string) {
    const contract = useVeriFreeContract();

    return useQuery<Job[], Error>({
        queryKey: ["freelancer_jobs", freelancer_address],
        queryFn: async () => {
            if (!contract) {
                throw new Error("Contract not initialized");
            }
            return contract.getFreelancerJobs(freelancer_address);
        },
        enabled: !!contract && !!freelancer_address,
    });
}


export function useGetFreelancerApplications(freelancer_address: string) {
    const contract = useVeriFreeContract();
    return useQuery<JobApplication[], Error>({
        queryKey: ["freelancer_applications", freelancer_address],
        queryFn: async () => {
            if (!contract) {
                throw new Error("Contract not initialized");
            }
            return contract.getFreelancerApplications(freelancer_address);
        },
        enabled: !!contract && !!freelancer_address,
    });
}

export function useGetClientJobs(client_address: string) {
    const contract = useVeriFreeContract();

    return useQuery<Job[], Error>({
        queryKey: ["client_jobs", client_address],
        queryFn: async () => {
            if (!contract) {
                throw new Error("Contract not initialized");
            }
            return contract.getClientJobs(client_address);
        },
        enabled: !!contract && !!client_address,
    });
}

export function useSubmitDeliverable() {
    const contract = useVeriFreeContract();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            job_id,
            deliverable_url,
            deliverable_note,
        }: {
            job_id: string;
            deliverable_url: string;
            deliverable_note: string;
        }) => {
            if (!contract) {
                throw new Error("Contract not initialized");
            }
            return contract.submitDeliverable(job_id, deliverable_url, deliverable_note);
        },

        onSuccess: async (_, variables) => {
            await queryClient.invalidateQueries({
                queryKey: ["job_applications"],
            });
        },
    });
}

export function VerifyMilestone() {
    const contract = useVeriFreeContract();
    const queryClient = useQueryClient();


    return useMutation({
        mutationFn: async ({
            job_id,
            milestone_id,
            proof_url,

        }: {
            job_id: string;
            milestone_id: string;
            proof_url: string;

        }) => {
            if (!contract) {
                throw new Error("Contract not initialized");
            }
            return contract.verifyMilestone(job_id, milestone_id, proof_url);
        },

        onSuccess: async (_, variables) => {
            await queryClient.invalidateQueries({
                queryKey: ["job_applications"],
            });
        },
    });
}

export function useVerifyAndCompleteJob() {
    const contract = useVeriFreeContract();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            job_id,

        }: {
            job_id: string;

        }) => {
            if (!contract) {
                throw new Error("Contract not initialized");
            }
            return contract.verifyAndPay(job_id);
        },

        onSuccess: async (_, variables) => {
            await queryClient.invalidateQueries({
                queryKey: ["job_applications"],
            });
            await queryClient.invalidateQueries({
                queryKey: ["jobs"],
            });
        },
    });
}

export function useRaiseDispute() {
    const contract = useVeriFreeContract();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            job_id,
            context_url,
            explanation
        }: {
            job_id: string;
            context_url: string;
            explanation: string;
        }) => {
            if (!contract) {
                throw new Error("Contract not initialized");
            }
            return contract.raiseDispute(job_id, context_url, explanation);
        },

        onSuccess: async (_, variables) => {
            await queryClient.invalidateQueries({
                queryKey: ["job_applications"],
            });
        },
    });
}




export function useSelectFreelancer() {

    const contract = useVeriFreeContract();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            job_id,
            freelancer_address,
        }: {
            job_id: string;
            freelancer_address: string;
        }) => {
            if (!contract) {
                throw new Error("Contract not initialized");
            }
            return contract.selectApplication(job_id, freelancer_address);


        },
        onSuccess: async (_, variables) => {
            await queryClient.invalidateQueries({
                queryKey: ["job_applications"],
            });
            await queryClient.invalidateQueries({
                queryKey: ["jobs"],
            });
        },
    });
}

export function useRejectFreelancer() {

    const contract = useVeriFreeContract();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            job_id,
            freelancer_address,
        }: {
            job_id: string;
            freelancer_address: string;
        }) => {
            if (!contract) {
                throw new Error("Contract not initialized");
            }
            return contract.rejectApplication(job_id, freelancer_address);

        },
        onSuccess: async (_, variables) => {
            await queryClient.invalidateQueries({
                queryKey: ["job_applications"],
            });
        },
    });
}

export function useAIShortlist() {

    const contract = useVeriFreeContract();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            job_id,
        }: {
            job_id: string;
        }) => {
            if (!contract) {
                throw new Error("Contract not initialized");
            }
            return contract.aiShortlist(job_id);

        },
        onSuccess: async (_, variables) => {
            await queryClient.invalidateQueries({
                queryKey: ["job_applications"],
            });
        }
    });
}