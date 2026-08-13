import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";

interface OrderItem {
  title: string;
  price: number;
}

interface OrderConfirmationProps {
  customerName: string;
  orderNumber: string;
  orderDate: string;
  items: OrderItem[];
  total: number;
  downloadUrl: string;
}

const kes = (n: number) =>
  `KES ${n.toLocaleString("en-KE", { maximumFractionDigits: 0 })}`;

export function OrderConfirmation({
  customerName,
  orderNumber,
  orderDate,
  items,
  total,
  downloadUrl,
}: OrderConfirmationProps) {
  return (
    <Html>
      <Head />
      <Preview>Your order {orderNumber} is confirmed — downloads ready!</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={logoText}>⚡ JM Majiwa</Text>
          </Section>

          <Section style={content}>
            <Heading style={heading}>Your Order is Confirmed! 🎉</Heading>
            <Text style={paragraph}>
              Hi {customerName}, thank you for your purchase. Your payment was
              received successfully and your digital products are ready to
              download right now.
            </Text>

            {/* Order meta */}
            <Section style={metaBox}>
              <Row>
                <Column>
                  <Text style={metaLabel}>Order Number</Text>
                  <Text style={metaValue}>{orderNumber}</Text>
                </Column>
                <Column style={{ textAlign: "right" }}>
                  <Text style={metaLabel}>Date</Text>
                  <Text style={metaValue}>
                    {new Date(orderDate).toLocaleDateString("en-KE", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </Text>
                </Column>
              </Row>
            </Section>

            {/* Items */}
            <Section style={itemsBox}>
              {items.map((item) => (
                <Row key={item.title} style={itemRow}>
                  <Column>
                    <Text style={itemTitle}>{item.title}</Text>
                    <Text style={itemNote}>Instant digital download</Text>
                  </Column>
                  <Column style={{ textAlign: "right" }}>
                    <Text style={itemPrice}>{kes(item.price)}</Text>
                  </Column>
                </Row>
              ))}
              <Hr style={divider} />
              <Row>
                <Column>
                  <Text style={totalLabel}>Total Paid (M-Pesa)</Text>
                </Column>
                <Column style={{ textAlign: "right" }}>
                  <Text style={totalValue}>{kes(total)}</Text>
                </Column>
              </Row>
            </Section>

            {/* Download instructions */}
            <Section style={instructions}>
              <Text style={instructionsTitle}>📥 How to download:</Text>
              <Text style={instructionsItem}>
                1. Click the orange button below to open your downloads.
              </Text>
              <Text style={instructionsItem}>
                2. Files download straight to your device — unzip if needed.
              </Text>
              <Text style={instructionsItem}>
                3. Enjoy lifetime access, including free future updates!
              </Text>
            </Section>

            <Section style={buttonSection}>
              <Button style={button} href={downloadUrl}>
                Download Your Products
              </Button>
            </Section>

            <Text style={paragraphSmall}>
              Need help? Reply to this email or write to{" "}
              <a href="mailto:streetpandacyber@gmail.com" style={link}>
                streetpandacyber@gmail.com
              </a>{" "}
              — we answer within hours.
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              ⚡ JM Majiwa — Learn Faster. Create Smarter. Grow with AI.
            </Text>
            <Text style={footerText}>
              Nairobi, Kenya • 30-day money-back guarantee
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default OrderConfirmation;

/* ── Styles ─────────────────────────────────────────── */

const main: React.CSSProperties = {
  backgroundColor: "#f6f7fb",
  fontFamily: "Inter, -apple-system, Segoe UI, sans-serif",
};
const container: React.CSSProperties = {
  margin: "0 auto",
  maxWidth: "560px",
  padding: "24px 12px",
};
const header: React.CSSProperties = {
  background: "linear-gradient(135deg,#050b2e 0%,#1a2980 100%)",
  borderRadius: "16px 16px 0 0",
  padding: "20px 32px",
};
const logoText: React.CSSProperties = {
  color: "#ffffff",
  fontSize: "20px",
  fontWeight: 800,
  margin: 0,
};
const content: React.CSSProperties = {
  backgroundColor: "#ffffff",
  borderRadius: "0 0 16px 16px",
  padding: "32px",
};
const heading: React.CSSProperties = {
  color: "#0a1240",
  fontSize: "24px",
  fontWeight: 800,
  margin: "0 0 12px",
};
const paragraph: React.CSSProperties = {
  color: "#4b5563",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "0 0 20px",
};
const metaBox: React.CSSProperties = {
  backgroundColor: "#f0f4ff",
  borderRadius: "12px",
  padding: "16px 20px",
  marginBottom: "20px",
};
const metaLabel: React.CSSProperties = {
  color: "#6b7280",
  fontSize: "11px",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  margin: "0 0 2px",
};
const metaValue: React.CSSProperties = {
  color: "#0a1240",
  fontSize: "14px",
  fontWeight: 700,
  margin: 0,
};
const itemsBox: React.CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: "12px",
  padding: "8px 20px",
  marginBottom: "20px",
};
const itemRow: React.CSSProperties = { padding: "10px 0" };
const itemTitle: React.CSSProperties = {
  color: "#0a1240",
  fontSize: "14px",
  fontWeight: 600,
  margin: 0,
};
const itemNote: React.CSSProperties = {
  color: "#16a34a",
  fontSize: "11px",
  margin: "2px 0 0",
};
const itemPrice: React.CSSProperties = {
  color: "#0a1240",
  fontSize: "14px",
  fontWeight: 700,
  margin: 0,
};
const divider: React.CSSProperties = { borderColor: "#e5e7eb", margin: "4px 0" };
const totalLabel: React.CSSProperties = {
  color: "#0a1240",
  fontSize: "14px",
  fontWeight: 800,
  margin: 0,
};
const totalValue: React.CSSProperties = {
  color: "#f97316",
  fontSize: "18px",
  fontWeight: 800,
  margin: 0,
};
const instructions: React.CSSProperties = {
  backgroundColor: "#f0fdf4",
  borderRadius: "12px",
  padding: "16px 20px",
  marginBottom: "20px",
};
const instructionsTitle: React.CSSProperties = {
  color: "#14532d",
  fontSize: "13px",
  fontWeight: 700,
  margin: "0 0 8px",
};
const instructionsItem: React.CSSProperties = {
  color: "#166534",
  fontSize: "13px",
  margin: "0 0 4px",
};
const buttonSection: React.CSSProperties = { textAlign: "center", margin: "24px 0" };
const button: React.CSSProperties = {
  backgroundColor: "#f97316",
  borderRadius: "12px",
  color: "#ffffff",
  fontSize: "15px",
  fontWeight: 700,
  padding: "14px 36px",
  textDecoration: "none",
};
const paragraphSmall: React.CSSProperties = {
  color: "#6b7280",
  fontSize: "12px",
  lineHeight: "18px",
  margin: 0,
};
const link: React.CSSProperties = { color: "#f97316" };
const footer: React.CSSProperties = { padding: "16px 8px", textAlign: "center" };
const footerText: React.CSSProperties = {
  color: "#9ca3af",
  fontSize: "11px",
  margin: "0 0 4px",
};
