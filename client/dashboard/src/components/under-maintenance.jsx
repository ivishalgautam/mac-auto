import React from "react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "./ui/empty";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { Muted } from "./ui/typography";

export default function UnderMaintenance() {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-200">
      <Empty className={"max-w-lg border bg-white"}>
        <EmptyHeader>
          <EmptyMedia variant="icon" className={"bg-red-500/20"}>
            <ExclamationTriangleIcon className="text-red-500" />
          </EmptyMedia>
          <EmptyTitle className={"text-2xl font-bold text-black"}>
            Server upgrade in progress
          </EmptyTitle>
          <EmptyDescription className="font-semibold">
            Access to the DMS portal is temporarily unavailable while your
            server is being upgraded. Please try again later or contact your
            administrator for assistance.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Muted className={"font-medium"}>
            Error code: DMS_SERVER_UPGRADE_REQUIRED
          </Muted>
        </EmptyContent>
      </Empty>
    </div>
  );
}
