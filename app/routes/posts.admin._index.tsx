import { LoaderFunctionArgs, json } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { requireAdminUser } from "~/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAdminUser(request);
  return json({});
}

export default function AdminIndexRoute() {
  return (
    <p>
      <Link to="new" className="text-blue-600 underline">
        Create a New Post
      </Link>
      <p>{ENV.ADMIN_EMAIL}</p>
    </p>
  );
}
