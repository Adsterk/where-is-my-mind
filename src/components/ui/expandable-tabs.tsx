"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useOnClickOutside } from "usehooks-ts";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface Tab {
  title: string;
  icon: LucideIcon;
  type?: never;
}

interface Separator {
  type: "separator";
  title?: never;
  icon?: never;
}

type TabItem = Tab | Separator;

interface ExpandableTabsProps {
  tabs: TabItem[];
  className?: string;
  activeColor?: string;
  onChange?: (index: number | null) => void;
  defaultSelectedIndex?: number;
}

const buttonVariants = {
  initial: {
    width: "auto",
    paddingLeft: "0.75rem",
    paddingRight: "0.75rem",
  },
  animate: (isSelected: boolean) => ({
    width: isSelected ? "auto" : "auto",
    paddingLeft: isSelected ? "0.75rem" : "0.75rem",
    paddingRight: isSelected ? "0.75rem" : "0.75rem",
  }),
};

const spanVariants = {
  initial: { width: 0, opacity: 0, marginLeft: 0 },
  animate: { width: "auto", opacity: 1, marginLeft: 8 },
  exit: { width: 0, opacity: 0, marginLeft: 0 },
};

const transition = { type: "spring", bounce: 0, duration: 0.4 };

export function ExpandableTabs({
  tabs,
  className,
  activeColor = "text-primary",
  onChange,
  defaultSelectedIndex,
}: ExpandableTabsProps) {
  const [selected, setSelected] = React.useState<number | null>(defaultSelectedIndex ?? null);
  const outsideClickRef = React.useRef(null);

  // Update selected state when defaultSelectedIndex changes
  React.useEffect(() => {
    setSelected(defaultSelectedIndex ?? null);
  }, [defaultSelectedIndex]);

  useOnClickOutside(outsideClickRef, () => {
    if (defaultSelectedIndex === undefined) {
      setSelected(null);
      onChange?.(null);
    }
  });

  const handleSelect = (index: number) => {
    if (index === defaultSelectedIndex) return;
    setSelected(selected === index ? null : index);
    onChange?.(selected === index ? null : index);
  };

  return (
    <div
      ref={outsideClickRef}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border bg-background/95 p-1 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className
      )}
    >
      {tabs.map((tab, index) => {
        if (tab.type === "separator") {
          return <div key={`separator-${index}`} className="mx-1 h-4 w-px bg-border" aria-hidden="true" />;
        }

        const Icon = tab.icon;
        const isSelected = selected === index || defaultSelectedIndex === index;

        return (
          <motion.button
            key={tab.title}
            variants={buttonVariants}
            initial="initial"
            animate="animate"
            custom={isSelected}
            onClick={() => handleSelect(index)}
            transition={transition}
            className={cn(
              "relative flex items-center justify-center rounded-full py-2 text-sm font-medium transition-colors",
              isSelected
                ? cn("bg-muted", activeColor)
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon size={20} />
            <AnimatePresence initial={false}>
              {isSelected && (
                <motion.span
                  variants={spanVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={transition}
                  className="overflow-hidden whitespace-nowrap pr-1"
                >
                  {tab.title}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        );
      })}
    </div>
  );
} 