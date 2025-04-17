"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { ACCEPTED_FILE_TYPES, MAX_FILE_SIZE } from "@/lib/constants";
import { useMutation, useQuery } from "convex/react";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useDebouncedCallback } from "use-debounce";

type Field = "fullname" | "profession" | "skills" | "experience";

export const EditProfile = () => {
  const { mutate: storeUserInfo } = useApiMutation(api.users.store);
  const updateUser = useMutation(api.users.update);
  const currentUser = useQuery(api.users.getCurrentUser);

  const [data, setData] = useState<Doc<"users"> | undefined | null>();

  const generateUploadUrl = useMutation(api.applicationMedia.generateUploadUrl);

  const documentInput = useRef<HTMLInputElement>(null);
  const [document, setDocument] = useState<File>();
  const sendDocument = useMutation(api.applicationMedia.sendDocument);

  async function handleSendImage() {
    if (!currentUser?._id) return;
    if (!document) {
      toast.error("Please upload a document");
      return;
    }
    try {
      // Step 1: Get a short-lived upload URL
      const postUrl = await generateUploadUrl();
      // Step 2: Upload the file to the URL
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": document.type },
        body: document,
      });
      const json = await result.json();
      if (!result.ok) {
        throw new Error(`Upload failed: ${JSON.stringify(json)}`);
      }
      const { storageId } = json;

      await sendDocument({
        storageId,
        format: "application/*",
        userId: currentUser._id,
      });
      setDocument(undefined);
      documentInput.current!.value = "";
    } catch (error) {
      console.log(error);
      toast.error("Failed to upload application");
    }
  }

  const onInput = useDebouncedCallback(
    (value: string | string[] | number, field: Field) => {
      if (currentUser?._id === undefined) return;
      updateUser({
        id: currentUser?._id,
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
    handleSendImage().then(() => {
      toast.info("Document updated successfully!");
    });
  }, 1000);

  //upload resume file on document change

  useEffect(() => {
    if (document) {
      onUpload();
    }
  }, [document]);

  //update username and profileImageUrl if user already exists
  useEffect(() => {
    const updateUser = async () => {
      await storeUserInfo({});
    };
    updateUser();
  }, []);

  useEffect(() => {
    if (currentUser && data === undefined) {
      setData(currentUser);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  if (!data || !currentUser) return <div>Loading...</div>;

  return (
    <div className="w-full h-fit p-4 space-y-6 py-8 px-4">
      <div className="space-y-2">
        <Label className="font-normal text-lg capitalize">
          {currentUser.profession}
        </Label>
        <div className="flex items-center gap-x-2">
          <Avatar className="w-16 h-16">
            <AvatarImage
              src={
                currentUser.profileImageUrl || "https://github.com/shadcn.png"
              }
            />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <div className="flex items-center gap-x-1">
              <div className="capitalize text-md">{currentUser.fullname}</div>

              <span className="relative flex size-2">
                <span
                  className={`absolute inline-flex h-full w-full animate-ping rounded-full  bg-[#5CB338]/80 opacity-75`}
                ></span>
                <span
                  className={`relative inline-flex size-2 rounded-full bg-[#5CB338]`}
                ></span>
              </span>
            </div>
            <div className="capitalize text-sm leading-tight">{`@${currentUser.username}`}</div>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <Label className="font-normal">Upload Resume</Label>

        <Input
          id="application"
          type="file"
          accept=".pdf,.doc,.docx"
          ref={documentInput}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) return;

            if (file.size > MAX_FILE_SIZE) {
              toast.error("File size must be less than 2MB");
              event.target.value = "";
              return;
            }

            if (!Object.keys(ACCEPTED_FILE_TYPES).includes(file.type)) {
              toast.error("File must be a PDF or Word document");
              event.target.value = "";
              return;
            }

            setDocument(file);
          }}
          className="cursor-pointer w-fit bg-zinc-100 text-zinc-700 border-zinc-300 hover:bg-zinc-200 hover:border-zinc-400 focus:border-zinc-400 focus:bg-zinc-200"
        />
      </div>
      <div className="space-y-2">
        <Label className="font-normal">Full Name</Label>
        <Input
          placeholder="fullname"
          value={data.fullname}
          onChange={(e) => {
            setData({ ...data, fullname: e.target.value });
            onInput(e.target.value, "fullname");
          }}
        />
      </div>
      <div className="space-y-2">
        <Label className="w-fit">Profession</Label>
        <Input
          placeholder="profession"
          value={data.profession}
          onChange={(e) => {
            setData({ ...data, profession: e.target.value });
            onInput(e.target.value, "profession");
          }}
        />
      </div>
      <div className="space-y-2">
        <Label className="w-fit">Skills</Label>

        <Input
          placeholder="required skills"
          value={data.skills?.join(", ")}
          onChange={(e) => {
            const value = e.target.value
              .split(",")
              .map((skill) => skill.trim());
            setData({ ...data, skills: value });
            onInput(value, "skills");
          }}
        />
      </div>
      <div className="space-y-2">
        <Label className="w-fit">Experience</Label>
        <Textarea
          placeholder="experience"
          value={data.experience}
          onChange={(e) => {
            setData({ ...data, experience: e.target.value });
            onInput(e.target.value, "experience");
          }}
          rows={4}
        />
      </div>
    </div>
  );
};
