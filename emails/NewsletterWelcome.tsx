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

interface NewsletterWelcomeProps {
  email: string;
  downloadUrl: string;
}

export function NewsletterWelcome({ email, downloadUrl }: NewsletterWelcomeProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to JM Majiwa — your FREE AI Prompt Pack is inside 🎁</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logoText}>⚡ JM Majiwa</Text>
          </Section>

          <Section style={content}>
            <Heading style={heading}>Welcome to the family! 🎉</Heading>
            <Text style={paragraph}>
              You&apos;re officially subscribed with <strong>{email}</strong>.
              Every Friday you&apos;ll get free AI prompts, templates and
              business tips that Kenyans are using to save hours each week.
            </Text>

            <Section style={giftBox}>
              <Text style={giftTitle}>🎁 Your welcome gift is here</Text>
              <Text style={giftText}>
                As promised, here is your <strong>FREE AI Starter Prompt Pack</strong>{" "}
                — 25 hand-picked prompts for business, content and study. No
                purchase needed.
              </Text>
              <Section style={{ textAlign: "center", marginTop: "16px" }}>
                <Button style={button} href={downloadUrl}>
                  Download My Free Prompt Pack
                </Button>
              </Section>
            </Section>

            <Text style={paragraph}>
              While you&apos;re here, browse the{" "}
              <a href="https://jmmajiwa.com/marketplace" style={link}>
                marketplace
              </a>{" "}
              — best-sellers start at just KES 590 and download instantly after
              M-Pesa payment.
            </Text>

            <Text style={note}>
              You&apos;re receiving this because you subscribed on jmmajiwa.com.
              Unsubscribe anytime with one click — no hard feelings.
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

export default NewsletterWelcome;

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
  margin: "0 0 16px",
};
const giftBox: React.CSSProperties = {
  backgroundColor: "#fff7ed",
  border: "1px solid #fed7aa",
  borderRadius: "12px",
  padding: "20px",
  marginBottom: "20px",
};
const giftTitle: React.CSSProperties = {
  color: "#7c3707",
  fontSize: "15px",
  fontWeight: 800,
  margin: "0 0 8px",
};
const giftText: React.CSSProperties = {
  color: "#9a4409",
  fontSize: "13px",
  lineHeight: "20px",
  margin: 0,
};
const button: React.CSSProperties = {
  backgroundColor: "#f97316",
  borderRadius: "12px",
  color: "#ffffff",
  fontSize: "15px",
  fontWeight: 700,
  padding: "14px 32px",
  textDecoration: "none",
};
const link: React.CSSProperties = { color: "#f97316" };
const note: React.CSSProperties = {
  color: "#9ca3af",
  fontSize: "11px",
  lineHeight: "16px",
  margin: "16px 0 0",
};
const footer: React.CSSProperties = { padding: "16px 8px", textAlign: "center" };
const footerText: React.CSSProperties = {
  color: "#9ca3af",
  fontSize: "11px",
  margin: 0,
};
