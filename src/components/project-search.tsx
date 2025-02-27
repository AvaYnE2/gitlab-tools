"use client";

import { Search } from "lucide-react";
import { type SubmitHandler, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ProjectSearchProps {
  onSearch: (searchTerm: string) => void;
  disabled?: boolean;
}

type FormValues = {
  searchTerm: string;
};

export function ProjectSearch({
  onSearch,
  disabled = false,
}: ProjectSearchProps) {
  const {
    register,
    handleSubmit,
    formState: { isDirty },
  } = useForm<FormValues>({
    defaultValues: {
      searchTerm: "",
    },
  });

  const onFormSubmit: SubmitHandler<FormValues> = (data) => {
    onSearch(data.searchTerm);
  };

  return (
    <form
      onSubmit={handleSubmit(onFormSubmit)}
      className="w-full max-w-xl relative"
    >
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search projects..."
          {...register("searchTerm")}
          disabled={disabled}
          className="pl-9 pr-16"
        />
        <Button
          type="submit"
          size="sm"
          disabled={disabled || !isDirty}
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7"
        >
          Search
        </Button>
      </div>
    </form>
  );
}
