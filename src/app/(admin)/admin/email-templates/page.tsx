import { render } from "@react-email/render";
import { Mail } from "lucide-react";
import { OrderConfirmation } from "../../../../../emails/OrderConfirmation";
import { DownloadReady } from "../../../../../emails/DownloadReady";
import { NewsletterWelcome } from "../../../../../emails/NewsletterWelcome";
import { Card, PageHeader } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

const SAMPLE = {
  customerName: "Jane Mwangi",
  orderNumber: "JMM-20260812-0001",
  orderDate: new Date().toISOString(),
  items: [
    { title: "Ultimate ChatGPT Prompt Pack 500", price: 1200 },
    { title: "Canva Social Media Mega Pack", price: 890 },
  ],
  total: 2090,
  downloadUrl: "https://jmmajiwa.com/downloads/sample-token",
};

export default async function AdminEmailTemplatesPage() {
  const [orderHtml, downloadHtml, welcomeHtml] = await Promise.all([
    render(OrderConfirmation(SAMPLE)),
    render(
      DownloadReady({
        customerName: SAMPLE.customerName,
        orderNumber: SAMPLE.orderNumber,
        items: SAMPLE.items.map((i) => i.title),
        downloadUrl: SAMPLE.downloadUrl,
      })
    ),
    render(NewsletterWelcome({ email: "jane@example.com", downloadUrl: SAMPLE.downloadUrl })),
  ]);

  const templates = [
    { name: "Order Confirmation", desc: "Sent automatically after a successful M-Pesa payment.", html: orderHtml },
    { name: "Download Ready", desc: "Reminder/notification with direct download links.", html: downloadHtml },
    { name: "Newsletter Welcome", desc: "Delivers the free AI prompt pack to new subscribers.", html: welcomeHtml },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Email Templates"
        subtitle="Live previews rendered from the React Email components in /emails"
      />

      <div className="grid gap-6 xl:grid-cols-3">
        {templates.map((t) => (
          <Card key={t.name} className="!p-0 overflow-hidden">
            <div className="flex items-center gap-2 border-b border-white/10 p-5">
              <Mail className="h-4 w-4 text-orange-300" />
              <div>
                <h2 className="font-bold text-white">{t.name}</h2>
                <p className="text-xs text-white/40">{t.desc}</p>
              </div>
            </div>
            <iframe
              title={`${t.name} preview`}
              srcDoc={t.html}
              className="h-[480px] w-full bg-white"
              sandbox=""
            />
          </Card>
        ))}
      </div>
    </div>
  );
}
