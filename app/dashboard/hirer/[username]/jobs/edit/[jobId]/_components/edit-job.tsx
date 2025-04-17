"use client";

import { Images } from "@/components/images";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { formatDateTime } from "@/lib/utils";
import { useMutation, useQuery } from "convex/react";
import { formatDistanceToNow } from "date-fns";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useDebouncedCallback } from "use-debounce";

interface EditJobProps {
  id: string;
}

export const EditJob = ({ id }: EditJobProps) => {
  const jobId = id as Id<"jobs">;
  const job = useQuery(api.jobs.getJobsById, {
    jobId,
  });
  const updateJob = useMutation(api.jobs.update);
  const currentUser = useQuery(api.users.getCurrentUser);

  const [data, setData] = useState<Doc<"jobs"> | undefined | null>(job);

  const generateUploadUrl = useMutation(api.jobMedia.generateUploadUrl);

  const imageInput = useRef<HTMLInputElement>(null);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const sendImage = useMutation(api.jobMedia.sendImage);

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
          console.error(error);
          toast.error(`Failed to send image`);
        });
      })
    );

    setSelectedImages([]);
    imageInput.current!.value = "";
  }

  const onInput = useDebouncedCallback(
    (value: string | string[] | number, field: string) => {
      updateJob({
        id: jobId,
        field,
        value,
      }).then(() => {
        toast.info(
          `${field.charAt(0).toUpperCase() + field.slice(1)} updated!`
        );
      });
    },
    1000
  );

  const onUpload = useDebouncedCallback(() => {
    handleSendImage(jobId).then(() => {
      toast.info("Images updated successfully!");
    });
  }, 1000);

  useEffect(() => {
    if (job && data === undefined) {
      setData(job);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [job]);

  if (!job || !data || !currentUser) return <div>Loading...</div>;

  return (
    <div className="w-full h-fit p-4 space-y-6 py-8 px-4">
      <Badge variant={"outline"}>
        {`Created: ${formatDistanceToNow(job._creationTime, { addSuffix: true })}`}
      </Badge>
      <div className="w-full space-y-8">
        {job.images.length > 0 && (
          <Images images={job.images} title={job.title} allowDelete={job.status === "completed" || job.status === "cancelled" || currentUser._id !== job.hirerId? false : true} />
        )}
        <div className="space-y-3">
          <Label className="font-normal">Add up to 5 images:</Label>
          <div className="flex space-x-2">
            <Input
              id="image"
              type="file"
              accept="image/*"
              ref={imageInput}
              onChange={(e) => {
                setSelectedImages(Array.from(e.target.files || []));
                onUpload();
              }}
              multiple
              className="cursor-pointer w-fit bg-zinc-100 text-zinc-700 border-zinc-300 hover:bg-zinc-200 hover:border-zinc-400 focus:border-zinc-400 focus:bg-zinc-200"
              disabled={selectedImages.length >= 5 || job.images.length >= 5 || job.status === "completed" || job.status === "cancelled" || currentUser._id !== job.hirerId} 
            />
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <Label className="w-fit">Title</Label>
        <Input
          placeholder="title"
          value={data.title}
          onChange={(e) => {
            setData({ ...data, title: e.target.value });
            onInput(e.target.value, "title");
          }}
          disabled={job.status === "completed" || job.status === "cancelled" || currentUser._id !== job.hirerId}
        />
      </div>
      <div className="space-y-2">
        <Label className="w-fit">Description</Label>
        <Textarea
          placeholder="description"
          value={data.description}
          onChange={(e) => {
            setData({ ...data, description: e.target.value });
            onInput(e.target.value, "description");
          }}
          rows={4}
          disabled={job.status === "completed" || job.status === "cancelled" || currentUser._id !== job.hirerId}
        />
      </div>
      <div className="space-y-2">
        <Label className="w-fit">Budget</Label>
        <Input
          placeholder="budget"
          value={data.budget}
          onChange={(e) => {
            const value = parseInt(e.target.value) || 0;
            setData({ ...data, budget: value });
            onInput(value, "budget");
          }}
          type="number"
          min="50"
          max="10000"
          disabled={job.status === "completed" || job.status === "cancelled" || currentUser._id !== job.hirerId}
        />
      </div>

      <div className="space-y-2">
        <Label className="w-fit">Skills</Label>

        <Input
          placeholder="required skills"
          value={data.requiredskills.join(", ")}
          onChange={(e) => {
            const value = e.target.value
              .split(",")
              .map((skill) => skill.trim());
            setData({ ...data, requiredskills: value });
            onInput(value, "requiredskills");
          }}
          disabled={job.status === "completed" || job.status === "cancelled" || currentUser._id !== job.hirerId}
        />
      </div>
      <div className="space-y-2">
        <Label className="w-fit">
          Deadline: {`${formatDateTime(data.deadline).date}`}
        </Label>
        <Calendar
          mode="single"
          selected={data.deadline ? new Date(data.deadline) : undefined}
          onSelect={(date) => {
            if (date) {
              onInput(date.toISOString(), "deadline");
              setData({ ...data, deadline: date.toISOString() });
            }
          }}
          disabled={job.status === "completed" || job.status === "cancelled" || currentUser._id !== job.hirerId}
          className="w-fit rounded-md border"
        />
      </div>
    </div>
  );
};
