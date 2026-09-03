"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"
import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"

function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      position="bottom-right"
      duration={4200}
      gap={10}
      icons={{
        success: <CircleCheckIcon className="size-4 text-up" />,
        info: <InfoIcon className="size-4 text-run" />,
        warning: <TriangleAlertIcon className="size-4 text-warn" />,
        error: <OctagonXIcon className="size-4 text-down" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--success-bg": "var(--popover)",
          "--success-text": "var(--foreground)",
          "--success-border": "color-mix(in srgb, var(--up) 40%, var(--border))",
          "--error-bg": "var(--popover)",
          "--error-text": "var(--foreground)",
          "--error-border": "color-mix(in srgb, var(--down) 45%, var(--border))",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            "cn-toast font-sans border bg-popover text-popover-foreground shadow-lg",
          title: "font-heading tracking-[-0.03em]",
          description: "text-muted-foreground",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
