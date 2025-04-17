"use client";
import { useEffect, useMemo } from "react";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { formatDate } from "date-fns";
import { formatNumberWithCommas } from "@/lib/utils";

const statusColors: Record<string, string> = {
  accepted: "text-[#27548A]",
  failed: "text-[#F16767]",
  pending: "text-[#D3CA79]",
  completed: "text-[#5F8B4C]",
};

export function TransactionsTable() {
  const applications = useQuery(api.applications.get, {});
  const currentUser = useQuery(api.users.getCurrentUser);
  const transactions = useQuery(api.transactions.getTransactionByUserId, {
    userId: currentUser?._id as Id<"users">,
  }) as any;

//   useEffect(() => {
//     console.log(transactions, "✅");
//   }, [transactions]);

  const items = useMemo(
    () =>
      transactions
        ?.map((transaction: any) => {
          return {
            id: transaction._id,
            createdAt: transaction._creationTime,
            type: transaction.type,
            description: transaction.description,
            amount: transaction.amount,
            from: transaction.from,
            to: transaction.to ?? "",
            status: transaction.status,
          };
        })
        .filter(Boolean) ?? [],
    [applications]
  );

  const { push } = useRouter();

  return (
    <Table>
      <TableCaption>A list of your recent transactions.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Type</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>From</TableHead>
          <TableHead>To</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item: any, index: number) => (
          <TableRow key={item?.id}>
            <TableCell>{item?.type}</TableCell>
            <TableCell>{item?.description}</TableCell>
            <TableCell>{item?.from}</TableCell>
            <TableCell>{item?.to || "-"}</TableCell>
            <TableCell>{`$${formatNumberWithCommas(item?.amount)}`}</TableCell>
            <TableCell>{formatDate(item?.createdAt, "dd/MM/yyyy")}</TableCell>
            <TableCell
              className={`${statusColors[item?.status as string] || "text-black"}`}
            >
              {item?.status}
            </TableCell>
          </TableRow>
        )).reverse()}
      </TableBody>
    </Table>
  );
}
