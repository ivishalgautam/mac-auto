import React from "react";
import { Input } from "./ui/input";
import { ChevronDown, Search } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";

export default function Hero() {
  return (
    <section className="bg-gradient-to-b from-slate-50 to-slate-100 py-20">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
              Find the Perfect Tender Opportunities
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Access thousands of government and private tenders from across the
              country. Start your bidding journey today.
            </p>
          </div>
          <div className="w-full max-w-3xl space-y-2">
            <div className="flex w-full max-w-3xl items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search for tenders..."
                  className="w-full bg-white pl-8 shadow-sm"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="bg-white shadow-sm">
                    Category <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                  <DropdownMenuItem>Construction</DropdownMenuItem>
                  <DropdownMenuItem>IT Services</DropdownMenuItem>
                  <DropdownMenuItem>Healthcare</DropdownMenuItem>
                  <DropdownMenuItem>Education</DropdownMenuItem>
                  <DropdownMenuItem>Infrastructure</DropdownMenuItem>
                  <DropdownMenuItem>Defense</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button type="submit" className="shrink-0">
                Search
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Popular: Construction, IT Services, Healthcare, Infrastructure
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
