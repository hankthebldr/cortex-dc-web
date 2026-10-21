'use client'
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  AppShell: () => AppShell,
  Badge: () => Badge,
  Button: () => Button,
  Card: () => Card,
  CardContent: () => CardContent,
  CardDescription: () => CardDescription,
  CardFooter: () => CardFooter,
  CardHeader: () => CardHeader,
  CardTitle: () => CardTitle,
  Input: () => Input,
  Navigation: () => Navigation,
  POVCard: () => POVCard,
  Select: () => Select,
  SelectContent: () => SelectContent,
  SelectGroup: () => SelectGroup,
  SelectItem: () => SelectItem,
  SelectLabel: () => SelectLabel,
  SelectSeparator: () => SelectSeparator,
  SelectTrigger: () => SelectTrigger,
  SelectValue: () => SelectValue,
  Spinner: () => Spinner,
  TRRStatus: () => TRRStatus,
  Terminal: () => Terminal,
  Textarea: () => Textarea,
  Toast: () => Toast,
  ToastContainer: () => ToastContainer,
  badgeVariants: () => badgeVariants,
  buttonVariants: () => buttonVariants,
  camelToTitle: () => camelToTitle,
  capitalize: () => capitalize,
  cn: () => cn,
  copyToClipboard: () => copyToClipboard,
  debounce: () => debounce,
  deepMerge: () => deepMerge,
  formatBytes: () => formatBytes,
  formatCurrency: () => formatCurrency,
  formatPercentage: () => formatPercentage,
  formatRelativeTime: () => formatRelativeTime,
  generateId: () => generateId,
  getContrastingColor: () => getContrastingColor,
  isEmpty: () => isEmpty,
  isValidEmail: () => isValidEmail,
  isValidUrl: () => isValidUrl,
  sleep: () => sleep,
  spinnerVariants: () => spinnerVariants,
  throttle: () => throttle,
  truncate: () => truncate,
  useTerminal: () => useTerminal,
  useToast: () => useToast
});
module.exports = __toCommonJS(index_exports);

// src/lib/utils.ts
var import_clsx = require("clsx");
var import_tailwind_merge = require("tailwind-merge");
function cn(...inputs) {
  return (0, import_tailwind_merge.twMerge)((0, import_clsx.clsx)(inputs));
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
var React = __toESM(require("react"));
var import_react_slot = require("@radix-ui/react-slot");
var import_class_variance_authority = require("class-variance-authority");
var import_lucide_react = require("lucide-react");
var buttonVariants = (0, import_class_variance_authority.cva)(
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
    const Comp = asChild ? import_react_slot.Slot : "button";
    return /* @__PURE__ */ React.createElement(
      Comp,
      {
        className: cn(buttonVariants({ variant, size, className })),
        ref,
        disabled: disabled || loading,
        ...props
      },
      loading && /* @__PURE__ */ React.createElement(import_lucide_react.Loader2, { className: "mr-2 h-4 w-4 animate-spin" }),
      children
    );
  }
);
Button.displayName = "Button";

// src/components/Card.tsx
var React2 = __toESM(require("react"));
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
var React3 = __toESM(require("react"));
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
var React4 = __toESM(require("react"));
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
var React5 = __toESM(require("react"));
var import_class_variance_authority2 = require("class-variance-authority");
var badgeVariants = (0, import_class_variance_authority2.cva)(
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
var React6 = __toESM(require("react"));
var import_lucide_react2 = require("lucide-react");
var import_class_variance_authority3 = require("class-variance-authority");
var spinnerVariants = (0, import_class_variance_authority3.cva)("animate-spin", {
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
      /* @__PURE__ */ React6.createElement(import_lucide_react2.Loader2, { className: cn(spinnerVariants({ size, color })) }),
      label && /* @__PURE__ */ React6.createElement("span", { className: "ml-2 text-sm text-muted-foreground" }, label)
    );
  }
);
Spinner.displayName = "Spinner";

