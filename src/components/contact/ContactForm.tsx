"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";

export function ContactForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const update =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const payload = (await response.json().catch(() => null)) as
        | { error?: string; message?: string }
        | null;

      if (!response.ok) {
        throw new Error(
          payload?.error ?? "We could not deliver your message. Please try again."
        );
      }

      setSent(true);
      toast.success(payload?.message ?? "Message received.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "We could not deliver your message. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="mt-6 rounded-2xl bg-neon-50 p-8 text-center">
        <span className="text-4xl">✅</span>
        <h3 className="mt-3 text-lg font-bold text-navy-800">Message received!</h3>
        <p className="mt-1 text-sm text-gray-500">
          Thanks {form.name.split(" ")[0] || "friend"} — our team will get back
          to you at {form.email} shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-navy-800">
            Name
          </label>
          <input
            required
            value={form.name}
            onChange={update("name")}
            placeholder="Jane Mwangi"
            className="input-field"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-navy-800">
            Email
          </label>
          <input
            type="email"
            required
            value={form.email}
            onChange={update("email")}
            placeholder="you@example.com"
            className="input-field"
          />
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-navy-800">
          Subject
        </label>
        <input
          required
          value={form.subject}
          onChange={update("subject")}
          placeholder="How can we help?"
          className="input-field"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-navy-800">
          Message
        </label>
        <textarea
          required
          rows={5}
          value={form.message}
          onChange={update("message")}
          placeholder="Tell us everything…"
          className="input-field resize-none"
        />
      </div>
      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
        {loading ? "Sending…" : "Send Message"}
      </button>
    </form>
  );
}
