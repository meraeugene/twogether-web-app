"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils/cn";

type SharedProps = {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  textClassName?: string;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode | false;
  fullWidth?: boolean;
};

type ButtonProps = SharedProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
    href?: undefined;
  };

type LinkProps = SharedProps & {
  href: string;
};

type GlowingOutlineButtonProps = ButtonProps | LinkProps;

function ButtonContent({
  children,
  contentClassName,
  fullWidth,
  leadingIcon,
  textClassName,
  trailingIcon,
}: SharedProps) {
  return (
    <>
      <span className="absolute inset-0 rounded-full bg-red-500/25 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />
      <span
        className={cn(
          "relative inline-flex overflow-hidden rounded-full p-[1px] transition-all duration-300",
          fullWidth && "w-full",
        )}
      >
        <span className="absolute inset-[-100%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0%,transparent_70%,#fb2c36_85%,transparent_100%)]" />
        <span
          className={cn(
            "relative flex items-center justify-center gap-2 rounded-full border border-white/5 bg-black/60 px-5 py-2.5 text-white backdrop-blur-2xl",
            fullWidth && "w-full",
            contentClassName,
          )}
        >
          {leadingIcon ? (
            <span className="shrink-0 text-red-400">{leadingIcon}</span>
          ) : null}
          <span
            className={cn(
              "text-sm font-bold uppercase text-red-400",
              textClassName,
            )}
          >
            {children}
          </span>
          {trailingIcon === false ? null : (
            <span className="shrink-0 text-red-400 transition-transform group-hover:translate-x-1">
              {trailingIcon ?? <ChevronRight size={18} />}
            </span>
          )}
          <span className="absolute bottom-0 left-1/2 h-[1px] w-1/2 -translate-x-1/2 bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
        </span>
      </span>
    </>
  );
}

export default function GlowingOutlineButton(props: GlowingOutlineButtonProps) {
  if ("href" in props && props.href) {
    const {
      href,
      children,
      className,
      contentClassName,
      textClassName,
      leadingIcon,
      trailingIcon,
      fullWidth,
    } = props;

    return (
      <Link
        href={href}
        className={cn(
          "group relative inline-flex items-center justify-center",
          fullWidth && "w-full",
          className,
        )}
      >
        <ButtonContent
          contentClassName={contentClassName}
          fullWidth={fullWidth}
          leadingIcon={leadingIcon}
          textClassName={textClassName}
          trailingIcon={trailingIcon}
        >
          {children}
        </ButtonContent>
      </Link>
    );
  }

  const {
    children,
    className,
    contentClassName,
    textClassName,
    leadingIcon,
    trailingIcon,
    fullWidth,
    ...buttonProps
  } = props;

  return (
    <button
      {...buttonProps}
      className={cn(
        "group relative inline-flex items-center justify-center disabled:cursor-not-allowed disabled:opacity-60",
        fullWidth && "w-full",
        className,
      )}
    >
      <ButtonContent
        contentClassName={contentClassName}
        fullWidth={fullWidth}
        leadingIcon={leadingIcon}
        textClassName={textClassName}
        trailingIcon={trailingIcon}
      >
        {children}
      </ButtonContent>
    </button>
  );
}
