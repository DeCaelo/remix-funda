import { ActionFunctionArgs, json, redirect } from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import invariant from "tiny-invariant";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { createPost } from "~/models/post.server";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const title = formData.get("title");
  const slug = formData.get("slug");
  const markdown = formData.get("markdown");

  const errors = {
    title: title ? null : "Title is required",
    slug: slug ? null : "Slug is required",
    markdown: markdown ? null : "Markdown is required",
  };

  const hasErrors = Object.values(errors).some(Boolean);

  if (hasErrors) {
    return json({ errors });
  }

  invariant(typeof title === "string", "title must be a string");
  invariant(typeof slug === "string", "slug must be a string");
  invariant(typeof markdown === "string", "markdown must be a string");

  await createPost({ title, slug, markdown });

  return redirect("/posts/admin");
}

const inputGrid = "grid w-full gap-1.5 mb-3";
const textErrors = "text-red-600 font-bold";

export default function NewPostRoute() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isCreating = navigation.state === "loading";
  return (
    <Form method="post">
      <div className={inputGrid}>
        <Label htmlFor="title">Post Title</Label>
        <Input type="text" name="title" placeholder="Title" />
        {actionData?.errors?.title ? (
          <em className={textErrors}>{actionData.errors.title}</em>
        ) : null}
      </div>

      <div className={inputGrid}>
        <Label htmlFor="slug">Post Slug</Label>
        <Input type="text" name="slug" placeholder="Slug" />
        {actionData?.errors?.slug ? (
          <em className={textErrors}>{actionData.errors.slug}</em>
        ) : null}
      </div>

      <div className={inputGrid}>
        <Label htmlFor="markdown">Markdown</Label>
        <Textarea
          id="markdown"
          rows={8}
          name="markdown"
          className="font-mono"
        />
        {actionData?.errors?.markdown ? (
          <em className={textErrors}>{actionData.errors.markdown}</em>
        ) : null}
      </div>

      <div className="text-right">
        <Button type="submit">
          {isCreating ? "Creating..." : "Create Post"}
        </Button>
      </div>
    </Form>
  );
}
