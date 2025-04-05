import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { ChevronDown, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group whitespace-nowrap focus-visible:outline-hidden inline-flex items-center justify-center has-[[data-arrow=true]]:justify-between whitespace-nowrap text-sm font-medium ring-offset-background transition-[color,box-shadow] disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground hover:bg-primary-darker data-[state=open]:bg-primary-darker",
        mono: "bg-mono text-mono-foreground hover:bg-mono-darker data-[state=open]:bg-mono-darker",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive-darker data-[state=open]:bg-destructive-darker",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary-darker data-[state=open]:bg-secondary-darker",
        outline:
          "text-accent-foreground border border-input hover:bg-accent/50 data-[state=open]:bg-accent/50",
        dashed:
          "text-accent-foreground border border-input border-dashed bg-background hover:bg-accent hover:text-accent-foreground data-[state=open]:text-accent-foreground",
        ghost:
          "text-accent-foreground hover:bg-accent hover:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-foreground",
        dim: "text-muted-foreground hover:text-foreground data-[state=open]:text-foreground",
        foreground: "",
        inverse: "",
      },
      appearance: {
        default: "",
        ghost: "",
      },
      underline: {
        solid: "",
        dashed: "",
      },
      underlined: {
        solid: "",
        dashed: "",
      },
      size: {
        md: "h-10 rounded-md px-3 text-sm gap-2 [&_svg]:size-4",
        sm: "h-9 rounded-md px-2.5 text-[0.8125rem] leading-[1.385] gap-1.5 [&_svg]:size-3.5",
        xs: "h-8 rounded-md px-2.5 text-xs gap-1 [&_svg]:size-3.5",
        xxs: "h-7 rounded-md px-2 text-xs gap-1 [&_svg]:size-3",
      },
      autoHeight: {
        true: "",
        false: "",
      },
      shape: {
        default: "",
        circle: "rounded-full",
      },
      mode: {
        default:
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        icon: "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        link: "text-primary h-auto p-0 bg-transparent rounded-none hover:bg-transparent data-[state=open]:bg-transparent",
        input: `
            justify-start font-normal hover:bg-transparent [&_svg]:transition-colors hover:[&_svg]:text-foreground data-[state=open]:bg-transparent 
            focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/30 
            [[data-state=open]>&]:border-ring [[data-state=open]>&]:outline-none [[data-state=open]>&]:ring-[3px] 
            [[data-state=open]>&]:ring-ring/30 
            aria-invalid:border-destructive/60 aria-invalid:ring-destructive/10 dark:aria-invalid:border-destructive dark:aria-invalid:ring-destructive/20
            [[data-invalid=true]_&]:border-destructive/60 [[data-invalid=true]_&]:ring-destructive/10  dark:[[data-invalid=true]_&]:border-destructive dark:[[data-invalid=true]_&]:ring-destructive/20
          `,
      },
      placeholder: {
        true: "text-muted-foreground",
        false: "",
      },
    },
    compoundVariants: [
      // Icons opacity for default mode
      {
        variant: "ghost",
        mode: "default",
        className: "[&_svg:not([role=img])]:opacity-60",
      },
      {
        variant: "outline",
        mode: "default",
        className: "[&_svg:not([role=img])]:opacity-60",
      },
      {
        variant: "dashed",
        mode: "default",
        className: "[&_svg:not([role=img])]:opacity-60",
      },
      {
        variant: "secondary",
        mode: "default",
        className: "[&_svg:not([role=img])]:opacity-60",
      },

      // Icons opacity for default mode
      {
        variant: "outline",
        mode: "input",
        className: "[&_svg:not([role=img])]:opacity-60",
      },

      // Auto height
      {
        size: "md",
        autoHeight: true,
        className: "h-auto min-h-10",
      },
      {
        size: "sm",
        autoHeight: true,
        className: "h-auto min-h-9",
      },
      {
        size: "xs",
        autoHeight: true,
        className: "h-auto min-h-8",
      },

      // Shadow support
      {
        variant: "primary",
        mode: "default",
        appearance: "default",
        className: "shadow-xs shadow-black/5",
      },
      {
        variant: "mono",
        mode: "default",
        appearance: "default",
        className: "shadow-xs shadow-black/5",
      },
      {
        variant: "secondary",
        mode: "default",
        appearance: "default",
        className: "shadow-xs shadow-black/5",
      },
      {
        variant: "outline",
        mode: "default",
        appearance: "default",
        className: "shadow-xs shadow-black/5",
      },
      {
        variant: "dashed",
        mode: "default",
        appearance: "default",
        className: "shadow-xs shadow-black/5",
      },
      {
        variant: "destructive",
        mode: "default",
        appearance: "default",
        className: "shadow-xs shadow-black/5",
      },

      // Shadow support
      {
        variant: "primary",
        mode: "icon",
        appearance: "default",
        className: "shadow-xs shadow-black/5",
      },
      {
        variant: "mono",
        mode: "icon",
        appearance: "default",
        className: "shadow-xs shadow-black/5",
      },
      {
        variant: "secondary",
        mode: "icon",
        appearance: "default",
        className: "shadow-xs shadow-black/5",
      },
      {
        variant: "outline",
        mode: "icon",
        appearance: "default",
        className: "shadow-xs shadow-black/5",
      },
      {
        variant: "dashed",
        mode: "icon",
        appearance: "default",
        className: "shadow-xs shadow-black/5",
      },
      {
        variant: "destructive",
        mode: "icon",
        appearance: "default",
        className: "shadow-xs shadow-black/5",
      },

      // Link
      {
        variant: "primary",
        mode: "link",
        underline: "solid",
        className:
          "font-medium text-primary hover:text-primary-darker [&_svg]:opacity-60 hover:underline hover:underline-offset-4 hover:decoration-solid",
      },
      {
        variant: "primary",
        mode: "link",
        underline: "dashed",
        className:
          "font-medium text-primary hover:text-primary-darker [&_svg]:opacity-60 hover:underline hover:underline-offset-4 hover:decoration-dashed decoration-1",
      },
      {
        variant: "primary",
        mode: "link",
        underlined: "solid",
        className:
          "font-medium text-primary hover:text-primary-darker [&_svg]:opacity-60 underline underline-offset-4 decoration-solid",
      },
      {
        variant: "primary",
        mode: "link",
        underlined: "dashed",
        className:
          "font-medium text-primary hover:text-primary-darker [&_svg]:opacity-60 underline underline-offset-4 decoration-dashed decoration-1",
      },

      {
        variant: "inverse",
        mode: "link",
        underline: "solid",
        className:
          "font-medium text-inherit [&_svg]:opacity-60 hover:underline hover:underline-offset-4 hover:decoration-solid",
      },
      {
        variant: "inverse",
        mode: "link",
        underline: "dashed",
        className:
          "font-medium text-inherit [&_svg]:opacity-60 hover:underline hover:underline-offset-4 hover:decoration-dashed decoration-1",
      },
      {
        variant: "inverse",
        mode: "link",
        underlined: "solid",
        className:
          "font-medium text-inherit [&_svg]:opacity-60 underline underline-offset-4 decoration-solid",
      },
      {
        variant: "inverse",
        mode: "link",
        underlined: "dashed",
        className:
          "font-medium text-inherit [&_svg]:opacity-60 underline underline-offset-4 decoration-dashed decoration-1",
      },

      {
        variant: "foreground",
        mode: "link",
        underline: "solid",
        className:
          "font-medium text-foreground [&_svg]:opacity-60 hover:underline hover:underline-offset-4 hover:decoration-solid",
      },
      {
        variant: "foreground",
        mode: "link",
        underline: "dashed",
        className:
          "font-medium text-foreground [&_svg]:opacity-60 hover:underline hover:underline-offset-4 hover:decoration-dashed decoration-1",
      },
      {
        variant: "foreground",
        mode: "link",
        underlined: "solid",
        className:
          "font-medium text-foreground [&_svg]:opacity-60 underline underline-offset-4 decoration-solid",
      },
      {
        variant: "foreground",
        mode: "link",
        underlined: "dashed",
        className:
          "font-medium text-foreground [&_svg]:opacity-60 underline underline-offset-4 decoration-dashed decoration-1",
      },

      // Ghost
      {
        variant: "primary",
        appearance: "ghost",
        className:
          "bg-transparent text-primary-darker hover:bg-primary/10 data-[state=open]:bg-primary/10",
      },
      {
        variant: "destructive",
        appearance: "ghost",
        className:
          "bg-transparent text-destructive-darker hover:bg-destructive/10 data-[state=open]:bg-destructive/10",
      },

      // Size
      { size: "md", mode: "icon", className: "w-10 h-10 p-0 [&_svg]:size-4" },
      {
        size: "sm",
        mode: "icon",
        className: "w-9 h-9 p-0 [&_svg]:size-4",
      },
      {
        size: "xs",
        mode: "icon",
        className: "w-8 h-8 p-0 [&_svg]:size-3.5",
      },
      {
        size: "xxs",
        mode: "icon",
        className: "w-7 h-7 p-0 [&_svg]:size-3.5",
      },

      // Input mode
      {
        mode: "input",
        placeholder: true,
        variant: "outline",
        className: "font-normal text-muted-foreground",
      },
    ],
    defaultVariants: {
      variant: "primary",
      mode: "default",
      size: "md",
      shape: "default",
      appearance: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  selected?: boolean;
}

function Button({
  className,
  selected,
  variant,
  shape,
  appearance,
  mode,
  size,
  autoHeight,
  underlined,
  underline,
  asChild = false,
  placeholder = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="button"
      className={cn(
        buttonVariants({
          variant,
          size,
          shape,
          appearance,
          mode,
          autoHeight,
          placeholder,
          underlined,
          underline,
          className,
        }),
        asChild && props.disabled && "pointer-events-none opacity-50",
      )}
      {...(selected && { "data-state": "open" })}
      {...props}
    />
  );
}

interface ButtonArrowProps extends React.SVGProps<SVGSVGElement> {
  icon?: LucideIcon; // Allows passing any Lucide icon
}

function ButtonArrow({
  icon: Icon = ChevronDown,
  className,
  ...props
}: ButtonArrowProps) {
  return (
    <Icon
      data-slot="button-arrow"
      className={cn("ms-auto -me-1", className)}
      {...props}
    />
  );
}

export { Button, ButtonArrow, buttonVariants };
