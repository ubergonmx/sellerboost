"use client";

import { useState } from "react";
import {
  IconChevronRight,
  IconCircleCheckFilled,
  IconCircleDashed,
  IconBrandFacebook,
  IconBuilding,
  // IconUsers,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth/client";
import { createBusiness } from "../actions/create-business";
import { toast } from "sonner";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  icon: React.ComponentType<{ className?: string }>;
}

const initialSteps: OnboardingStep[] = [
  {
    id: "business",
    title: "Create your business",
    description:
      "Set up your business profile to start managing orders and messages from Facebook.",
    completed: false,
    icon: IconBuilding,
  },
  // Team invite step commented out for MVP
  // {
  //   id: "team",
  //   title: "Invite your team",
  //   description:
  //     "Add team members to collaborate on messages and manage orders together.",
  //   completed: false,
  //   icon: IconUsers,
  // },
  {
    id: "facebook",
    title: "Connect your Facebook Page",
    description:
      "Link your Facebook Page to receive messages and manage conversations in one place.",
    completed: false,
    icon: IconBrandFacebook,
  },
];

function CircularProgress({
  completed,
  total,
}: {
  completed: number;
  total: number;
}) {
  const progress = total > 0 ? ((total - completed) / total) * 100 : 0;
  const strokeDashoffset = 100 - progress;

  return (
    <svg
      className="-rotate-90 scale-y-[-1]"
      height="14"
      width="14"
      viewBox="0 0 14 14"
    >
      <circle
        className="stroke-muted"
        cx="7"
        cy="7"
        fill="none"
        r="6"
        strokeWidth="2"
        pathLength="100"
      />
      <circle
        className="stroke-primary"
        cx="7"
        cy="7"
        fill="none"
        r="6"
        strokeWidth="2"
        pathLength="100"
        strokeDasharray="100"
        strokeLinecap="round"
        style={{ strokeDashoffset }}
      />
    </svg>
  );
}

function StepIndicator({ completed }: { completed: boolean }) {
  if (completed) {
    return (
      <IconCircleCheckFilled
        className="mt-1 size-4.5 shrink-0 text-primary"
        aria-hidden="true"
      />
    );
  }
  return (
    <IconCircleDashed
      className="mt-1 size-5 shrink-0 stroke-muted-foreground/40"
      strokeWidth={2}
      aria-hidden="true"
    />
  );
}

interface BusinessFormData {
  name: string;
  slug: string;
}

interface OnboardingWizardProps {
  existingBusinessId?: number | null;
}

