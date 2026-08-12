import { PostEditor } from "@/components/admin/PostEditor";
import { PageHeader } from "@/components/admin/ui";

export const metadata = { title: "New Blog Post — Admin | JM Majiwa" };

export default function NewBlogPostPage() {
  return (
    <div>
      <PageHeader title="New Blog Post" subtitle="Write in markdown, preview live, publish when ready." />
      <div className="mt-6">
        <PostEditor />
      </div>
    </div>
  );
}
