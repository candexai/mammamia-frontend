"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X } from "lucide-react";

const faqSchema = z.object({
  question: z.string().min(1, "Question is required").max(300, "Question must be less than 300 characters"),
  answer: z.string().min(1, "Answer is required").max(1200, "Answer must be less than 1200 characters"),
});

type FAQFormData = z.infer<typeof faqSchema>;

interface FAQModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: FAQFormData) => void;
  initialData?: { question: string; answer: string };
  mode?: "add" | "edit";
}

export function FAQModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  mode = "add",
}: FAQModalProps) {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FAQFormData>({
    resolver: zodResolver(faqSchema),
    defaultValues: initialData || { question: "", answer: "" },
  });

  const questionLength = watch("question")?.length || 0;
  const answerLength = watch("answer")?.length || 0;

  const onSubmit = (data: FAQFormData) => {
    onSave(data);
    reset();
    onClose();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-[560px] bg-card border border-border rounded-2xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">
            {mode === "add" ? "Add FAQ" : "Edit FAQ"}
          </h2>
          <button
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Question */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-foreground">Question</label>
              <span className="text-xs text-muted-foreground">{questionLength}/300</span>
            </div>
            <input
              {...register("question")}
              placeholder="Enter your question"
              className="w-full bg-secondary border border-border rounded-lg px-3 py-3 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
            />
            {errors.question && (
              <p className="text-xs text-red-500 mt-1">{errors.question.message}</p>
            )}
          </div>

          {/* Answer */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-foreground">Answer</label>
              <span className="text-xs text-muted-foreground">{answerLength}/1200</span>
            </div>
            <textarea
              {...register("answer")}
              placeholder="Enter your answer"
              rows={5}
              className="w-full bg-secondary border border-border rounded-lg px-3 py-3 text-sm text-white placeholder:text-muted-foreground resize-none focus:outline-none focus:border-primary transition-colors"
            />
            {errors.answer && (
              <p className="text-xs text-red-500 mt-1">{errors.answer.message}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-6 py-3 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-accent transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:brightness-110 transition-all"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

