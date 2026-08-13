import { ProductForm } from "@/components/admin/ProductForm";
import { PageHeader } from "@/components/admin/ui";

export const metadata = { title: "Add Product — Admin | JM Majiwa" };

export default function NewProductPage() {
  return (
    <div>
      <PageHeader
        title="Add New Product"
        subtitle="Fill in the details below — the slug generates automatically."
      />
      <div className="mt-6">
        <ProductForm />
      </div>
    </div>
  );
}
