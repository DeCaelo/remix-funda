import { prisma } from "~/db.server";

import type { Post } from "@prisma/client";

export async function getPosts() {
  return prisma.post.findMany({ select: { title: true, slug: true } });
}

export async function getPost(slug: string) {
  return prisma.post.findUnique({ where: { slug } });
}

export async function createPost({
  title,
  slug,
  markdown,
}: Pick<Post, "title" | "slug" | "markdown">) {
  return prisma.post.create({ data: { title, slug, markdown } });
}

export async function deletePost(slug: string) {
  return prisma.post.delete({ where: { slug } });
}

export async function updatePost(
  post: Pick<Post, "slug" | "title" | "markdown">,
) {
  return prisma.post.update({ data: post, where: { slug: post.slug } });
}
