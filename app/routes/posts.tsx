import {
  Outlet,
  isRouteErrorResponse,
  useParams,
  useRouteError,
} from "@remix-run/react";
import { ErrorFallback } from "~/components/ErrorFallback";

export default function HiddenParentRoute() {
  return <Outlet />;
}

export function ErrorBoundary() {
  const error = useRouteError();
  const params = useParams();

  if (isRouteErrorResponse(error)) {
    if (error.data.type === "CustomError") {
      return (
        <ErrorFallback>
          No post found with the slug: '{params.slug}'
        </ErrorFallback>
      );
    }
  }

  return <ErrorFallback>Something went wrong loading this post!</ErrorFallback>;
}