// src/components/ui/select.tsx
var React7 = __toESM(require("react"));
var SelectPrimitive = __toESM(require("@radix-ui/react-select"));
var import_lucide_react3 = require("lucide-react");
var Select = SelectPrimitive.Root;
var SelectGroup = SelectPrimitive.Group;
var SelectValue = SelectPrimitive.Value;
var SelectTrigger = React7.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ React7.createElement(
  SelectPrimitive.Trigger,
  {
    ref,
    className: cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className
    ),
    ...props
  },
  children,
  /* @__PURE__ */ React7.createElement(SelectPrimitive.Icon, { asChild: true }, /* @__PURE__ */ React7.createElement(import_lucide_react3.ChevronDown, { className: "h-4 w-4 opacity-50" }))
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;
var SelectScrollUpButton = React7.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ React7.createElement(
  SelectPrimitive.ScrollUpButton,
  {
    ref,
    className: cn(
      "flex cursor-default items-center justify-center py-1",
      className
    ),
    ...props
  },
  /* @__PURE__ */ React7.createElement(import_lucide_react3.ChevronUp, { className: "h-4 w-4" })
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;
var SelectScrollDownButton = React7.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ React7.createElement(
  SelectPrimitive.ScrollDownButton,
  {
    ref,
    className: cn(
      "flex cursor-default items-center justify-center py-1",
      className
    ),
    ...props
  },
  /* @__PURE__ */ React7.createElement(import_lucide_react3.ChevronDown, { className: "h-4 w-4" })
));
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;
var SelectContent = React7.forwardRef(({ className, children, position = "popper", ...props }, ref) => /* @__PURE__ */ React7.createElement(SelectPrimitive.Portal, null, /* @__PURE__ */ React7.createElement(
  SelectPrimitive.Content,
  {
    ref,
    className: cn(
      "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
      className
    ),
    position,
    ...props
  },
  /* @__PURE__ */ React7.createElement(SelectScrollUpButton, null),
  /* @__PURE__ */ React7.createElement(
    SelectPrimitive.Viewport,
    {
      className: cn(
        "p-1",
        position === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
      )
    },
    children
  ),
  /* @__PURE__ */ React7.createElement(SelectScrollDownButton, null)
)));
SelectContent.displayName = SelectPrimitive.Content.displayName;
var SelectLabel = React7.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ React7.createElement(
  SelectPrimitive.Label,
  {
    ref,
    className: cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className),
    ...props
  }
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;
var SelectItem = React7.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ React7.createElement(
  SelectPrimitive.Item,
  {
    ref,
    className: cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    ),
    ...props
  },
  /* @__PURE__ */ React7.createElement("span", { className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center" }, /* @__PURE__ */ React7.createElement(SelectPrimitive.ItemIndicator, null, /* @__PURE__ */ React7.createElement(import_lucide_react3.Check, { className: "h-4 w-4" }))),
  /* @__PURE__ */ React7.createElement(SelectPrimitive.ItemText, null, children)
));
SelectItem.displayName = SelectPrimitive.Item.displayName;
var SelectSeparator = React7.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ React7.createElement(
  SelectPrimitive.Separator,
  {
    ref,
    className: cn("-mx-1 my-1 h-px bg-muted", className),
    ...props
  }
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

// src/components/primitives/Toast.tsx
var import_react = __toESM(require("react"));
var import_lucide_react4 = require("lucide-react");
function Toast({
  id,
  variant = "info",
  title,
  message,
  duration = 5e3,
  onClose,
  action
}) {
  const [isVisible, setIsVisible] = (0, import_react.useState)(true);
  const [isExiting, setIsExiting] = (0, import_react.useState)(false);
  (0, import_react.useEffect)(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration]);
  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300);
  };
  if (!isVisible) return null;
  const config = {
    success: {
      bg: "bg-success-50",
      border: "border-success-500",
      text: "text-success-800",
      icon: import_lucide_react4.CheckCircle2,
      iconColor: "text-success-500"
    },
    error: {
      bg: "bg-error-50",
      border: "border-error-500",
      text: "text-error-800",
      icon: import_lucide_react4.AlertCircle,
      iconColor: "text-error-500"
    },
    warning: {
      bg: "bg-warning-50",
      border: "border-warning-500",
      text: "text-warning-800",
      icon: import_lucide_react4.AlertTriangle,
      iconColor: "text-warning-500"
    },
    info: {
      bg: "bg-info-50",
      border: "border-info-500",
      text: "text-info-800",
      icon: import_lucide_react4.Info,
      iconColor: "text-info-500"
    }
  };
  const { bg, border, text, icon: Icon2, iconColor } = config[variant];
  return /* @__PURE__ */ import_react.default.createElement(
    "div",
    {
      className: `
        ${bg} ${border} border-l-4 rounded-lg shadow-lg p-4 max-w-md
        transform transition-all duration-300
        ${isExiting ? "translate-x-full opacity-0" : "translate-x-0 opacity-100"}
        animate-slide-in-right
      `
    },
    /* @__PURE__ */ import_react.default.createElement("div", { className: "flex items-start gap-3" }, /* @__PURE__ */ import_react.default.createElement(Icon2, { className: `w-5 h-5 ${iconColor} flex-shrink-0 mt-0.5` }), /* @__PURE__ */ import_react.default.createElement("div", { className: "flex-1 min-w-0" }, title && /* @__PURE__ */ import_react.default.createElement("h4", { className: `text-sm font-semibold ${text} mb-1` }, title), /* @__PURE__ */ import_react.default.createElement("p", { className: `text-sm ${text}` }, message), action && /* @__PURE__ */ import_react.default.createElement(
      "button",
      {
        onClick: action.onClick,
        className: `mt-2 text-sm font-medium ${text} underline hover:no-underline`
      },
      action.label
    )), /* @__PURE__ */ import_react.default.createElement(
      "button",
      {
        onClick: handleClose,
        className: `${text} hover:opacity-75 transition-opacity flex-shrink-0`,
        "aria-label": "Close"
      },
      /* @__PURE__ */ import_react.default.createElement(import_lucide_react4.X, { className: "w-4 h-4" })
    ))
  );
}
function ToastContainer({
  toasts,
  position = "top-right",
  onRemove
}) {
  const positionClasses = {
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "top-center": "top-4 left-1/2 transform -translate-x-1/2",
    "bottom-center": "bottom-4 left-1/2 transform -translate-x-1/2"
  };
  return /* @__PURE__ */ import_react.default.createElement("div", { className: `fixed ${positionClasses[position]} z-50 flex flex-col gap-3 max-w-md` }, toasts.map((toast, index) => /* @__PURE__ */ import_react.default.createElement(
    Toast,
    {
      key: toast.id || index,
      ...toast,
      onClose: () => toast.id && onRemove(toast.id)
    }
  )));
}
function useToast() {
  const [toasts, setToasts] = (0, import_react.useState)([]);
  const addToast = (toast) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
  };
  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };
  const clearToasts = () => {
    setToasts([]);
  };
  return {
    toasts,
    addToast,
    removeToast,
    clearToasts,
    toast: {
      success: (message, title) => addToast({ variant: "success", message, title }),
      error: (message, title) => addToast({ variant: "error", message, title }),
      warning: (message, title) => addToast({ variant: "warning", message, title }),
      info: (message, title) => addToast({ variant: "info", message, title })
    }
  };
}

