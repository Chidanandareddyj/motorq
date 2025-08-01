"use client";
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Menu, Car, BarChart3, PlusCircle, LogOut } from "lucide-react";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const navigationItems = [
    { href: "/", label: "Dashboard", icon: BarChart3 },
    { href: "/parkingslots", label: "Parking Slots", icon: Car },
    { href: "/vehicleform", label: "Park Vehicle", icon: PlusCircle },
    { href: "/daypass", label: "Day Pass", icon: PlusCircle },
    { href: "/exit", label: "Exit Vehicle", icon: LogOut },
    { href: "/revenue", label: "Revenue", icon: BarChart3 },
  ];

  const isActive = (path) => pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 lg:px-6">
        <nav className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Car className="h-5 w-5" />
            </div>
            <div 
              className="text-xl font-bold text-foreground cursor-pointer hover:text-primary transition-colors duration-200"
              onClick={() => router.push("/")}
            >
              MotorQ
            </div>
          </div>

          {/* Desktop Navigation */}
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList className="flex space-x-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavigationMenuItem key={item.href}>
                    <NavigationMenuLink 
                      className={`group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
                        isActive(item.href)
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      }`}
                      onClick={() => router.push(item.href)}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {item.label}
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                );
              })}
            </NavigationMenuList>
          </NavigationMenu>

          {/* Mobile Menu Button */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 sm:w-96">
              <div className="flex flex-col space-y-4 mt-8">
                <div className="flex items-center space-x-2 mb-6">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Car className="h-5 w-5" />
                  </div>
                  <span className="text-lg font-semibold">MotorQ Navigation</span>
                </div>
                
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Button
                      key={item.href}
                      variant={isActive(item.href) ? "default" : "ghost"}
                      className="justify-start h-12 text-left"
                      onClick={() => {
                        router.push(item.href);
                        setMobileMenuOpen(false);
                      }}
                    >
                      <Icon className="mr-3 h-5 w-5" />
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{item.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {item.href === "/" && "View analytics & overview"}
                          {item.href === "/parkingslots" && "Manage parking spaces"}
                          {item.href === "/vehicleform" && "Register new vehicle"}
                          {item.href === "/daypass" && "Issue a day pass"}
                          {item.href === "/exit" && "Process vehicle exit"}
                          {item.href === "/revenue" && "View revenue"}
                        </span>
                      </div>
                    </Button>
                  );
                })}
              </div>
            </SheetContent>
          </Sheet>
        </nav>
      </div>
    </header>
  );
}
