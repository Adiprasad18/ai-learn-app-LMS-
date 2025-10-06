"use client"
import { Button } from "@/components/ui/button";
import { LayoutDashboard, UserCircle, Plus, Sparkles, LogOut } from "lucide-react";
import { useClerk } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { memo, useCallback, useMemo } from "react";

function SideBar() {
  const MenuList = useMemo(() => [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
    },
    {
      name: "Profile",
      icon: UserCircle,
      path: "/dashboard/profile",
    },
  ], []);

  const path = usePathname();
  const router = useRouter();
  const { signOut } = useClerk();

  const handleSignOut = useCallback(async () => {
    await signOut();
    router.push('/');
  }, [signOut, router]);

  return (
    <div className="h-screen bg-background border-r border-border flex flex-col relative overflow-hidden transition-all duration-300">
      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <Link href="/" className="flex gap-3 items-center group">
            <div className="relative p-2 rounded-xl bg-primary/10 dark:bg-primary/20 group-hover:bg-primary/15 dark:group-hover:bg-primary/25 transition-all duration-300">
              <Image 
                src="/logo.svg" 
                alt="AI Learn logo" 
                width={24} 
                height={24} 
                style={{ height: 'auto' }} 
                className="relative z-10"
                priority
              />
            </div>
            <h2 className="font-bold text-xl text-primary dark:text-primary group-hover:opacity-80 transition-opacity duration-300">
              AI Learn
            </h2>
          </Link>
        </div>

        {/* Create Button */}
        <div className="p-6">
          <Link href={'/create'}>
            <Button className="w-full h-11 bg-primary hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/90 shadow-sm hover:shadow-md transition-all duration-200 group">
              <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform duration-200" />
              <span className="font-semibold">Create Course</span>
            </Button>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-2">
          <div className="space-y-1">
            {MenuList.map((menu) => (
              <Link
                key={menu.path}
                href={menu.path}
                className={`flex gap-3 items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group ${
                  path === menu.path
                    ? 'bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted dark:hover:bg-muted'
                }`}>
                <menu.icon className={`w-4 h-4 transition-all duration-200 ${
                  path === menu.path ? 'text-primary dark:text-primary' : 'text-muted-foreground group-hover:text-foreground'
                }`} />
                <span>{menu.name}</span>
              </Link>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-6 border-t border-border space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted dark:bg-muted">
            <div className="p-2 rounded-lg bg-primary/10 dark:bg-primary/20">
              <Sparkles className="w-4 h-4 text-primary dark:text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground dark:text-foreground">
                AI-Powered
              </p>
              <p className="text-xs text-muted-foreground dark:text-muted-foreground">Unlimited courses</p>
            </div>
          </div>
          
          {/* Sign Out Button */}
          <Button
            onClick={handleSignOut}
            variant="ghost"
            className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Sign Out</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default memo(SideBar);
