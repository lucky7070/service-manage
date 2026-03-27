"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import Image from "next/image";
import {
  Bell,
  Check,
  CircleAlert,
  CircleCheckBig,
  CircleX,
  Download,
  Heart,
  Info,
  Mail,
  Search,
  Share2,
  Star,
  Trash2,
  Upload,
  X
} from "lucide-react";
import AdminBreadcrumb from "@/components/admin/AdminBreadcrumb";
import { Badge, Button, Checkbox, ProgressBar, ToggleSwitch } from "@/components/ui";

export default function AdminUiElementsPage() {
  const [tab, setTab] = useState<"all" | "active" | "completed">("all");
  const [pill, setPill] = useState<"all" | "active" | "completed">("all");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [tags, setTags] = useState(["React", "TypeScript", "Tailwind"]);
  const [toggleOn, setToggleOn] = useState(false);
  const [radio, setRadio] = useState("option1");

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const removeTag = (t: string) => setTags((prev) => prev.filter((x) => x !== t));

  return (
    <div className="p-4 lg:p-6">
      <AdminBreadcrumb items={[{ label: "UI Elements" }]} />

      <div className="mb-6">
        <h1 className="mb-2 text-3xl font-bold text-secondary-900 dark:text-white">UI Elements</h1>
        <p className="text-secondary-600 dark:text-secondary-400">
          Comprehensive collection of reusable UI components.
        </p>
      </div>

      {/* Buttons */}
      <div className="card mb-6 p-6">
        <div className="mb-4 flex flex-col space-y-1.5">
          <h2 className="text-lg font-semibold text-secondary-900 dark:text-white">Buttons</h2>
        </div>
        <div className="space-y-6">
          <div>
            <h3 className="mb-3 text-sm font-semibold text-secondary-700 dark:text-secondary-300">Primary Buttons</h3>
            <div className="flex flex-wrap gap-3">
              <Button type="button" variant="primary" size="sm">
                Small
              </Button>
              <Button type="button" variant="primary" size="md">
                Medium
              </Button>
              <Button type="button" variant="primary" size="lg">
                Large
              </Button>
              <Button type="button" variant="primary" size="md" disabled>
                Disabled
              </Button>
            </div>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold text-secondary-700 dark:text-secondary-300">Button Variants</h3>
            <div className="flex flex-wrap gap-3">
              <Button type="button" variant="primary" size="md">
                Primary
              </Button>
              <Button type="button" variant="secondary" size="md">
                Secondary
              </Button>
              <Button type="button" variant="success" size="md">
                Success
              </Button>
              <Button type="button" variant="warning" size="md">
                Warning
              </Button>
              <Button type="button" variant="danger" size="md">
                Danger
              </Button>
              <Button type="button" variant="outline" size="md">
                Outline
              </Button>
            </div>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold text-secondary-700 dark:text-secondary-300">Buttons with Icons</h3>
            <div className="flex flex-wrap gap-3">
              <Button type="button" variant="primary" size="md">
                <Download className="h-4 w-4" />
                Download
              </Button>
              <Button type="button" variant="success" size="md">
                <Upload className="h-4 w-4" />
                Upload
              </Button>
              <Button type="button" variant="secondary" size="md">
                <Mail className="h-4 w-4" />
                Email
              </Button>
              <Button type="button" variant="ghost" size="md">
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </div>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold text-secondary-700 dark:text-secondary-300">Icon Buttons</h3>
            <div className="flex flex-wrap gap-3">
              <Button type="button" variant="primary" size="md" className="h-10 min-h-10 w-10 min-w-10 p-2" aria-label="Notifications">
                <Bell className="h-5 w-5" />
              </Button>
              <Button type="button" variant="success" size="md" className="h-10 min-h-10 w-10 min-w-10 p-2" aria-label="Confirm">
                <Check className="h-5 w-5" />
              </Button>
              <Button type="button" variant="danger" size="md" className="h-10 min-h-10 w-10 min-w-10 p-2" aria-label="Delete">
                <Trash2 className="h-5 w-5" />
              </Button>
              <Button type="button" variant="ghost" size="md" className="h-10 min-h-10 w-10 min-w-10 p-2" aria-label="Favorite">
                <Heart className="h-5 w-5" />
              </Button>
              <Button type="button" variant="ghost" size="md" className="h-10 min-h-10 w-10 min-w-10 p-2" aria-label="Star">
                <Star className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="card mb-6 p-6">
        <div className="mb-4 flex flex-col space-y-1.5">
          <h2 className="text-lg font-semibold text-secondary-900 dark:text-white">Badges</h2>
        </div>
        <div className="space-y-6">
          <div>
            <h3 className="mb-3 text-sm font-semibold text-secondary-700 dark:text-secondary-300">Badge Sizes</h3>
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="primary" size="sm">
                Small
              </Badge>
              <Badge variant="primary" size="md">
                Medium
              </Badge>
              <Badge variant="primary" size="lg">
                Large
              </Badge>
            </div>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold text-secondary-700 dark:text-secondary-300">Badge Variants</h3>
            <div className="flex flex-wrap gap-3">
              <Badge variant="primary" size="md">
                Primary
              </Badge>
              <Badge variant="secondary" size="md">
                Secondary
              </Badge>
              <Badge variant="success" size="md">
                Success
              </Badge>
              <Badge variant="warning" size="md">
                Warning
              </Badge>
              <Badge variant="danger" size="md">
                Danger
              </Badge>
              <Badge variant="info" size="md">
                Info
              </Badge>
            </div>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold text-secondary-700 dark:text-secondary-300">Badges with Icons</h3>
            <div className="flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-1 rounded-full bg-success-100 px-2.5 py-1 text-xs font-medium text-success-700 dark:bg-success-900/20 dark:text-success-400">
                <CircleCheckBig className="h-3.5 w-3.5" />
                Completed
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-warning-100 px-2.5 py-1 text-xs font-medium text-warning-700 dark:bg-warning-900/20 dark:text-warning-400">
                <CircleAlert className="h-3.5 w-3.5" />
                Pending
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-danger-100 px-2.5 py-1 text-xs font-medium text-danger-700 dark:bg-danger-900/20 dark:text-danger-400">
                <CircleX className="h-3.5 w-3.5" />
                Failed
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-info-100 px-2.5 py-1 text-xs font-medium text-info-700 dark:bg-info-900/20 dark:text-info-400">
                <Info className="h-3.5 w-3.5" />
                Info
              </span>
            </div>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold text-secondary-700 dark:text-secondary-300">Removable Badges</h3>
            <div className="flex flex-wrap gap-3">
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary-100 px-3 py-1.5 text-sm font-medium text-primary-700 dark:bg-primary-900/20 dark:text-primary-400"
                >
                  {t}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 min-w-6 hover:bg-primary-200 dark:hover:bg-primary-800"
                    onClick={() => removeTag(t)}
                    aria-label={`Remove ${t}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div className="card mb-6 p-6">
        <div className="mb-4 flex flex-col space-y-1.5">
          <h2 className="text-lg font-semibold text-secondary-900 dark:text-white">Alerts</h2>
        </div>
        <div className="space-y-4">
          <AlertRow tone="success" title="Success!" text="Your changes have been saved successfully." icon={CircleCheckBig} />
          <AlertRow tone="info" title="Information" text="This is an informational message to keep you updated." icon={Info} />
          <AlertRow tone="warning" title="Warning" text="Please review your information before proceeding." icon={CircleAlert} />
          <AlertRow tone="danger" title="Error" text="There was an error processing your request. Please try again." icon={CircleX} />
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Form controls */}
        <div className="card p-6">
          <div className="mb-4 flex flex-col space-y-1.5">
            <h2 className="text-lg font-semibold text-secondary-900 dark:text-white">Form Controls</h2>
          </div>
          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-secondary-700 dark:text-secondary-300">Text Input</label>
              <input
                placeholder="Enter your name"
                className="w-full rounded-lg border border-secondary-200 bg-white px-4 py-2 text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-secondary-700 dark:bg-secondary-900 dark:text-white dark:focus:ring-primary-400"
                type="text"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-secondary-700 dark:text-secondary-300">Search Input</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400" aria-hidden />
                <input
                  placeholder="Search..."
                  className="w-full rounded-lg border border-secondary-200 bg-white py-2 pl-10 pr-4 text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-secondary-700 dark:bg-secondary-900 dark:text-white dark:focus:ring-primary-400"
                  type="text"
                />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-secondary-700 dark:text-secondary-300">Textarea</label>
              <textarea
                rows={4}
                placeholder="Enter your message"
                className="w-full resize-none rounded-lg border border-secondary-200 bg-white px-4 py-2 text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-secondary-700 dark:bg-secondary-900 dark:text-white dark:focus:ring-primary-400"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-secondary-700 dark:text-secondary-300">Select</label>
              <select className="w-full rounded-lg border border-secondary-200 bg-white px-4 py-2 text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-secondary-700 dark:bg-secondary-900 dark:text-white dark:focus:ring-primary-400">
                <option>Option 1</option>
                <option>Option 2</option>
                <option>Option 3</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-secondary-700 dark:text-secondary-300">Checkboxes</label>
              <div className="space-y-2">
                <label className="flex cursor-pointer items-center gap-2">
                  <Checkbox defaultChecked />
                  <span className="text-sm text-secondary-700 dark:text-secondary-300">Remember me</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <Checkbox />
                  <span className="text-sm text-secondary-700 dark:text-secondary-300">Subscribe to newsletter</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <Checkbox />
                  <span className="text-sm text-secondary-700 dark:text-secondary-300">Accept terms and conditions</span>
                </label>
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-secondary-700 dark:text-secondary-300">Radio Buttons</label>
              <div className="space-y-2">
                {[
                  { v: "option1", l: "Email" },
                  { v: "option2", l: "SMS" },
                  { v: "option3", l: "Push notification" }
                ].map((o) => (
                  <label key={o.v} className="flex cursor-pointer items-center gap-2">
                    <input
                      className="h-4 w-4 border-secondary-300 text-primary-600 focus:ring-2 focus:ring-primary-500 dark:border-secondary-600 dark:focus:ring-primary-400"
                      type="radio"
                      name="demo-radio"
                      value={o.v}
                      checked={radio === o.v}
                      onChange={() => setRadio(o.v)}
                    />
                    <span className="text-sm text-secondary-700 dark:text-secondary-300">{o.l}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-secondary-700 dark:text-secondary-300">Toggle Switch</label>
              <ToggleSwitch checked={toggleOn} onCheckedChange={(v) => setToggleOn(v)} />
              <span className="ml-3 text-sm text-secondary-700 dark:text-secondary-300">{toggleOn ? "Enabled" : "Disabled"}</span>
            </div>
          </div>
        </div>

        {/* Tabs & dropdown */}
        <div className="card p-6">
          <div className="mb-4 flex flex-col space-y-1.5">
            <h2 className="text-lg font-semibold text-secondary-900 dark:text-white">Tabs & Dropdowns</h2>
          </div>
          <div className="space-y-6">
            <div>
              <h3 className="mb-3 text-sm font-semibold text-secondary-700 dark:text-secondary-300">Tabs</h3>
              <div className="border-b border-secondary-200 dark:border-secondary-700">
                <nav className="flex gap-4">
                  {(["all", "active", "completed"] as const).map((k) => (
                    <Button
                      key={k}
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setTab(k)}
                      className={`rounded-none border-b-2 px-1 pb-3 font-medium shadow-none ring-0 focus-visible:ring-0 ${
                        tab === k
                          ? "border-primary-600 text-primary-600 dark:text-primary-400"
                          : "border-transparent text-secondary-600 hover:text-secondary-900 dark:text-secondary-400 dark:hover:text-white"
                      }`}
                    >
                      {k === "all" ? "All" : k === "active" ? "Active" : "Completed"}
                    </Button>
                  ))}
                </nav>
              </div>
              <div className="mt-4 rounded-lg bg-secondary-50 p-4 dark:bg-secondary-800/50">
                <p className="text-sm text-secondary-700 dark:text-secondary-300">
                  Content for <span className="font-semibold">{tab}</span> tab
                </p>
              </div>
            </div>
            <div>
              <h3 className="mb-3 text-sm font-semibold text-secondary-700 dark:text-secondary-300">Pills Tabs</h3>
              <div className="flex gap-2">
                {(["all", "active", "completed"] as const).map((k) => (
                  <Button
                    key={k}
                    type="button"
                    variant={pill === k ? "primary" : "secondary"}
                    size="sm"
                    onClick={() => setPill(k)}
                  >
                    {k === "all" ? "All" : k === "active" ? "Active" : "Completed"}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="mb-3 text-sm font-semibold text-secondary-700 dark:text-secondary-300">Dropdown Menu</h3>
              <div className="relative inline-block" ref={menuRef}>
                <Button type="button" variant="primary" size="md" onClick={() => setMenuOpen((o) => !o)} aria-expanded={menuOpen}>
                  Open Menu
                </Button>
                {menuOpen ? (
                  <div className="absolute left-0 z-50 mt-2 min-w-40 rounded-lg border border-secondary-200 bg-white py-1 shadow-lg dark:border-secondary-700 dark:bg-secondary-900">
                    <Button type="button" variant="ghost" size="md" className="w-full justify-start font-normal px-4 py-2">
                      Profile
                    </Button>
                    <Button type="button" variant="ghost" size="md" className="w-full justify-start font-normal px-4 py-2">
                      Settings
                    </Button>
                    <Button type="button" variant="ghost" size="md" className="w-full justify-start font-normal px-4 py-2">
                      Log out
                    </Button>
                  </div>
                ) : null}
              </div>
            </div>
            <div>
              <h3 className="mb-3 text-sm font-semibold text-secondary-700 dark:text-secondary-300">Progress Bars</h3>
              <div className="space-y-4">
                <ProgressBar label="Progress" value={75} tone="primary" />
                <ProgressBar label="Success" value={100} tone="success" />
                <ProgressBar label="Warning" value={45} tone="warning" />
                <ProgressBar label="Danger" value={25} tone="danger" />
              </div>
            </div>
            <div>
              <h3 className="mb-3 text-sm font-semibold text-secondary-700 dark:text-secondary-300">Loading Spinners</h3>
              <div className="flex items-center gap-4">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600 dark:border-primary-800 dark:border-t-primary-400" />
                <div className="h-6 w-6 animate-spin rounded-full border-4 border-success-200 border-t-success-600 dark:border-success-800 dark:border-t-success-400" />
                <div className="h-4 w-4 animate-spin rounded-full border-4 border-warning-200 border-t-warning-600 dark:border-warning-800 dark:border-t-warning-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Avatars */}
      <div className="card mb-6 p-6">
        <div className="mb-4 flex flex-col space-y-1.5">
          <h2 className="text-lg font-semibold text-secondary-900 dark:text-white">Avatars</h2>
        </div>
        <div className="space-y-6">
          <div>
            <h3 className="mb-3 text-sm font-semibold text-secondary-700 dark:text-secondary-300">Avatar Sizes</h3>
            <div className="flex items-center gap-4">
              {[1, 2, 3, 4].map((i, idx) => (
                <Avatar key={i} size={["w-8 h-8", "w-10 h-10", "w-12 h-12", "w-16 h-16"][idx]} img={i} />
              ))}
            </div>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold text-secondary-700 dark:text-secondary-300">Avatar Group</h3>
            <div className="-space-x-2 flex">
              {[1, 2, 3, 4, 5].map((i) => (
                <Image
                  key={i}
                  src={`https://i.pravatar.cc/150?img=${i}`}
                  alt="Avatar"
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full border-2 border-white dark:border-secondary-900"
                  unoptimized
                />
              ))}
              <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-secondary-200 dark:border-secondary-900 dark:bg-secondary-700">
                <span className="text-xs font-medium text-secondary-700 dark:text-secondary-300">+5</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold text-secondary-700 dark:text-secondary-300">Avatar with Status</h3>
            <div className="flex items-center gap-4">
              <StatusAvatar img={6} status="bg-success-500" />
              <StatusAvatar img={7} status="bg-warning-500" />
              <StatusAvatar img={8} status="bg-secondary-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AlertRow({
  tone,
  title,
  text,
  icon: Icon
}: {
  tone: "success" | "info" | "warning" | "danger";
  title: string;
  text: string;
  icon: ComponentType<{ className?: string }>;
}) {
  const map = {
    success: "bg-success-50 border-success-200 dark:bg-success-900/20 dark:border-success-800",
    info: "bg-info-50 border-info-200 dark:bg-info-900/20 dark:border-info-800",
    warning: "bg-warning-50 border-warning-200 dark:bg-warning-900/20 dark:border-warning-800",
    danger: "bg-danger-50 border-danger-200 dark:bg-danger-900/20 dark:border-danger-800"
  } as const;
  const iconMap = {
    success: "text-success-600 dark:text-success-400",
    info: "text-info-600 dark:text-info-400",
    warning: "text-warning-600 dark:text-warning-400",
    danger: "text-danger-600 dark:text-danger-400"
  } as const;
  const titleMap = {
    success: "text-success-900 dark:text-success-100",
    info: "text-info-900 dark:text-info-100",
    warning: "text-warning-900 dark:text-warning-100",
    danger: "text-danger-900 dark:text-danger-100"
  } as const;
  const bodyMap = {
    success: "text-success-700 dark:text-success-300",
    info: "text-info-700 dark:text-info-300",
    warning: "text-warning-700 dark:text-warning-300",
    danger: "text-danger-700 dark:text-danger-300"
  } as const;

  return (
    <div className={`flex items-start gap-3 rounded-lg border p-4 ${map[tone]}`}>
      <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${iconMap[tone]}`} aria-hidden />
      <div className="flex-1">
        <h4 className={`mb-1 text-sm font-semibold ${titleMap[tone]}`}>{title}</h4>
        <p className={`text-sm ${bodyMap[tone]}`}>{text}</p>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={`h-8 w-8 min-w-8 ${tone === "success" ? "text-success-600 hover:bg-success-100 dark:text-success-400 dark:hover:bg-success-800" : ""} ${tone === "info" ? "text-info-600 hover:bg-info-100 dark:text-info-400 dark:hover:bg-info-800" : ""} ${tone === "warning" ? "text-warning-600 hover:bg-warning-100 dark:text-warning-400 dark:hover:bg-warning-800" : ""} ${tone === "danger" ? "text-danger-600 hover:bg-danger-100 dark:text-danger-400 dark:hover:bg-danger-800" : ""}`}
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

function Avatar({ size, img }: { size: string; img: number }) {
  return (
    <Image
      src={`https://i.pravatar.cc/150?img=${img}`}
      alt="Avatar"
      width={64}
      height={64}
      className={`${size} rounded-full object-cover`}
      unoptimized
    />
  );
}

function StatusAvatar({ img, status }: { img: number; status: string }) {
  return (
    <div className="relative">
      <Image
        src={`https://i.pravatar.cc/150?img=${img}`}
        alt="Avatar"
        width={48}
        height={48}
        className="h-12 w-12 rounded-full object-cover"
        unoptimized
      />
      <div className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-secondary-900 ${status}`} />
    </div>
  );
}
