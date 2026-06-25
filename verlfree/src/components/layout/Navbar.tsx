"use client";

import Link from "next/link";
import { Shield, Bell, Menu, X, Wallet } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { HashLoader } from "react-spinners";
import { motion, AnimatePresence } from "framer-motion";
import { usePrivy, useWallets } from "@privy-io/react-auth"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useCheckIfProfileExists } from "@/hooks/useVerifree";
import Modal from "../ui/modal";
import { toast } from "sonner";
import ProfileSetupModal from "@/app/register/page";
import LoginButton from "./loginButton";
export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { wallets, ready } = useWallets();
  const { logout } = usePrivy();
  const embeddedWallet = wallets[0];
  const address = embeddedWallet?.address;
  const user = address ? { uid: address } : null;
  const isUserLoading = false;
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);
  const { isLoading, data: profileExists } = useCheckIfProfileExists(address);

  // Run check whenever address changes
  useEffect(() => {
    if (!address) {
      setHasChecked(false);
      setShowSetupModal(false);
      return;
    }

    // Wait for loading to finish
    if (isLoading) return;

    // Only run once per address
    if (hasChecked) return;

    setHasChecked(true);

    if (profileExists) {
      toast.success("Welcome back!", {
        description: `${address.slice(0, 6)}...${address.slice(-4)}`,
      });
    } else {
      setShowSetupModal(true);
    }
  }, [address, isLoading, profileExists, hasChecked]);


  console.log("Profile Exists: ", profileExists)
  console.log("Address: ", address)

  const [notifications, setNotifications] = useState([
    { id: 1, title: "Job Verified", description: "Your submission for 'NFT Market' was approved.", time: "2m ago" },
    { id: 2, title: "New Job Posted", description: "A client posted a job matching your skills.", time: "1h ago" },
    { id: 3, title: "Payment Received", description: "450 $GEN has been released to your wallet.", time: "3h ago" },
  ]);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "How it Works", href: "/#how-it-works" },
    { name: "For Freelancers", href: "/freelancers" },
    { name: "For Clients", href: "/clients" },
    { name: "Leaderboard", href: "/leaderboard" },
  ];

  if (!mounted) return null;

  return (
    <>
      <Modal
        isOpen={!!address && isLoading}
        onClose={() => { }}
        showCloseButton={false}
        size="sm"
      >
        <div className="flex flex-col items-center gap-4 py-4">
          <HashLoader size={40} color="#3C83F6" />
          <div className="text-center space-y-1">
            <p className="text-sm font-bold text-white">Checking your profile</p>
            <p className="text-xs text-muted-foreground">
              Connecting to GenLayer...
            </p>
          </div>
        </div>
      </Modal>

      {isLoading == false && <ProfileSetupModal
        isOpen={showSetupModal}
        onClose={() => setShowSetupModal(false)}
        address={address || ""}
        onProfileCreated={() => {
          setShowSetupModal(false);
          toast.success("Profile created!", {
            description: "Welcome to VeriFree.",
          });
        }}
      />}


      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "glass-navbar py-3" : "bg-transparent py-5"
          }`}
      >
        <div className="container mx-auto px-4 flex items-center justify-between">
          <Link href="/verifree.png" className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ rotate: 10 }}
              className="flex items-center justify-center"
            >
              <img src="/verifree.png" alt="Verifree logo" className="w-[130px] h-15" />
            </motion.div>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">


            <div className="flex items-center gap-4">
              {address ? <Button variant="outline" className="hidden lg:flex gap-2">
                <Wallet className="w-4 h-4" />
                {address.slice(0, 6)}...{address.slice(-4)}
              </Button> : <LoginButton />}
              {address ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="p-0 h-auto rounded-full ring-2 ring-primary/20 hover:ring-primary/40 transition-all">
                      <Avatar className="w-8 h-8 border border-border">
                        <AvatarImage src={`https://picsum.photos/seed/${user?.uid}/100/100`} />
                        <AvatarFallback>VF</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="font-bold">My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link href="/dashboard">Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link href="/leaderboard">Leaderboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive cursor-pointer">
                      Disconnect Wallet
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <></>
              )}
            </div>

            <button
              className="md:hidden text-foreground ml-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="absolute top-full left-0 right-0 bg-card border-b border-border p-4 md:hidden overflow-hidden shadow-2xl"
            >
              <div className="flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-lg font-bold text-foreground py-3 px-4 hover:bg-primary/10 rounded-xl transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}
                {!address && (
                  <LoginButton />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}

function Badge({ children, variant, className }: { children: React.ReactNode, variant?: string, className?: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${className}`}>
      {children}
    </span>
  );
}
