import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { getPosts } from "~/models/post.server";
import { useOptionalAdminUser } from "~/utils";

export async function loader() {
  const posts = await getPosts();
  return json({ posts });
}

export default function PostsIndexPage() {
  const { posts } = useLoaderData<typeof loader>();
  const adminUser = useOptionalAdminUser();
  return (
    <main>
      <h1>Posts</h1>
      {adminUser ? (
        <Link className="text-red-600 underline" to="admin">
          Admin
        </Link>
      ) : null}
      <ul>
        {posts.map((post) => (
          <li key={post.slug}>
            <Link
              to={post.slug}
              prefetch="intent"
              className="text-blue-600 underline"
            >
              {post.title}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
