"use client";

import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { SendIcon, SquareArrowOutUpRight } from "lucide-react";
import { useState } from "react";

interface FormProps {
  userId: Doc<"users">["_id"];
  conversationId: Doc<"conversations">["_id"];
}

const Form = ({ userId, conversationId }: FormProps) => {
  const [text, setText] = useState<string>("");
  const { mutate, pending } = useApiMutation(api.messages.send);

  const handleSubmit = () => {
    if (text === "") return;
    mutate({
      text: text,
      userId,
      seen: false,
      conversationId,
    })
      .then(() => {
        setText("");
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <div
      className="
            p-2
            bg-[#344CB7]/10
            border-2
            flex 
            items-center 
            gap-2 
            lg:gap-4 
            w-full
            rounded-sm
        "
    >
      <div className="flex items-center gap-2 lg:gap-4 w-full">
        <div className="relative w-full">
          <Input
            placeholder={"Enter message..."}
            className="
                            text-black
                            font-light
                            py-2
                            px-4
                            bg-zinc-50
                            w-full 
                            rounded-sm
                            focus:outline-none
                        "
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
        </div>
        <button
          type="submit"
          className="
                        rounded-full 
                        p-2 
                        bg-[#344CB7]/90 
                        cursor-pointer 
                        hover:bg-[#344CB7] 
                        transition
                    "
          onClick={handleSubmit}
          disabled={pending}
        >
            <SendIcon size={18} className="text-white" />
        </button>
      </div>
    </div>
  );
};

export default Form;