// src/components/layout/AppShell.tsx
var React9 = __toESM(require("react"));
var AppShell = React9.forwardRef(
  ({ children, sidebar, header, footer, className }, ref) => {
    return /* @__PURE__ */ React9.createElement(
      "div",
      {
        ref,
        className: cn(
          "min-h-screen bg-background text-foreground",
          className
        )
      },
      header && /* @__PURE__ */ React9.createElement("header", { className: "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" }, header),
      /* @__PURE__ */ React9.createElement("div", { className: "flex flex-1" }, sidebar && /* @__PURE__ */ React9.createElement("aside", { className: "fixed left-0 top-[var(--header-height,0)] z-30 h-[calc(100vh-var(--header-height,0))] w-64 shrink-0 border-r bg-background transition-all duration-300" }, /* @__PURE__ */ React9.createElement("div", { className: "h-full overflow-y-auto scrollbar-thin" }, sidebar)), /* @__PURE__ */ React9.createElement(
        "main",
        {
          className: cn(
            "flex-1 overflow-x-hidden",
            sidebar && "ml-64"
          )
        },
        /* @__PURE__ */ React9.createElement("div", { className: "container mx-auto p-6" }, children)
      )),
      footer && /* @__PURE__ */ React9.createElement("footer", { className: "border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" }, footer)
    );
  }
);
AppShell.displayName = "AppShell";

