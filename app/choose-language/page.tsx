"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const languages = [
  { id: "en", name: "English", label: "United Kingdom", flag: "GB" },
  { id: "fr", name: "France", label: "France", flag: "FR" },
];

export default function ChooseLanguagePage() {
  const router = useRouter();
  const [selected, setSelected] = useState("en");

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fcf1e2] px-4">
      <div className="w-full max-w-[520px]">
        <h1 className="mb-10 text-center text-[32px] font-semibold text-[#202124]">Choose Language</h1>
        <div className="space-y-4">
          {languages.map((language) => (
            <button
              key={language.id}
              className="flex w-full items-center justify-between rounded-[10px] border border-[#b6b6b6] bg-white px-4 py-4"
              onClick={() => setSelected(language.id)}
              type="button"
            >
              <div className="flex items-center gap-4">
                <span className="flex h-8 w-10 items-center justify-center rounded bg-[#f5f5f5] text-sm font-semibold text-[#202124]">
                  {language.flag}
                </span>
                <div className="text-left">
                  <p className="text-[18px] font-semibold text-[#202124]">{language.name}</p>
                  <p className="text-[16px] text-[#8a8a8a]">{language.label}</p>
                </div>
              </div>
              <span className={`flex size-8 items-center justify-center rounded-full border-4 ${selected === language.id ? "border-[#111] text-[#111]" : "border-[#111] opacity-90"}`}>
                {selected === language.id ? <span className="size-3 rounded-full bg-[#111]" /> : null}
              </span>
            </button>
          ))}
        </div>
        <Button
          className="mx-auto mt-6 flex h-[48px] w-full max-w-[344px] rounded-[10px] bg-[#6d98c0] text-[18px] hover:bg-[#5f88ae]"
          onClick={() => {
            localStorage.setItem("preferred-language", selected);
            router.push("/auth/signin");
          }}
          type="button"
        >
          Save
        </Button>
      </div>
    </div>
  );
}
