import { Resend } from "resend";

const FROM = "BaseLens <onboarding@resend.dev>";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

function wrapper(bodyHtml: string) {
  return `
  <div style="background:#F6F3EC;padding:32px 16px;font-family:Georgia,'Times New Roman',serif;">
    <div style="max-width:520px;margin:0 auto;background:#FFFFFF;border:1px solid #E5E0D3;border-radius:16px;overflow:hidden;">
      <div style="padding:24px 28px 0;">
        <div style="font-family:Georgia,serif;font-weight:700;font-size:22px;color:#14151A;">
          base<span style="color:#C2481E;">·</span>lens
        </div>
      </div>
      <div style="padding:8px 28px 28px;">
        ${bodyHtml}
      </div>
    </div>
    <p style="max-width:520px;margin:16px auto 0;font-family:monospace;font-size:11px;color:#726F68;text-align:center;">
      Base Upgrade Intelligence
    </p>
  </div>`;
}

export async function sendConfirmationEmail(to: string, confirmUrl: string) {
  const resend = getResend();
  await resend.emails.send({
    from: FROM,
    to,
    subject: "Confirm your BaseLens digest subscription",
    html: wrapper(`
      <p style="font-size:15px;line-height:1.6;color:#14151A;margin:0 0 20px;">
        One click to confirm you'd like a daily email whenever a new Base upgrade is analyzed.
      </p>
      <a href="${confirmUrl}" style="display:inline-block;background:#C2481E;color:#fff;font-family:Arial,sans-serif;font-weight:700;font-size:14px;text-decoration:none;padding:12px 22px;border-radius:8px;">
        Confirm subscription
      </a>
      <p style="font-size:12px;line-height:1.6;color:#726F68;margin:24px 0 0;font-family:Arial,sans-serif;">
        Didn't request this? Just ignore this email — you won't be subscribed.
      </p>
    `)
  });
}

type DigestUpgrade = {
  title: string;
  category: string;
  impact_level: string;
  summary: string;
  source_url: string;
};

function impactColor(level: string) {
  if (level === "High") return "#B0202A";
  if (level === "Medium") return "#A6740F";
  return "#1F7A4C";
}

export async function sendDigestEmail(
  to: string,
  upgrades: DigestUpgrade[],
  feedUrl: string,
  unsubscribeUrl: string
) {
  const resend = getResend();
  const items = upgrades
    .map(
      (u) => `
      <div style="padding:16px 0;border-top:1px solid #EDE9DD;">
        <div style="font-family:Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:${impactColor(u.impact_level)};margin-bottom:6px;">
          ${u.impact_level} impact · ${u.category}
        </div>
        <div style="font-family:Georgia,serif;font-size:17px;font-weight:700;color:#14151A;margin-bottom:6px;">
          ${u.title}
        </div>
        <p style="font-family:Arial,sans-serif;font-size:13.5px;line-height:1.6;color:#14151A;margin:0 0 8px;">
          ${u.summary}
        </p>
        ${u.source_url ? `<a href="${u.source_url}" style="font-family:monospace;font-size:12px;color:#C2481E;text-decoration:none;">View original release &rarr;</a>` : ""}
      </div>`
    )
    .join("");

  await resend.emails.send({
    from: FROM,
    to,
    subject: `${upgrades.length} new Base upgrade${upgrades.length === 1 ? "" : "s"} today`,
    html: wrapper(`
      <p style="font-size:14px;line-height:1.6;color:#726F68;margin:0 0 4px;font-family:Arial,sans-serif;">
        Here's what shipped on Base since your last digest.
      </p>
      ${items}
      <a href="${feedUrl}" style="display:inline-block;margin-top:20px;background:#14151A;color:#fff;font-family:Arial,sans-serif;font-weight:700;font-size:14px;text-decoration:none;padding:12px 22px;border-radius:8px;">
        View full feed
      </a>
      <p style="font-size:11px;color:#9A968C;margin:28px 0 0;font-family:Arial,sans-serif;">
        <a href="${unsubscribeUrl}" style="color:#9A968C;">Unsubscribe</a> from this digest.
      </p>
    `)
  });
}
