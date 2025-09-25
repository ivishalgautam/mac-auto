import { Card, CardContent, CardHeader } from "@/components/ui/card";
import config from "@/config";
import Image from "next/image";
import React from "react";

export default function TodaySchemes({ dashboardData }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {dashboardData.today_schemes?.map((scheme) => (
        <Card
          key={scheme.id}
          className="group shadow-md backdrop-blur-sm transition-all duration-300"
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between"></div>
          </CardHeader>

          <CardContent className="space-y-2">
            <figure className="col-span-2 aspect-[16/8]">
              <Image
                src={`${config.file_base}/${scheme.file[0]}`}
                width={200}
                height={200}
                alt=""
                className="h-full w-full rounded-lg object-cover object-center"
              />
            </figure>

            {/* Message */}
            <div className="border-accent col-span-3 rounded-lg border-l-4 p-3">
              <p className="text-sm">{scheme.message}</p>
            </div>
          </CardContent>
        </Card>
      ))}
      {dashboardData.today_schemes?.map((scheme) => (
        <Card
          key={scheme.id}
          className="group shadow-md backdrop-blur-sm transition-all duration-300"
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between"></div>
          </CardHeader>

          <CardContent className="space-y-2">
            <figure className="col-span-2 aspect-[16/8]">
              <Image
                src={`${config.file_base}/${scheme.file[0]}`}
                width={200}
                height={200}
                alt=""
                className="h-full w-full rounded-lg object-cover object-center"
              />
            </figure>

            {/* Message */}
            <div className="border-accent col-span-3 rounded-lg border-l-4 p-3">
              <p className="text-sm">{scheme.message}</p>
            </div>
          </CardContent>
        </Card>
      ))}
      {dashboardData.today_schemes?.map((scheme) => (
        <Card
          key={scheme.id}
          className="group shadow-md backdrop-blur-sm transition-all duration-300"
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between"></div>
          </CardHeader>

          <CardContent className="space-y-2">
            <figure className="col-span-2 aspect-[16/8]">
              <Image
                src={`${config.file_base}/${scheme.file[0]}`}
                width={200}
                height={200}
                alt=""
                className="h-full w-full rounded-lg object-cover object-center"
              />
            </figure>

            {/* Message */}
            <div className="border-accent col-span-3 rounded-lg border-l-4 p-3">
              <p className="text-sm">{scheme.message}</p>
            </div>
          </CardContent>
        </Card>
      ))}
      {dashboardData.today_schemes?.map((scheme) => (
        <Card
          key={scheme.id}
          className="group shadow-md backdrop-blur-sm transition-all duration-300"
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between"></div>
          </CardHeader>

          <CardContent className="space-y-2">
            <figure className="col-span-2 aspect-[16/8]">
              <Image
                src={`${config.file_base}/${scheme.file[0]}`}
                width={200}
                height={200}
                alt=""
                className="h-full w-full rounded-lg object-cover object-center"
              />
            </figure>

            {/* Message */}
            <div className="border-accent col-span-3 rounded-lg border-l-4 p-3">
              <p className="text-sm">{scheme.message}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
