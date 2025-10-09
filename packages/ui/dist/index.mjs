'use client'

// src/lib/utils.ts
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}
function formatCurrency(amount, currency = "USD", locale = "en-US") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency
  }).format(amount);
}
function formatPercentage(value, decimals = 1, locale = "en-US") {
  return new Intl.NumberFormat(locale, {
    style: "percent",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value / 100);
}
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
function throttle(func, limit) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}
function generateId(length = 8) {
  return Math.random().toString(36).substring(2, 2 + length);
}
function isEmpty(value) {
  if (value == null) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") return Object.keys(value).length === 0;
  return false;
}
function deepMerge(target, ...sources) {
  if (!sources.length) return target;
  const source = sources.shift();
  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        deepMerge(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }
  return deepMerge(target, ...sources);
}
function isObject(item) {
  return item && typeof item === "object" && !Array.isArray(item);
}
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
function camelToTitle(str) {
  return str.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase());
}
function truncate(str, length) {
  if (str.length <= length) return str;
  return str.substring(0, length) + "...";
}
function formatRelativeTime(date) {
  const now = /* @__PURE__ */ new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1e3);
  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592e3) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  if (diffInSeconds < 31536e3) return `${Math.floor(diffInSeconds / 2592e3)}mo ago`;
  return `${Math.floor(diffInSeconds / 31536e3)}y ago`;
}
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
function getContrastingColor(hexColor) {
  const color = hexColor.replace("#", "");
  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "#000000" : "#ffffff";
}
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand("copy");
      document.body.removeChild(textArea);
      return true;
    } catch {
      document.body.removeChild(textArea);
      return false;
    }
  }
}

// src/components/Button.tsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { Loader2 } from "lucide-react";
var buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        cortex: "cortex-gradient text-white hover:shadow-lg cortex-glow transition-all duration-300"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
var Button = React.forwardRef(
  ({ className, variant, size, asChild = false, loading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return /* @__PURE__ */ React.createElement(
      Comp,
      {
        className: cn(buttonVariants({ variant, size, className })),
        ref,
        disabled: disabled || loading,
        ...props
      },
      loading && /* @__PURE__ */ React.createElement(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }),
      children
    );
  }
);
Button.displayName = "Button";

// src/components/Card.tsx
import * as React2 from "react";
var Card = React2.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ React2.createElement(
  "div",
  {
    ref,
    className: cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    ),
    ...props
  }
));
Card.displayName = "Card";
var CardHeader = React2.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ React2.createElement(
  "div",
  {
    ref,
    className: cn("flex flex-col space-y-1.5 p-6", className),
    ...props
  }
));
CardHeader.displayName = "CardHeader";
var CardTitle = React2.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ React2.createElement(
  "h3",
  {
    ref,
    className: cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    ),
    ...props
  }
));
CardTitle.displayName = "CardTitle";
var CardDescription = React2.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ React2.createElement(
  "p",
  {
    ref,
    className: cn("text-sm text-muted-foreground", className),
    ...props
  }
));
CardDescription.displayName = "CardDescription";
var CardContent = React2.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ React2.createElement("div", { ref, className: cn("p-6 pt-0", className), ...props }));
CardContent.displayName = "CardContent";
var CardFooter = React2.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ React2.createElement(
  "div",
  {
    ref,
    className: cn("flex items-center p-6 pt-0", className),
    ...props
  }
));
CardFooter.displayName = "CardFooter";

// src/components/base/Input.tsx
import * as React3 from "react";
var Input = React3.forwardRef(
  ({ className, type, label, error, helperText, ...props }, ref) => {
    const id = React3.useId();
    const inputId = props.id || id;
    return /* @__PURE__ */ React3.createElement("div", { className: "w-full space-y-2" }, label && /* @__PURE__ */ React3.createElement(
      "label",
      {
        htmlFor: inputId,
        className: "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      },
      label
    ), /* @__PURE__ */ React3.createElement(
      "input",
      {
        type,
        className: cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-destructive focus-visible:ring-destructive",
          className
        ),
        ref,
        id: inputId,
        ...props
      }
    ), error && /* @__PURE__ */ React3.createElement("p", { className: "text-sm text-destructive" }, error), helperText && !error && /* @__PURE__ */ React3.createElement("p", { className: "text-sm text-muted-foreground" }, helperText));
  }
);
Input.displayName = "Input";

