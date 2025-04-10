// This file re-exports all the functions from the UI toast component
// so they can be used via hook instead of having to import the provider

import {
  useToast as useToastOriginal,
  toast,
  type ToastActionElement
} from "@/components/ui/use-toast";

export type { ToastActionElement };
export const useToast = useToastOriginal;
