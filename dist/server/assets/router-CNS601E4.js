import { t as NpsDataProvider } from "./npsDataContext-VKmOdn_1.js";
import { useEffect } from "react";
import { HeadContent, Link, Outlet, Scripts, createFileRoute, createRootRouteWithContext, createRouter, lazyRouteComponent, useRouter, useRouterState } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GitCompareArrows, LayoutDashboard, Store, Tags, TrendingUp } from "lucide-react";
//#region src/styles.css?url
var styles_default = "/assets/styles-BwT9T-hx.css";
//#endregion
//#region src/lib/lovable-error-reporting.ts
function reportLovableError(error, context = {}) {
	if (typeof window === "undefined") return;
	window.__lovableEvents?.captureException?.(error, {
		source: "react_error_boundary",
		route: window.location.pathname,
		...context
	}, {
		mechanism: "react_error_boundary",
		handled: false,
		severity: "error"
	});
}
//#endregion
//#region src/assets/swift-logo.svg
var swift_logo_default = "/assets/swift-logo-_Zxh6-Ne.svg";
//#endregion
//#region src/components/AppSidebar.tsx
var nav = [
	{
		to: "/",
		label: "Visão Executiva",
		icon: LayoutDashboard
	},
	{
		to: "/comparativos",
		label: "Comparativos",
		icon: GitCompareArrows
	},
	{
		to: "/tendencia",
		label: "Tendência",
		icon: TrendingUp
	},
	{
		to: "/lojas",
		label: "Ranking de Lojas",
		icon: Store
	},
	{
		to: "/categorias",
		label: "Categorias",
		icon: Tags
	}
];
function AppSidebar() {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	return /* @__PURE__ */ jsxs("aside", {
		className: "hidden lg:flex flex-col w-64 shrink-0 border-r border-sidebar-border bg-sidebar sticky top-0 h-screen",
		children: [
			/* @__PURE__ */ jsx("div", {
				className: "px-7 pt-8 pb-10",
				children: /* @__PURE__ */ jsx("img", {
					src: swift_logo_default,
					alt: "Swift",
					className: "h-9 w-auto select-none",
					draggable: false
				})
			}),
			/* @__PURE__ */ jsxs("nav", {
				className: "flex-1 px-3 space-y-1",
				children: [/* @__PURE__ */ jsx("p", {
					className: "px-4 mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground",
					children: "Painéis"
				}), nav.map(({ to, label, icon: Icon }) => {
					const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
					return /* @__PURE__ */ jsxs(Link, {
						to,
						className: ["group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all", active ? "bg-primary text-primary-foreground shadow-glow" : "text-sidebar-foreground hover:bg-sidebar-accent"].join(" "),
						children: [/* @__PURE__ */ jsx(Icon, { className: active ? "h-4 w-4" : "h-4 w-4 text-muted-foreground group-hover:text-foreground" }), /* @__PURE__ */ jsx("span", { children: label })]
					}, to);
				})]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "p-5 border-t border-sidebar-border",
				children: /* @__PURE__ */ jsxs("div", {
					className: "rounded-2xl bg-gradient-surface border border-border p-4",
					children: [/* @__PURE__ */ jsx("p", {
						className: "text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground",
						children: "NPS Intelligence"
					}), /* @__PURE__ */ jsx("p", {
						className: "mt-1 text-sm font-semibold leading-snug",
						children: "Análise visual de pesquisas de satisfação"
					})]
				})
			})
		]
	});
}
//#endregion
//#region src/routes/__root.tsx
function NotFoundComponent() {
	return /* @__PURE__ */ jsx("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ jsxs("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ jsx("h1", {
					className: "text-7xl font-bold text-foreground",
					children: "404"
				}),
				/* @__PURE__ */ jsx("h2", {
					className: "mt-4 text-xl font-semibold",
					children: "Página não encontrada"
				}),
				/* @__PURE__ */ jsx("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "O painel que você procura não existe ou foi movido."
				}),
				/* @__PURE__ */ jsx("div", {
					className: "mt-6",
					children: /* @__PURE__ */ jsx(Link, {
						to: "/",
						className: "inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90",
						children: "Voltar ao dashboard"
					})
				})
			]
		})
	});
}
function ErrorComponent({ error, reset }) {
	console.error(error);
	const router = useRouter();
	useEffect(() => {
		reportLovableError(error, { boundary: "tanstack_root_error_component" });
	}, [error]);
	return /* @__PURE__ */ jsx("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ jsxs("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ jsx("h1", {
					className: "text-xl font-semibold tracking-tight",
					children: "Algo deu errado"
				}),
				/* @__PURE__ */ jsx("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Tente recarregar este painel."
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "mt-6 flex flex-wrap justify-center gap-2",
					children: [/* @__PURE__ */ jsx("button", {
						onClick: () => {
							router.invalidate();
							reset();
						},
						className: "inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90",
						children: "Tentar novamente"
					}), /* @__PURE__ */ jsx("a", {
						href: "/",
						className: "inline-flex items-center justify-center rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold hover:bg-accent",
						children: "Ir para o início"
					})]
				})
			]
		})
	});
}
var Route$5 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "Swift NPS Intelligence" },
			{
				name: "description",
				content: "Painel executivo de NPS — análises visuais para decisão."
			},
			{
				name: "author",
				content: "Swift"
			},
			{
				property: "og:title",
				content: "Swift NPS Intelligence"
			},
			{
				property: "og:description",
				content: "Painel executivo de NPS — análises visuais para decisão."
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary"
			},
			{
				name: "twitter:title",
				content: "Swift NPS Intelligence"
			},
			{
				name: "twitter:description",
				content: "Painel executivo de NPS — análises visuais para decisão."
			},
			{
				property: "og:image",
				content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/381fd3e8-1013-4212-b897-6920dc9e7586/id-preview-d503bf5b--4bedf01d-f80e-4beb-b252-89f7e554dc60.lovable.app-1781547570207.png"
			},
			{
				name: "twitter:image",
				content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/381fd3e8-1013-4212-b897-6920dc9e7586/id-preview-d503bf5b--4bedf01d-f80e-4beb-b252-89f7e554dc60.lovable.app-1781547570207.png"
			}
		],
		links: [
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap"
			}
		]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ jsxs("html", {
		lang: "pt-BR",
		children: [/* @__PURE__ */ jsx("head", { children: /* @__PURE__ */ jsx(HeadContent, {}) }), /* @__PURE__ */ jsxs("body", { children: [children, /* @__PURE__ */ jsx(Scripts, {})] })]
	});
}
function RootComponent() {
	const { queryClient } = Route$5.useRouteContext();
	return /* @__PURE__ */ jsx(QueryClientProvider, {
		client: queryClient,
		children: /* @__PURE__ */ jsx(NpsDataProvider, { children: /* @__PURE__ */ jsxs("div", {
			className: "min-h-screen w-full flex bg-background",
			children: [/* @__PURE__ */ jsx(AppSidebar, {}), /* @__PURE__ */ jsx("main", {
				className: "flex-1 min-w-0 px-5 py-8 sm:px-8 lg:px-12 lg:py-12",
				children: /* @__PURE__ */ jsx("div", {
					className: "mx-auto w-full max-w-7xl",
					children: /* @__PURE__ */ jsx(Outlet, {})
				})
			})]
		}) })
	});
}
//#endregion
//#region src/routes/tendencia.tsx
var $$splitComponentImporter$4 = () => import("./tendencia-DNMxk7U3.js");
var Route$4 = createFileRoute("/tendencia")({
	head: () => ({ meta: [{ title: "Tendência mensal — Swift NPS" }, {
		name: "description",
		content: "Evolução mensal do NPS e volume de comentários."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
//#endregion
//#region src/routes/lojas.tsx
var $$splitComponentImporter$3 = () => import("./lojas-CwNT_wmZ.js");
var Route$3 = createFileRoute("/lojas")({
	head: () => ({ meta: [{ title: "Ranking de Lojas — Swift NPS" }, {
		name: "description",
		content: "NPS por loja, com filtros por gestão e região."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
//#endregion
//#region src/routes/comparativos.tsx
var $$splitComponentImporter$2 = () => import("./comparativos-ZIQXggFx.js");
var Route$2 = createFileRoute("/comparativos")({
	head: () => ({ meta: [{ title: "Comparativos — Swift NPS" }, {
		name: "description",
		content: "Comparação por tipo de gestão e região."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
//#endregion
//#region src/routes/categorias.tsx
var $$splitComponentImporter$1 = () => import("./categorias-BFWIbQec.js");
var Route$1 = createFileRoute("/categorias")({
	head: () => ({ meta: [{ title: "Categorias — Swift NPS" }, {
		name: "description",
		content: "Categorias de problemas e elogios extraídas dos comentários."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
//#endregion
//#region src/routes/index.tsx
var $$splitComponentImporter = () => import("./routes-CyPh0EPd.js");
var Route = createFileRoute("/")({
	head: () => ({ meta: [{ title: "Visão Executiva — Swift NPS" }, {
		name: "description",
		content: "Resumo executivo dos indicadores de NPS."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
//#region src/routeTree.gen.ts
var TendenciaRoute = Route$4.update({
	id: "/tendencia",
	path: "/tendencia",
	getParentRoute: () => Route$5
});
var LojasRoute = Route$3.update({
	id: "/lojas",
	path: "/lojas",
	getParentRoute: () => Route$5
});
var ComparativosRoute = Route$2.update({
	id: "/comparativos",
	path: "/comparativos",
	getParentRoute: () => Route$5
});
var CategoriasRoute = Route$1.update({
	id: "/categorias",
	path: "/categorias",
	getParentRoute: () => Route$5
});
var rootRouteChildren = {
	IndexRoute: Route.update({
		id: "/",
		path: "/",
		getParentRoute: () => Route$5
	}),
	CategoriasRoute,
	ComparativosRoute,
	LojasRoute,
	TendenciaRoute
};
var routeTree = Route$5._addFileChildren(rootRouteChildren)._addFileTypes();
//#endregion
//#region src/router.tsx
var getRouter = () => {
	return createRouter({
		routeTree,
		context: { queryClient: new QueryClient() },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
//#endregion
export { getRouter };
