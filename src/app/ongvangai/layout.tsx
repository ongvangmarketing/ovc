import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AiNavigation } from "./_components/AiNavigation";
import { AiFooter } from "./_components/AiFooter";
import { getOrganization } from "./actions";

export const metadata: Metadata = {
  title: {
    template: "%s | Ong Vàng AI",
    default: "Ong Vàng Marketing & Training — Hệ sinh thái doanh nghiệp",
  },
  description:
    "Hệ sinh thái tư vấn chiến lược, đào tạo thực chiến, AI ứng dụng và chuyển đổi số bền vững cho doanh nghiệp.",
};

// Design tokens from Framer source
// --token-eabeea08: #f7f4ed (warm cream)
// --token-b1616bd3: #111     (near black)
// --token-36fb4a5d: #6b6b6b  (muted)
// --token-d707bb5a: #f5a524  (amber)

export default async function OngVangAiLayout({ children }: { children: ReactNode }) {
  const org = await getOrganization();
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700;800&display=swap');
        :root {
          --ov-cream: #f7f4ed;
          --ov-dark:  #111111;
          --ov-muted: #6b6b6b;
          --ov-amber: #f5a524;
          --ov-border: rgba(17,17,17,0.08);
        }
        .font-grotesk { font-family: 'Space Grotesk', sans-serif; }
      `}</style>
      <div
        className="min-h-screen text-[#111]"
        style={{ fontFamily: "'Inter', sans-serif", backgroundColor: "#f7f4ed" }}
      >
        <AiNavigation logoUrl={org?.logo} orgName={org?.name} />
        <main id="main-content">{children}</main>
        <AiFooter />
      </div>
    </>
  );
}