export function OnboardingWizard({ existingBusinessId }: OnboardingWizardProps) {
  // Initialize steps based on whether business already exists
  const getInitialSteps = (): OnboardingStep[] => {
    if (existingBusinessId) {
      // Business already exists, mark step 1 as completed
      return initialSteps.map((step) =>
        step.id === "business" ? { ...step, completed: true } : step
      );
    }
    return initialSteps;
  };

  const [currentSteps, setCurrentSteps] = useState<OnboardingStep[]>(getInitialSteps);
  const [openStepId, setOpenStepId] = useState<string | null>(() => {
    const steps = getInitialSteps();
    const firstIncomplete = steps.find((s) => !s.completed);
    return firstIncomplete?.id ?? steps[0]?.id ?? null;
  });
  const [businessForm, setBusinessForm] = useState<BusinessFormData>({
    name: "",
    slug: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdBusinessId, setCreatedBusinessId] = useState<number | null>(
    existingBusinessId ?? null
  );

  // Stop propagation for input events to prevent accordion collapse
  const stopInputPropagation = (e: React.KeyboardEvent | React.MouseEvent) => {
    e.stopPropagation();
  };

  const completedCount = currentSteps.filter((s) => s.completed).length;
  const remainingCount = currentSteps.length - completedCount;

  const handleStepClick = (stepId: string) => {
    const clickedStep = currentSteps.find((s) => s.id === stepId);
    // Only allow clicking on completed steps (to review them)
    // Current incomplete step should stay open and not be collapsible
    if (clickedStep?.completed) {
      setOpenStepId(openStepId === stepId ? null : stepId);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const handleBusinessNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setBusinessForm({
      name,
      slug: generateSlug(name),
    });
  };

  const handleCreateBusiness = async () => {
    if (!businessForm.name.trim() || !businessForm.slug.trim()) {
      toast.error("Please enter a business name");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createBusiness({
        name: businessForm.name.trim(),
        slug: businessForm.slug.trim(),
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (result.business) {
        setCreatedBusinessId(result.business.id);
        setCurrentSteps((prev) =>
          prev.map((s) => (s.id === "business" ? { ...s, completed: true } : s))
        );
        // Move to next step
        const nextStep = currentSteps.find((s) => s.id !== "business" && !s.completed);
        if (nextStep) {
          setOpenStepId(nextStep.id);
        }
        toast.success("Business created successfully!");
      }
    } catch (error) {
      console.error("Error creating business:", error);
      toast.error("Failed to create business");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConnectFacebook = async () => {
    if (!createdBusinessId) {
      toast.error("Please create a business first");
      return;
    }

    try {
      // Use signIn.oauth2 with the "facebook-pages" provider which has
      // the onboarding configId with full page permissions.
      // Account linking is enabled, so this will link to the existing account
      // if the user has the same email.
      await authClient.signIn.oauth2({
        providerId: "facebook-pages",
        callbackURL: `/app/onboarding/callback?businessId=${createdBusinessId}`,
      });
    } catch (error) {
      console.error("Error connecting Facebook:", error);
      toast.error("Failed to connect Facebook");
    }
  };

  const allCompleted = currentSteps.every((s) => s.completed);

  if (allCompleted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-xl text-center">
          <IconCircleCheckFilled className="mx-auto h-16 w-16 text-primary" />
          <h2 className="mt-4 text-2xl font-semibold">You&apos;re all set!</h2>
          <p className="mt-2 text-muted-foreground">
            Your business is ready. Start managing your Facebook messages.
          </p>
          <Button className="mt-6" asChild>
            <a href="/app">Go to Dashboard</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-2 sm:p-4">
      <div className="w-full max-w-xl">
        <div className="rounded-lg border bg-card p-3 sm:p-4 text-card-foreground shadow-xs">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="font-semibold text-foreground text-base sm:text-lg sm:ml-2">
              Welcome to SellerBoost
            </h3>
            <div className="flex items-center">
              <CircularProgress
                completed={remainingCount}
                total={currentSteps.length}
              />
              <div className="ml-1.5 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">
                  {remainingCount}
                </span>{" "}
                out of{" "}
                <span className="font-medium text-foreground">
                  {currentSteps.length} steps
                </span>{" "}
                left
              </div>
            </div>
          </div>

          <div className="space-y-0">
            {currentSteps.map((step, index) => {
              // Find the first incomplete step - it should always be open
              const firstIncompleteStep = currentSteps.find((s) => !s.completed);
              const isCurrentStep = firstIncompleteStep?.id === step.id;

              // Step is open if: it's the current incomplete step OR user clicked on a completed step
              const isOpen = isCurrentStep || (step.completed && openStepId === step.id);

              const isFirst = index === 0;
              const prevStep = currentSteps[index - 1];
              const isPrevOpen = prevStep && (
                currentSteps.find((s) => !s.completed)?.id === prevStep.id ||
                (prevStep.completed && openStepId === prevStep.id)
              );

              const showBorderTop = !isFirst && !isOpen && !isPrevOpen;

              return (
                <div
                  key={step.id}
                  className={cn(
                    "group",
                    isOpen && "rounded-lg",
                    showBorderTop && "border-t border-border"
                  )}
                >
                  <div
                    role={step.completed ? "button" : undefined}
                    tabIndex={step.completed ? 0 : undefined}
                    onClick={() => handleStepClick(step.id)}
                    onKeyDown={(e) => {
                      if (step.completed && (e.key === "Enter" || e.key === " ")) {
                        e.preventDefault();
                        handleStepClick(step.id);
                      }
                    }}
                    className={cn(
                      "block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      step.completed && "cursor-pointer",
                      isOpen && "rounded-lg"
                    )}
                  >
                    <div
                      className={cn(
                        "relative overflow-hidden rounded-lg transition-colors",
                        isOpen && "border border-border bg-muted"
                      )}
                    >
                      <div className="relative flex items-center justify-between gap-3 py-3 pl-4 pr-2">
                        <div className="flex w-full gap-3">
                          <div className="shrink-0">
                            <StepIndicator completed={step.completed} />
                          </div>
                          <div className="mt-0.5 grow">
                            <h4
                              className={cn(
                                "font-semibold",
                                step.completed
                                  ? "text-primary"
                                  : "text-foreground"
                              )}
                            >
                              {step.title}
                            </h4>
                            <div
                              className={cn(
                                "overflow-hidden transition-all duration-200",
                                isOpen ? "h-auto opacity-100" : "h-0 opacity-0"
                              )}
                            >
                              <p className="mt-2 text-sm text-muted-foreground">
                                {step.description}
                              </p>

                              {/* Business creation form */}
                              {step.id === "business" && !step.completed && (
                                <div className="mt-4 space-y-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="business-name">Business Name</Label>
                                    <Input
                                      id="business-name"
                                      placeholder="My Awesome Store"
                                      value={businessForm.name}
                                      onChange={handleBusinessNameChange}
                                      onClick={stopInputPropagation}
                                      onKeyDown={stopInputPropagation}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="business-slug">URL Slug</Label>
                                    <Input
                                      id="business-slug"
                                      placeholder="my-awesome-store"
                                      value={businessForm.slug}
                                      onChange={(e) =>
                                        setBusinessForm((prev) => ({
                                          ...prev,
                                          slug: e.target.value,
                                        }))
                                      }
                                      onClick={stopInputPropagation}
                                      onKeyDown={stopInputPropagation}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                      This will be used for your business URL
                                    </p>
                                  </div>
                                  <Button
                                    size="sm"
                                    className="mt-3"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCreateBusiness();
                                    }}
                                    disabled={isSubmitting || !businessForm.name.trim()}
                                  >
                                    {isSubmitting ? "Creating..." : "Create Business"}
                                  </Button>
                                </div>
                              )}

                              {/* Facebook connection button */}
                              {step.id === "facebook" && !step.completed && (
                                <div className="mt-4">
                                  <Button
                                    size="sm"
                                    className="mt-3"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleConnectFacebook();
                                    }}
                                    disabled={!createdBusinessId}
                                  >
                                    <IconBrandFacebook className="mr-2 h-4 w-4" />
                                    Connect Facebook Page
                                  </Button>
                                  {!createdBusinessId && (
                                    <p className="mt-2 text-xs text-muted-foreground">
                                      Please create your business first
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        {!isOpen && step.completed && (
                          <IconChevronRight
                            className="h-4 w-4 shrink-0 text-muted-foreground"
                            aria-hidden="true"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
