import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  json,
  redirect,
} from "@remix-run/node";
import {
  Form,
  isRouteErrorResponse,
  useActionData,
  useLoaderData,
  useNavigation,
  useParams,
  useRouteError,
} from "@remix-run/react";
import invariant from "tiny-invariant";
import { ErrorFallback } from "~/components/ErrorFallback";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import {
  createPost,
  deletePost,
  getPost,
  updatePost,
} from "~/models/post.server";
import { requireAdminUser } from "~/session.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  await requireAdminUser(request);

  invariant(params.slug, "slug not found");
  if (params.slug === "new") {
    return json({ post: null });
  }

  const post = await getPost(params.slug);
  if (!post) {
    throw json({ type: "CustomError", message: "not found" }, { status: 404 });
  }

  return json({ post });
}

export async function action({ request, params }: ActionFunctionArgs) {
  await requireAdminUser(request);

  const formData = await request.formData();
  const intent = formData.get("intent");

  invariant(typeof params.slug === "string", "slug not provided");
  if (intent === "delete") {
    await deletePost(params.slug);
    return redirect("/posts/admin");
  }

  const title = formData.get("title");
  const slug = formData.get("slug");
  const markdown = formData.get("markdown");

  const errors: {
    title?: string | null;
    slug?: string | null;
    markdown?: string | null;
  } = {};

  errors.title = title ? null : "Title is required";
  errors.markdown = markdown ? null : "Markdown is required";

  if (intent !== "update") {
    errors.slug = slug ? null : "Slug is required";
  }
  const hasErrors = Object.values(errors).some(Boolean);

  if (hasErrors) {
    return json(errors);
  }

  if (params.slug === "new") {
    invariant(typeof title === "string", "title must be a string");
    invariant(typeof slug === "string", "slug must be a string");
    invariant(typeof markdown === "string", "markdown must be a string");
    await createPost({ title, slug, markdown });
  } else {
    invariant(typeof title === "string", "title must be a string");
    invariant(typeof markdown === "string", "markdown must be a string");
    await updatePost({ title, slug: params.slug, markdown });
  }

  return redirect("/posts/admin");
}

const inputGrid = "grid w-full gap-1.5 mb-3";
const textErrors = "text-red-600 font-bold";

export default function NewPostRoute() {
  const data = useLoaderData<typeof loader>();
  const errors = useActionData<typeof action>();

  const navigation = useNavigation();
  const isCreating = navigation.formData?.get("intent") === "create";
  const isUpdating = navigation.formData?.get("intent") === "update";
  const isDeleting = navigation.formData?.get("intent") === "delete";
  const isNewPost = !data.post;

  return (
    <Form method="post">
      <div className={inputGrid}>
        <Label htmlFor="title">Post Title</Label>
        <Input
          type="text"
          name="title"
          placeholder="Title"
          key={data?.post?.slug ?? "new"}
          defaultValue={data?.post?.title}
        />
        {errors?.title ? <em className={textErrors}>{errors.title}</em> : null}
      </div>

      <div className={inputGrid}>
        <Label htmlFor="slug">Post Slug</Label>
        <Input
          type="text"
          name="slug"
          placeholder="Slug"
          key={data?.post?.slug ?? "new"}
          defaultValue={data?.post?.slug}
          disabled={Boolean(data.post)}
        />
        {errors?.slug ? <em className={textErrors}>{errors.slug}</em> : null}
      </div>

      <div className={inputGrid}>
        <Label htmlFor="markdown">Markdown</Label>
        <Textarea
          id="markdown"
          rows={8}
          name="markdown"
          className="font-mono"
          key={data?.post?.slug ?? "new"}
          defaultValue={data?.post?.markdown}
        />
        {errors?.markdown ? (
          <em className={textErrors}>{errors.markdown}</em>
        ) : null}
      </div>

      <div className="flex justify-end gap-4">
        {isNewPost ? null : (
          <Button
            type="submit"
            name="intent"
            value="delete"
            variant={"destructive"}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Post"}
          </Button>
        )}
        <Button
          type="submit"
          name="intent"
          value={isNewPost ? "create" : "update"}
          disabled={isCreating || isUpdating}
        >
          {isNewPost ? (isCreating ? "Creating..." : "Create") : null}
          {isNewPost ? null : isUpdating ? "Updating..." : "Update"}
        </Button>
      </div>
    </Form>
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

// https://github.com/remix-run/remix/pull/7343#issuecomment-1708651785
// export function loader() {
//   if (whatever) {
//     throw json({
//       type: 'CustomError',
//       message: 'something',
//       code: 123
//     }, {
//       status: 500,
//       statusText: "Unexpected Server Error"
//     });
//   }
//   ...
// }

// export function ErrorBoundary() {
//   let error = useRouteError();
//   if (isRouteErrorResponse(error)) {
//     if (error.data.type === "CustomError") {
//       let customError = new CustomError(error.data.message, error.data.code);
//       return <CustomErrorUI error={customError} />
//     }
//     return <p>{error.status} {error.statusText}</p>;
//   }
//   return <p>{error.message || 'Unknown Error'}</p>
// }
