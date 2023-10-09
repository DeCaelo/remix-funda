import { LoaderFunctionArgs, json } from "@remix-run/node";
import {
  Link,
  isRouteErrorResponse,
  useLoaderData,
  useParams,
  useRouteError,
} from "@remix-run/react";
import { marked } from "marked";
import { ErrorFallback } from "~/components/ErrorFallback";
import { getPost } from "~/models/post.server";
import { useOptionalAdminUser } from "~/utils";

export async function loader({ params }: LoaderFunctionArgs) {
  if (!params.slug) {
    throw new Error("missing slug");
  }
  const post = await getPost(params.slug);
  if (!post) {
    throw new Error("Post not found");
  }
  const html = marked(post.markdown);
  return json({ post, html });
}

export default function PostRoute() {
  const { post, html } = useLoaderData<typeof loader>();
  const adminUser = useOptionalAdminUser();

  return (
    <main className="mx-auto max-w-4xl">
      <h1 className="my-6 border-b-2 text-center text-3xl">{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: html }} />
      {adminUser ? (
        <Link
          className="text-red-600 underline"
          to={`/posts/admin/${post.slug}`}
        >
          Edit
        </Link>
      ) : null}
    </main>
  );
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
