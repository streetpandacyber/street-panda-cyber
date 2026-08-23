import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface ContactMessageProps {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export function ContactMessage({
  name,
  email,
  subject,
  message,
}: ContactMessageProps) {
  return (
    <Html>
      <Head />
      <Preview>New JM Majiwa contact message: {subject}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logo}>⚡ JM Majiwa</Text>
          </Section>
          <Section style={content}>
            <Heading style={heading}>New contact message</Heading>
            <Text style={paragraph}>
              A visitor submitted a message through the JM Majiwa contact form.
            </Text>
            <Section style={metaBox}>
              <Text style={label}>Name</Text>
              <Text style={value}>{name}</Text>
              <Text style={label}>Email</Text>
              <Text style={value}>{email}</Text>
              <Text style={label}>Subject</Text>
              <Text style={value}>{subject}</Text>
            </Section>
            <Text style={label}>Message</Text>
            <Section style={messageBox}>
              <Text style={messageText}>{message}</Text>
            </Section>
            <Text style={small}>
              Reply directly to {email} to continue the conversation.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default ContactMessage;

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
  backgroundColor: "#050b2e",
  borderRadius: "16px 16px 0 0",
  padding: "20px 32px",
};
const logo: React.CSSProperties = {
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
  margin: "0 0 16px",
};
const paragraph: React.CSSProperties = {
  color: "#4b5563",
  fontSize: "15px",
  lineHeight: "24px",
};
const label: React.CSSProperties = {
  color: "#6b7280",
  fontSize: "12px",
  fontWeight: 700,
  letterSpacing: "0.08em",
  margin: "16px 0 4px",
  textTransform: "uppercase",
};
const value: React.CSSProperties = {
  color: "#0a1240",
  fontSize: "15px",
  margin: "0 0 4px",
};
const metaBox: React.CSSProperties = {
  backgroundColor: "#f8fafc",
  borderRadius: "12px",
  padding: "16px",
};
const messageBox: React.CSSProperties = {
  backgroundColor: "#fff7ed",
  borderLeft: "4px solid #f97316",
  borderRadius: "8px",
  padding: "16px",
};
const messageText: React.CSSProperties = {
  color: "#1f2937",
  fontSize: "15px",
  lineHeight: "24px",
  whiteSpace: "pre-wrap",
};
const small: React.CSSProperties = {
  color: "#6b7280",
  fontSize: "12px",
  lineHeight: "18px",
  marginTop: "24px",
};