// src/components/base/Textarea.tsx
import * as React4 from "react";
var Textarea = React4.forwardRef(
  ({ className, label, error, helperText, ...props }, ref) => {
    const id = React4.useId();
    const textareaId = props.id || id;
    return /* @__PURE__ */ React4.createElement("div", { className: "w-full space-y-2" }, label && /* @__PURE__ */ React4.createElement(
      "label",
      {
        htmlFor: textareaId,
        className: "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      },
      label
    ), /* @__PURE__ */ React4.createElement(
      "textarea",
      {
        className: cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-destructive focus-visible:ring-destructive",
          className
        ),
        ref,
        id: textareaId,
        ...props
      }
    ), error && /* @__PURE__ */ React4.createElement("p", { className: "text-sm text-destructive" }, error), helperText && !error && /* @__PURE__ */ React4.createElement("p", { className: "text-sm text-muted-foreground" }, helperText));
  }
);
Textarea.displayName = "Textarea";

// src/components/base/Badge.tsx
import * as React5 from "react";
import { cva as cva2 } from "class-variance-authority";
var badgeVariants = cva2(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        success: "border-transparent bg-green-500 text-white hover:bg-green-600",
        warning: "border-transparent bg-yellow-500 text-white hover:bg-yellow-600",
        info: "border-transparent bg-blue-500 text-white hover:bg-blue-600",
        cortex: "border-transparent cortex-gradient text-white hover:shadow-md"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
function Badge({ className, variant, ...props }) {
  return /* @__PURE__ */ React5.createElement("div", { className: cn(badgeVariants({ variant }), className), ...props });
}

// src/components/base/Spinner.tsx
import * as React6 from "react";
import { Loader2 as Loader22 } from "lucide-react";
import { cva as cva3 } from "class-variance-authority";
var spinnerVariants = cva3("animate-spin", {
  variants: {
    size: {
      sm: "h-4 w-4",
      md: "h-6 w-6",
      lg: "h-8 w-8",
      xl: "h-12 w-12"
    },
    color: {
      default: "text-foreground",
      primary: "text-primary",
      secondary: "text-secondary",
      muted: "text-muted-foreground",
      cortex: "text-cortex-500"
    }
  },
  defaultVariants: {
    size: "md",
    color: "default"
  }
});
var Spinner = React6.forwardRef(
  ({ className, size, color, label, ...props }, ref) => {
    return /* @__PURE__ */ React6.createElement(
      "div",
      {
        ref,
        className: cn("flex items-center justify-center", className),
        ...props
      },
      /* @__PURE__ */ React6.createElement(Loader22, { className: cn(spinnerVariants({ size, color })) }),
      label && /* @__PURE__ */ React6.createElement("span", { className: "ml-2 text-sm text-muted-foreground" }, label)
    );
  }
);
Spinner.displayName = "Spinner";

// src/components/layout/AppShell.tsx
import * as React7 from "react";
var AppShell = React7.forwardRef(
  ({ children, sidebar, header, footer, className }, ref) => {
    return /* @__PURE__ */ React7.createElement(
      "div",
      {
        ref,
        className: cn(
          "min-h-screen bg-background text-foreground",
          className
        )
      },
      header && /* @__PURE__ */ React7.createElement("header", { className: "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" }, header),
      /* @__PURE__ */ React7.createElement("div", { className: "flex flex-1" }, sidebar && /* @__PURE__ */ React7.createElement("aside", { className: "fixed left-0 top-[var(--header-height,0)] z-30 h-[calc(100vh-var(--header-height,0))] w-64 shrink-0 border-r bg-background transition-all duration-300" }, /* @__PURE__ */ React7.createElement("div", { className: "h-full overflow-y-auto scrollbar-thin" }, sidebar)), /* @__PURE__ */ React7.createElement(
        "main",
        {
          className: cn(
            "flex-1 overflow-x-hidden",
            sidebar && "ml-64"
          )
        },
        /* @__PURE__ */ React7.createElement("div", { className: "container mx-auto p-6" }, children)
      )),
      footer && /* @__PURE__ */ React7.createElement("footer", { className: "border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" }, footer)
    );
  }
);
AppShell.displayName = "AppShell";

// src/components/layout/Navigation.tsx
import * as React8 from "react";
import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  Play,
  Folder,
  Terminal as TerminalIcon,
  Settings,
  Users,
  BarChart3,
  Shield
} from "lucide-react";
var navigationItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    roles: ["user", "management", "admin"]
  },
  {
    id: "pov",
    label: "POV Management",
    icon: FileText,
    href: "/pov",
    roles: ["user", "management", "admin"],
    children: [
      { id: "pov-active", label: "Active POVs", icon: FileText, href: "/pov/active", roles: ["user", "management", "admin"] },
      { id: "pov-templates", label: "Templates", icon: Folder, href: "/pov/templates", roles: ["management", "admin"] },
      { id: "pov-analytics", label: "Analytics", icon: BarChart3, href: "/pov/analytics", roles: ["management", "admin"] }
    ]
  },
  {
    id: "trr",
    label: "TRR Management",
    icon: CheckSquare,
    href: "/trr",
    roles: ["user", "management", "admin"],
    children: [
      { id: "trr-active", label: "Active TRRs", icon: CheckSquare, href: "/trr/active", roles: ["user", "management", "admin"] },
      { id: "trr-validation", label: "Validation Queue", icon: Shield, href: "/trr/validation", roles: ["management", "admin"] },
      { id: "trr-reports", label: "Reporting", icon: BarChart3, href: "/trr/reports", roles: ["management", "admin"] }
    ]
  },
  {
    id: "scenarios",
    label: "Scenario Engine",
    icon: Play,
    href: "/scenarios",
    roles: ["user", "management", "admin"],
    children: [
      { id: "scenarios-library", label: "Scenario Library", icon: Folder, href: "/scenarios/library", roles: ["user", "management", "admin"] },
      { id: "scenarios-monitor", label: "Execution Monitor", icon: BarChart3, href: "/scenarios/monitor", roles: ["user", "management", "admin"] },
      { id: "scenarios-archive", label: "Results Archive", icon: FileText, href: "/scenarios/archive", roles: ["management", "admin"] }
    ]
  },
  {
    id: "content",
    label: "Content Hub",
    icon: Folder,
    href: "/content",
    roles: ["user", "management", "admin"]
  },
  {
    id: "terminal",
    label: "Terminal",
    icon: TerminalIcon,
    href: "/terminal",
    roles: ["user", "management", "admin"]
  },
  {
    id: "integrations",
    label: "Integrations",
    icon: Settings,
    href: "/integrations",
    roles: ["management", "admin"]
  },
  {
    id: "admin",
    label: "Administration",
    icon: Users,
    href: "/admin",
    roles: ["admin"],
    children: [
      { id: "admin-users", label: "User Management", icon: Users, href: "/admin/users", roles: ["admin"] },
      { id: "admin-analytics", label: "System Analytics", icon: BarChart3, href: "/admin/analytics", roles: ["admin"] },
      { id: "admin-config", label: "Configuration", icon: Settings, href: "/admin/config", roles: ["admin"] }
    ]
  }
];
var Navigation = React8.forwardRef(
  ({ currentPath, userRole, onNavigate, className }, ref) => {
    const [expandedItems, setExpandedItems] = React8.useState(/* @__PURE__ */ new Set());
    const toggleExpanded = (itemId) => {
      const newExpanded = new Set(expandedItems);
      if (newExpanded.has(itemId)) {
        newExpanded.delete(itemId);
      } else {
        newExpanded.add(itemId);
      }
      setExpandedItems(newExpanded);
    };
    const isItemVisible = (item) => {
      return item.roles.indexOf(userRole) !== -1;
    };
    const renderNavigationItem = (item, level = 0) => {
      if (!isItemVisible(item)) return null;
      const isActive = currentPath === item.href || currentPath.startsWith(item.href + "/");
      const hasChildren = item.children && item.children.length > 0;
      const isExpanded = expandedItems.has(item.id);
      const Icon = item.icon;
      return /* @__PURE__ */ React8.createElement("div", { key: item.id, className: "mb-1" }, /* @__PURE__ */ React8.createElement(
        "button",
        {
          onClick: () => {
            if (hasChildren) {
              toggleExpanded(item.id);
            } else {
              onNavigate(item.href);
            }
          },
          className: cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
            isActive && "bg-accent text-accent-foreground font-medium",
            level > 0 && "ml-4 pl-6"
          )
        },
        /* @__PURE__ */ React8.createElement(Icon, { className: "h-4 w-4 shrink-0" }),
        /* @__PURE__ */ React8.createElement("span", { className: "flex-1 truncate" }, item.label),
        item.badge && /* @__PURE__ */ React8.createElement(Badge, { variant: "secondary", className: "ml-auto" }, item.badge),
        hasChildren && /* @__PURE__ */ React8.createElement(
          "svg",
          {
            className: cn(
              "h-4 w-4 shrink-0 transition-transform",
              isExpanded && "rotate-90"
            ),
            fill: "none",
            stroke: "currentColor",
            viewBox: "0 0 24 24"
          },
          /* @__PURE__ */ React8.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5l7 7-7 7" })
        )
      ), hasChildren && isExpanded && /* @__PURE__ */ React8.createElement("div", { className: "mt-1 space-y-1" }, item.children.map((child) => renderNavigationItem(child, level + 1))));
    };
    return /* @__PURE__ */ React8.createElement(
      "nav",
      {
        ref,
        className: cn("flex flex-col space-y-2 p-4", className)
      },
      /* @__PURE__ */ React8.createElement("div", { className: "mb-6" }, /* @__PURE__ */ React8.createElement("h2", { className: "cortex-gradient-text text-lg font-semibold tracking-tight" }, "Cortex DC"), /* @__PURE__ */ React8.createElement("p", { className: "text-sm text-muted-foreground" }, "Domain Consultant Platform")),
      navigationItems.map((item) => renderNavigationItem(item))
    );
  }
);
Navigation.displayName = "Navigation";