// src/components/layout/Navigation.tsx
var React10 = __toESM(require("react"));
var import_lucide_react5 = require("lucide-react");
var navigationItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: import_lucide_react5.LayoutDashboard,
    href: "/dashboard",
    roles: ["user", "management", "admin"]
  },
  {
    id: "pov",
    label: "POV Management",
    icon: import_lucide_react5.FileText,
    href: "/pov",
    roles: ["user", "management", "admin"],
    children: [
      { id: "pov-active", label: "Active POVs", icon: import_lucide_react5.FileText, href: "/pov/active", roles: ["user", "management", "admin"] },
      { id: "pov-templates", label: "Templates", icon: import_lucide_react5.Folder, href: "/pov/templates", roles: ["management", "admin"] },
      { id: "pov-analytics", label: "Analytics", icon: import_lucide_react5.BarChart3, href: "/pov/analytics", roles: ["management", "admin"] }
    ]
  },
  {
    id: "trr",
    label: "TRR Management",
    icon: import_lucide_react5.CheckSquare,
    href: "/trr",
    roles: ["user", "management", "admin"],
    children: [
      { id: "trr-active", label: "Active TRRs", icon: import_lucide_react5.CheckSquare, href: "/trr/active", roles: ["user", "management", "admin"] },
      { id: "trr-validation", label: "Validation Queue", icon: import_lucide_react5.Shield, href: "/trr/validation", roles: ["management", "admin"] },
      { id: "trr-reports", label: "Reporting", icon: import_lucide_react5.BarChart3, href: "/trr/reports", roles: ["management", "admin"] }
    ]
  },
  {
    id: "scenarios",
    label: "Scenario Engine",
    icon: import_lucide_react5.Play,
    href: "/scenarios",
    roles: ["user", "management", "admin"],
    children: [
      { id: "scenarios-library", label: "Scenario Library", icon: import_lucide_react5.Folder, href: "/scenarios/library", roles: ["user", "management", "admin"] },
      { id: "scenarios-monitor", label: "Execution Monitor", icon: import_lucide_react5.BarChart3, href: "/scenarios/monitor", roles: ["user", "management", "admin"] },
      { id: "scenarios-archive", label: "Results Archive", icon: import_lucide_react5.FileText, href: "/scenarios/archive", roles: ["management", "admin"] }
    ]
  },
  {
    id: "content",
    label: "Content Hub",
    icon: import_lucide_react5.Folder,
    href: "/content",
    roles: ["user", "management", "admin"]
  },
  {
    id: "terminal",
    label: "Terminal",
    icon: import_lucide_react5.Terminal,
    href: "/terminal",
    roles: ["user", "management", "admin"]
  },
  {
    id: "integrations",
    label: "Integrations",
    icon: import_lucide_react5.Settings,
    href: "/integrations",
    roles: ["management", "admin"]
  },
  {
    id: "admin",
    label: "Administration",
    icon: import_lucide_react5.Users,
    href: "/admin",
    roles: ["admin"],
    children: [
      { id: "admin-users", label: "User Management", icon: import_lucide_react5.Users, href: "/admin/users", roles: ["admin"] },
      { id: "admin-analytics", label: "System Analytics", icon: import_lucide_react5.BarChart3, href: "/admin/analytics", roles: ["admin"] },
      { id: "admin-config", label: "Configuration", icon: import_lucide_react5.Settings, href: "/admin/config", roles: ["admin"] }
    ]
  }
];
var Navigation = React10.forwardRef(
  ({ currentPath, userRole, onNavigate, className }, ref) => {
    const [expandedItems, setExpandedItems] = React10.useState(/* @__PURE__ */ new Set());
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
      const Icon2 = item.icon;
      return /* @__PURE__ */ React10.createElement("div", { key: item.id, className: "mb-1" }, /* @__PURE__ */ React10.createElement(
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
        /* @__PURE__ */ React10.createElement(Icon2, { className: "h-4 w-4 shrink-0" }),
        /* @__PURE__ */ React10.createElement("span", { className: "flex-1 truncate" }, item.label),
        item.badge && /* @__PURE__ */ React10.createElement(Badge, { variant: "secondary", className: "ml-auto" }, item.badge),
        hasChildren && /* @__PURE__ */ React10.createElement(
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
          /* @__PURE__ */ React10.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5l7 7-7 7" })
        )
      ), hasChildren && isExpanded && /* @__PURE__ */ React10.createElement("div", { className: "mt-1 space-y-1" }, item.children.map((child) => renderNavigationItem(child, level + 1))));
    };
    return /* @__PURE__ */ React10.createElement(
      "nav",
      {
        ref,
        className: cn("flex flex-col space-y-2 p-4", className)
      },
      /* @__PURE__ */ React10.createElement("div", { className: "mb-6" }, /* @__PURE__ */ React10.createElement("h2", { className: "cortex-gradient-text text-lg font-semibold tracking-tight" }, "Cortex DC"), /* @__PURE__ */ React10.createElement("p", { className: "text-sm text-muted-foreground" }, "Domain Consultant Platform")),
      navigationItems.map((item) => renderNavigationItem(item))
    );
  }
);
Navigation.displayName = "Navigation";

