import React from "react";
import { Alert, AlertDescription, AlertTitle } from "./alert";
import { ShieldAlert } from "lucide-react";

export default function ErrorMessage({ error }) {
  return (
    <Alert variant="destructive">
      <ShieldAlert className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        {error?.message ?? "Something went wrong!"}
        {/* <pre>{JSON.stringify(error?.message, null, 2)}</pre> */}
      </AlertDescription>
    </Alert>
  );
}