// src/components/Terminal.tsx
import React9 from "react";
var Terminal = ({ output = [], className = "" }) => {
  return /* @__PURE__ */ React9.createElement("div", { className: `bg-black text-green-400 font-mono p-4 rounded ${className}` }, output.map((line, index) => /* @__PURE__ */ React9.createElement("div", { key: index }, line)));
};

// src/components/pov/POVCard.tsx
import React10 from "react";
var POVCard = ({ title, description, className }) => {
  return /* @__PURE__ */ React10.createElement(Card, { className }, /* @__PURE__ */ React10.createElement("h3", { className: "text-lg font-semibold mb-2" }, title), description && /* @__PURE__ */ React10.createElement("p", { className: "text-gray-600" }, description));
};

// src/components/trr/TRRStatus.tsx
import React11 from "react";
var statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  "in-progress": "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800"
};
var TRRStatus = ({ status, className = "" }) => {
  return /* @__PURE__ */ React11.createElement("span", { className: `px-2 py-1 rounded-full text-xs font-medium ${statusColors[status]} ${className}` }, status.charAt(0).toUpperCase() + status.slice(1));
};

// src/hooks/useTerminal.ts
import { useState as useState2, useCallback } from "react";
var useTerminal = () => {
  const [output, setOutput] = useState2([]);
  const [isLoading, setIsLoading] = useState2(false);
  const [error, setError] = useState2(null);
  const addLine = useCallback((line) => {
    setOutput((prev) => [...prev, line]);
  }, []);
  const clear = useCallback(() => {
    setOutput([]);
    setError(null);
  }, []);
  const setLoading = useCallback((loading) => {
    setIsLoading(loading);
  }, []);
  return {
    output,
    isLoading,
    error,
    addLine,
    clear,
    setLoading,
    setError
  };
};
export {
  AppShell,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  Navigation,
  POVCard,
  Spinner,
  TRRStatus,
  Terminal,
  Textarea,
  badgeVariants,
  buttonVariants,
  camelToTitle,
  capitalize,
  cn,
  copyToClipboard,
  debounce,
  deepMerge,
  formatBytes,
  formatCurrency,
  formatPercentage,
  formatRelativeTime,
  generateId,
  getContrastingColor,
  isEmpty,
  isValidEmail,
  isValidUrl,
  sleep,
  spinnerVariants,
  throttle,
  truncate,
  useTerminal
};
//# sourceMappingURL=index.mjs.map