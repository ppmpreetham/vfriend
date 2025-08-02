import * as HoverCardPrimitive from "@radix-ui/react-hover-card";
import { encode } from "qss";
import React, { useRef, useEffect } from "preact/compat";
import gsap from "gsap";
import { cn } from "../lib/utils";

type LinkPreviewProps = {
  children: React.ReactNode;
  url: string;
  className?: string;
  width?: number;
  height?: number;
  quality?: number;
  layout?: string;
} & (
  | { isStatic: true; imageSrc: string }
  | { isStatic?: false; imageSrc?: never }
);

export const LinkPreview = ({
  children,
  url,
  className,
  width = 200,
  height = 125,
  quality = 50,
  layout = "fixed",
  isStatic = false,
  imageSrc = "",
}: LinkPreviewProps) => {
  let src;
  if (!isStatic) {
    const params = encode({
      url,
      screenshot: true,
      meta: false,
      embed: "screenshot.url",
      colorScheme: "dark",
      "viewport.isMobile": true,
      "viewport.deviceScaleFactor": 1,
      "viewport.width": width * 3,
      "viewport.height": height * 3,
    });
    src = `https://api.microlink.io/?${params}`;
  } else {
    src = imageSrc;
  }

  const [isOpen, setOpen] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Animation for entering/exiting
  useEffect(() => {
    if (!previewRef.current) return;

    if (isOpen) {
      gsap.fromTo(
        previewRef.current,
        {
          opacity: 0,
          y: 20,
          scale: 0.6,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          ease: "back.out(1.7)",
        }
      );
    } else {
      // Create a timeline for exit animation that will remove the element when done
      const tl = gsap.timeline();
      tl.to(previewRef.current, {
        opacity: 0,
        y: 20,
        scale: 0.6,
        duration: 0.3,
        ease: "power2.in",
      });
    }
  }, [isOpen]);

  // Handle mouse movement for the hover effect
  const handleMouseMove = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (!previewRef.current) return;

    const targetRect = event.currentTarget.getBoundingClientRect();
    const eventOffsetX = event.clientX - targetRect.left;
    const offsetFromCenter = (eventOffsetX - targetRect.width / 2) / 2;

    gsap.to(previewRef.current, {
      x: offsetFromCenter,
      duration: 0.5,
      ease: "power2.out",
    });
  };

  return (
    <>
      {isMounted ? (
        <div className="hidden">
          <img src={src} width={width} height={height} alt="hidden image" />
        </div>
      ) : null}

      <HoverCardPrimitive.Root
        openDelay={50}
        closeDelay={100}
        onOpenChange={(open) => {
          setOpen(open);
        }}
      >
        <HoverCardPrimitive.Trigger
          onMouseMove={handleMouseMove}
          className={cn("text-black dark:text-white", className)}
          href={url}
        >
          {children}
        </HoverCardPrimitive.Trigger>

        <HoverCardPrimitive.Content
          className="[transform-origin:var(--radix-hover-card-content-transform-origin)]"
          side="top"
          align="center"
          sideOffset={10}
        >
          {isOpen && (
            <div
              ref={previewRef}
              className="shadow-xl rounded-xl"
              style={{
                opacity: 0, // Initial state before animation
              }}
            >
              <a
                href={url}
                className="block p-1 bg-primary border-2 border-transparent shadow hover:border-neutral-200 dark:hover:border-neutral-800"
                style={{ fontSize: 0 }}
                target="_blank"
              >
                <img
                  src={isStatic ? imageSrc : src}
                  width={width}
                  height={height}
                  alt="preview image"
                />
              </a>
            </div>
          )}
        </HoverCardPrimitive.Content>
      </HoverCardPrimitive.Root>
    </>
  );
};
