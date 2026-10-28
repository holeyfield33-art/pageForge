import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Toaster } from "sonner";
import { Route, Router, Switch } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import ErrorBoundary from "./components/ErrorBoundary";
import Home from "./pages/Home";
import PublishedPage from "./pages/PublishedPage";

// Hash routing (/#/p/slug) keeps every route working on any static host
// (GitHub Pages, Netlify, a plain folder) with no server rewrite rules.
function Routes() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/p/:slug/:project" component={PublishedPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <TooltipProvider>
        <Toaster theme="light" position="bottom-right" />
        <Router hook={useHashLocation}>
          <Routes />
        </Router>
      </TooltipProvider>
    </ErrorBoundary>
  );
}
