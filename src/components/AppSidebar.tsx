import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  GitCompareArrows,
  TrendingUp,
  Store,
  Tags,
} from "lucide-react";
import swiftLogo from "@/assets/swift-logo.svg";

const nav = [
  { to: "/", label: "Visão Executiva", icon: LayoutDashboard },
  { to: "/comparativos", label: "Comparativos", icon: GitCompareArrows },
  { to: "/tendencia", label: "Tendência", icon: TrendingUp },
  { to: "/lojas", label: "Ranking de Lojas", icon: Store },
  { to: "/categorias", label: "Categorias", icon: Tags },
] as const;

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-sidebar-border bg-sidebar sticky top-0 h-screen">
      {/* Logo alone, no background plate */}
      <div className="px-7 pt-8 pb-10">
        <img
          src={swiftLogo}
          alt="Swift"
          className="h-9 w-auto select-none"
          draggable={false}
        />
      </div>

      <nav className="flex-1 px-3 space-y-1">
        <p className="px-4 mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          Painéis
        </p>
        {nav.map(({ to, label, icon: Icon }) => {
          const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={[
                "group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all",
                active
                  ? "bg-primary text-primary-foreground shadow-glow"
                  : "text-sidebar-foreground hover:bg-sidebar-accent",
              ].join(" ")}
            >
              <Icon className={active ? "h-4 w-4" : "h-4 w-4 text-muted-foreground group-hover:text-foreground"} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-5 border-t border-sidebar-border">
        <div className="rounded-2xl bg-gradient-surface border border-border p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            NPS Intelligence
          </p>
          <p className="mt-1 text-sm font-semibold leading-snug">
            Análise visual de pesquisas de satisfação
          </p>
        </div>
      </div>
    </aside>
  );
}
