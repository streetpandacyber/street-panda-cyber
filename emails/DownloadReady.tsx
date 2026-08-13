import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface DownloadReadyProps {
  customerName: string;
  orderNumber: string;
  items: string[];
  downloadUrl: string;
}

export function DownloadReady({
  customerName,
  orderNumber,
  items,
  downloadUrl,
}: DownloadReadyProps) {
  return (
    <Html>
      <Head />
      <Preview>Your downloads for order {orderNumber} are ready ⚡</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logoText}>⚡ JM Majiwa</Text>
          </Section>

          <Section style={content}>
            <Heading style={heading}>Your Downloads Are Ready ⚡</Heading>
            <Text style={paragraph}>
              Hi {customerName}, everything from order{" "}
              <strong>{orderNumber}</strong> is packaged and waiting for you.
              Tap the button below to grab your files instantly.
            </Text>

            <Section style={itemsBox}>
              {items.map((title) => (
                <Text key={title} style={itemLine}>
                  ✅ {title}
                </Text>
              ))}
            </Section>

            <Section style={buttonSection}>
              <Button style={button} href={downloadUrl}>
                Download Now
              </Button>
            </Section>

            <Text style={note}>
              Your download links stay active in your dashboard forever — come
              back anytime to re-download.
            </Text>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              ⚡ JM Majiwa — Learn Faster. Create Smarter. Grow with AI.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default DownloadReady;

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
const itemsBox: React.CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: "12px",
  padding: "14px 20px",
  marginBottom: "20px",
};
const itemLine: React.CSSProperties = {
  color: "#0a1240",
  fontSize: "14px",
  margin: "0 0 6px",
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
const note: React.CSSProperties = {
  color: "#6b7280",
  fontSize: "12px",
  lineHeight: "18px",
  margin: 0,
};
const footer: React.CSSProperties = { padding: "16px 8px", textAlign: "center" };
const footerText: React.CSSProperties = {
  color: "#9ca3af",
  fontSize: "11px",
  margin: 0,
};
