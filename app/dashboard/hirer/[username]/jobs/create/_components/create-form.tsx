"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

interface CreateFormProps {
  username: string;
}

const CreateFormSchema = z.object({
  title: z
    .string()
    .min(20, {
      message: "Title must be at least 20 characters.",
    })
    .max(100, {
      message: "Title must not be longer than 100 characters.",
    }),
  description: z
    .string()
    .min(20, {
      message: "Description must be at least 20 characters.",
    })
    .max(20000, {
      message: "Description must not be longer than 20000 characters.",
    }),
  budget: z
    .number()
    .min(50, {
      message: "Budget must be at least 50.",
    })
    .max(10000, {
      message: "Budget must not be longer than 10000.",
    }),
  requiredskills: z.string().min(20, { message: "Please add more skills" }),
  deadline: z.date(),
});

type CreateFormValues = z.infer<typeof CreateFormSchema>;

// preview item values
const defaultValues: Partial<CreateFormValues> = {
  title: "",
};

export const CreateForm = ({ username }: CreateFormProps) => {
  const { mutate, pending } = useApiMutation(api.jobs.create);

  const { push } = useRouter();

  const generateUploadUrl = useMutation(api.jobMedia.generateUploadUrl);

  const imageInput = useRef<HTMLInputElement>(null);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const sendImage = useMutation(api.jobMedia.sendImage);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  async function handleSendImage(jobId: Id<"jobs">) {
    // Step 1: Get a short-lived upload URL
    const postUrl = await generateUploadUrl();

    await Promise.all(
      selectedImages.map(async (image) => {
        const result = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": image.type },
          body: image,
        });

        const json = await result.json();

        if (!result.ok) {
          throw new Error(`Upload failed: ${JSON.stringify(json)}`);
        }
        const { storageId } = json;
        // Step 3: Save the newly allocated storage id to the database
        await sendImage({
          storageId,
          format: "image",
          jobId,
        }).catch((error) => {
          throw new Error(`Failed to send image: ${error}`);
        });
      })
    );

    setSelectedImages([]);
    imageInput.current!.value = "";
  }

  const form = useForm<CreateFormValues>({
    resolver: zodResolver(CreateFormSchema),
    defaultValues,
    mode: "onChange",
  });

  async function onSubmit(data: CreateFormValues) {
    if (pending) return;
    setIsLoading(true);
    try {
      const jobId = await mutate({
        title: data.title,
        description: data.description,
        budget: data.budget,
        requiredSkills: data.requiredskills
          .split(",")
          .map((skill) => skill.trim())
          .filter((skill) => skill.length > 0),
        deadline: data.deadline.toISOString(),
      });

      if (jobId) {
        await handleSendImage(jobId);
        toast.success(`Job created successfully!`);
        form.reset();
        push(`/dashboard/hirer/${username}/jobs`);
      }
    } catch (error) {
      setIsLoading(false);
      console.log(error);
      toast.error("Failed to create job");
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full h-fit p-4 space-y-8 py-8 px-4"
      >
        <div className="space-y-3">
          <Label className="font-normal">Add up to 5 images:</Label>
          <div className="flex space-x-2">
            <Input
              id="image"
              type="file"
              accept="image/*"
              ref={imageInput}
              onChange={(event) =>
                setSelectedImages(Array.from(event.target.files || []))
              }
              multiple
              className="cursor-pointer w-fit bg-zinc-100 text-zinc-700 border-zinc-300 hover:bg-zinc-200 hover:border-zinc-400 focus:border-zinc-400 focus:bg-zinc-200"
              disabled={selectedImages.length >= 5}
            />
          </div>
        </div>
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Mobile App UI Design" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Designing user interfaces for a healthcare app"
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
          name="budget"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Budget</FormLabel>
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
        <FormField
          control={form.control}
          name="requiredskills"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Required Skills</FormLabel>
              <FormControl>
                <Input
                  placeholder="Photoshop, Illustrator, Figma - use , to separate skills"
                  {...field}
                  type="text"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="deadline"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Required Skills</FormLabel>
              <FormControl>
                <Calendar
                  mode="single"
                  selected={field.value || new Date()}
                  onSelect={field.onChange}
                  className="w-fit rounded-md border"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={pending || isLoading}
          variant="prime"
          className="w-full"
        >
          Create
        </Button>
      </form>
    </Form>
  );
};