// src/components/Terminal.tsx
var import_react2 = __toESM(require("react"));
var Terminal = ({ output = [], className = "" }) => {
  return /* @__PURE__ */ import_react2.default.createElement("div", { className: `bg-black text-green-400 font-mono p-4 rounded ${className}` }, output.map((line, index) => /* @__PURE__ */ import_react2.default.createElement("div", { key: index }, line)));
};

// src/components/pov/POVCard.tsx
var import_react3 = __toESM(require("react"));
var POVCard = ({ title, description, className }) => {
  return /* @__PURE__ */ import_react3.default.createElement(Card, { className }, /* @__PURE__ */ import_react3.default.createElement("h3", { className: "text-lg font-semibold mb-2" }, title), description && /* @__PURE__ */ import_react3.default.createElement("p", { className: "text-gray-600" }, description));
};

// src/components/trr/TRRStatus.tsx
var import_react4 = __toESM(require("react"));
var statusConfig = {
  draft: {
    color: "bg-gray-100 text-gray-800 border-gray-300",
    label: "Draft",
    icon: "\u{1F4DD}"
  },
  pending: {
    color: "bg-yellow-100 text-yellow-800 border-yellow-300",
    label: "Pending",
    icon: "\u23F3"
  },
  "in-progress": {
    color: "bg-blue-100 text-blue-800 border-blue-300",
    label: "In Progress",
    icon: "\u{1F504}"
  },
  in_review: {
    color: "bg-purple-100 text-purple-800 border-purple-300",
    label: "In Review",
    icon: "\u{1F440}"
  },
  validated: {
    color: "bg-teal-100 text-teal-800 border-teal-300",
    label: "Validated",
    icon: "\u2713"
  },
  approved: {
    color: "bg-green-100 text-green-800 border-green-300",
    label: "Approved",
    icon: "\u2705"
  },
  rejected: {
    color: "bg-red-100 text-red-800 border-red-300",
    label: "Rejected",
    icon: "\u274C"
  },
  completed: {
    color: "bg-green-100 text-green-800 border-green-300",
    label: "Completed",
    icon: "\u{1F389}"
  },
  failed: {
    color: "bg-red-100 text-red-800 border-red-300",
    label: "Failed",
    icon: "\u26A0\uFE0F"
  }
};
var TRRStatus = ({
  status,
  className = "",
  showIcon = false
}) => {
  const config = statusConfig[status] || statusConfig.draft;
  return /* @__PURE__ */ import_react4.default.createElement(
    "span",
    {
      className: `inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${config.color} ${className}`
    },
    showIcon && /* @__PURE__ */ import_react4.default.createElement("span", { className: "text-xs" }, config.icon),
    /* @__PURE__ */ import_react4.default.createElement("span", null, config.label)
  );
};

// src/hooks/useTerminal.ts
var import_react5 = require("react");
var useTerminal = () => {
  const [output, setOutput] = (0, import_react5.useState)([]);
  const [isLoading, setIsLoading] = (0, import_react5.useState)(false);
  const [error, setError] = (0, import_react5.useState)(null);
  const addLine = (0, import_react5.useCallback)((line) => {
    setOutput((prev) => [...prev, line]);
  }, []);
  const clear = (0, import_react5.useCallback)(() => {
    setOutput([]);
    setError(null);
  }, []);
  const setLoading = (0, import_react5.useCallback)((loading) => {
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
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
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  Spinner,
  TRRStatus,
  Terminal,
  Textarea,
  Toast,
  ToastContainer,
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
  useTerminal,
  useToast
});
//# sourceMappingURL=index.js.map