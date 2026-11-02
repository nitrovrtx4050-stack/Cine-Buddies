/**
 * Thin toast facade so components never import sonner directly — if the
 * notification transport changes later (e.g. server-sent events), only this
 * file changes.
 */

export { toast, Toaster } from "sonner";
export { default as ToastViewport } from "@/components/ui/sonner";
