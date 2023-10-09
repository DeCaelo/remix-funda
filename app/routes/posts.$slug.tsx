import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { marked } from "marked";
import { ErrorFallback } from "~/components/ErrorFallback";
import { getPost } from "~/models/post.server";

export async function loader({ params }: LoaderFunctionArgs) {
  if (!params.slug) {
    throw new Error("missing slug");
  }
  const post = await getPost(params.slug);
  if (!post) {
    throw new Error("Post not found");
  }
  const html = marked(post.markdown);
  return json({ title: post.title, html });
}

export default function PostRoute() {
  const { title, html } = useLoaderData<typeof loader>();

  return (
    <main className="mx-auto max-w-4xl">
      <h1 className="my-6 border-b-2 text-center text-3xl">{title}</h1>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </main>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);

  return <ErrorFallback>Something went wrong!</ErrorFallback>;
}
