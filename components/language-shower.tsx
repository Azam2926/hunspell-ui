"use client";

import * as React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/language/LanguageContext";

export default function LanguageShower() {
  const { currentLanguage, isLoading } = useLanguage();

  if (isLoading) {
    return <div>Loading languages...</div>;
  }

  return (
    <Button variant="outline" id="lang-shower" className="w-[200px]">
      <Avatar className="mr-2 h-5 w-5">
        <AvatarImage
          src={`https://avatar.vercel.sh/${currentLanguage?.code}.png`}
          alt={currentLanguage?.code}
          className="grayscale"
        />
        <AvatarFallback>SC</AvatarFallback>
      </Avatar>
      {currentLanguage?.code}
    </Button>
  );
}
