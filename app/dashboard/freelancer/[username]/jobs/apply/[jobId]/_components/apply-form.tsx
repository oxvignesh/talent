"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

interface ApplyFormProps {
  username: string;
  jobId: string;
}

const ApplyFormSchema = z.object({
  proposal: z
    .string()
    .min(20, {
      message: "Proposal must be at least 20 characters.",
    })
    .max(20000, {
      message: "Proposal must not be longer than 20000 characters.",
    }),
  proposedRate: z
    .number()
    .min(50, {
      message: "Proposed Rate must be at least 50.",
    })
    .max(10000, {
      message: "Proposed Rate must not be longer than 10000.",
    }),
});

type ApplyFormValues = z.infer<typeof ApplyFormSchema>;

// preview item values
const defaultValues: Partial<ApplyFormValues> = {
  proposal: "",
};

export const ApplyForm = ({ username, jobId }: ApplyFormProps) => {
  const { mutate, pending } = useApiMutation(api.applications.create);
  const currentUser = useQuery(api.users.getCurrentUser);
  const { push } = useRouter();
  const form = useForm<ApplyFormValues>({
    resolver: zodResolver(ApplyFormSchema),
    defaultValues,
    mode: "onChange",
  });

  async function onSubmit(data: ApplyFormValues) {
    if (pending) return;
    try {
      await mutate({
        jobId,
        freelancerId: currentUser?._id,
        proposal: data.proposal,
        proposedRate: data.proposedRate,
      });
      form.reset();
      push(`/dashboard/freelancer/${username}/applications`);
    } catch (error) {
      console.log(error);
      toast.error("Failed to appy for job");
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full h-fit p-4 space-y-8 py-8 px-4"
      >
        <FormField
          control={form.control}
          name="proposal"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Proposal</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Introduce yourself and explain why you are a good fit for this job"
                  {...field}
                  rows={4}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="proposedRate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Proposed Rate </FormLabel>
              <FormControl>
                <Input
                  placeholder="50"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                  type="number"
                  min="50"
                  max="10000"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={pending}
          variant="prime"
          className="w-full"
        >
          Apply
        </Button>
      </form>
    </Form>
  );
};
