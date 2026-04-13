import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

const GREEN = rgb(0.24, 0.42, 0.21); // #3D6B35
const BLACK = rgb(0, 0, 0);
const GRAY = rgb(0.4, 0.4, 0.4);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Token required" }, { status: 400 });
  }

  const sb = getSupabaseAdmin();

  // Get partner info
  const { data: partner, error: partnerError } = await sb
    .from("service_partners")
    .select("id, company_name, contact_name, email, city, state, service_types, onboard_completed_at")
    .eq("onboard_token", token)
    .single();

  if (partnerError || !partner) {
    return NextResponse.json({ error: "Invalid token" }, { status: 404 });
  }

  if (!partner.onboard_completed_at) {
    return NextResponse.json({ error: "Onboarding not yet completed" }, { status: 400 });
  }

  // Get all signed documents
  const { data: docs } = await sb
    .from("partner_documents")
    .select("*")
    .eq("partner_id", partner.id)
    .order("signed_at", { ascending: true });

  // Get pricing
  const { data: pricing } = await sb
    .from("partner_pricing")
    .select("*")
    .eq("partner_id", partner.id)
    .eq("is_current", true);

  const ndaDoc = docs?.find((d: any) => d.doc_type === "nda_signed");
  const msaDoc = docs?.find((d: any) => d.doc_type === "msa_signed");

  // Build PDF
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const pageWidth = 612; // letter
  const pageHeight = 792;
  const margin = 72;
  const contentWidth = pageWidth - 2 * margin;

  // Helper: draw text wrapping
  function drawWrappedText(
    page: any, text: string, x: number, startY: number,
    maxWidth: number, fontSize: number, usedFont: any, lineHeight: number, color = BLACK
  ): number {
    const words = text.split(" ");
    let line = "";
    let y = startY;

    for (const word of words) {
      const testLine = line ? line + " " + word : word;
      const testWidth = usedFont.widthOfTextAtSize(testLine, fontSize);
      if (testWidth > maxWidth && line) {
        page.drawText(line, { x, y, size: fontSize, font: usedFont, color });
        y -= lineHeight;
        line = word;
      } else {
        line = testLine;
      }
    }
    if (line) {
      page.drawText(line, { x, y, size: fontSize, font: usedFont, color });
      y -= lineHeight;
    }
    return y;
  }

  // ===================== COVER PAGE =====================
  let page = pdfDoc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - 120;

  // Title
  const titleText = "BANDIT RECYCLING";
  const titleWidth = fontBold.widthOfTextAtSize(titleText, 28);
  page.drawText(titleText, {
    x: (pageWidth - titleWidth) / 2, y, size: 28, font: fontBold, color: GREEN
  });
  y -= 36;

  const subTitle = "PARTNERSHIP AGREEMENT";
  const subWidth = fontBold.widthOfTextAtSize(subTitle, 20);
  page.drawText(subTitle, {
    x: (pageWidth - subWidth) / 2, y, size: 20, font: fontBold, color: BLACK
  });
  y -= 60;

  // Partner info
  const infoItems = [
    ["Partner:", partner.company_name],
    ["Contact:", partner.contact_name],
    ["Location:", `${partner.city || ""}, ${partner.state || ""}`],
    ["Email:", partner.email],
    ["Completed:", new Date(partner.onboard_completed_at).toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric"
    })],
  ];

  for (const [label, value] of infoItems) {
    page.drawText(label, { x: margin + 80, y, size: 12, font: fontBold, color: GRAY });
    page.drawText(value || "N/A", { x: margin + 180, y, size: 12, font, color: BLACK });
    y -= 22;
  }

  y -= 30;
  page.drawLine({
    start: { x: margin, y },
    end: { x: pageWidth - margin, y },
    thickness: 1, color: GREEN
  });
  y -= 24;

  const contents = "This document contains the signed NDA, Master Service Agreement, rate card, and related onboarding records for the above-named partner.";
  y = drawWrappedText(page, contents, margin, y, contentWidth, 11, font, 16, GRAY);

  // ===================== NDA PAGE =====================
  page = pdfDoc.addPage([pageWidth, pageHeight]);
  y = pageHeight - margin;

  page.drawText("MUTUAL NONDISCLOSURE AGREEMENT", {
    x: margin, y, size: 16, font: fontBold, color: GREEN
  });
  y -= 28;

  const ndaText = `This Mutual Nondisclosure Agreement ("Agreement") is entered into between Bandit Recycling LLC, a Mississippi limited liability company ("Company"), and ${partner.company_name} ("Partner").`;
  y = drawWrappedText(page, ndaText, margin, y, contentWidth, 10, font, 14);
  y -= 10;

  const ndaSections = [
    ["1. CONFIDENTIAL INFORMATION", "The parties agree to maintain in strict confidence all proprietary and business information disclosed, including but not limited to: pricing structures, customer lists, business processes, technical information, operational procedures, financial data, and business strategies."],
    ["2. TERM", "This Agreement shall remain in effect for three (3) years from the execution date, and shall survive any termination or expiration of the underlying business relationship."],
    ["3. EXCLUSIONS", "Confidential Information does not include information that: (a) is or becomes publicly available through no breach of this Agreement; (b) is rightfully received from a third party; (c) is independently developed; or (d) is required to be disclosed by law."],
    ["4. GOVERNING LAW", "This Agreement shall be governed by and construed in accordance with the laws of the State of Mississippi."],
  ];

  for (const [heading, body] of ndaSections) {
    page.drawText(heading, { x: margin, y, size: 11, font: fontBold, color: GREEN });
    y -= 16;
    y = drawWrappedText(page, body, margin, y, contentWidth, 10, font, 14);
    y -= 10;
  }

  // NDA Signature
  y -= 10;
  page.drawText("SIGNED BY:", { x: margin, y, size: 10, font: fontBold, color: GRAY });
  y -= 16;
  page.drawText(`Name: ${ndaDoc?.signer_name || "N/A"}`, { x: margin, y, size: 10, font, color: BLACK });
  y -= 14;
  page.drawText(`Title: ${ndaDoc?.signer_title || "N/A"}`, { x: margin, y, size: 10, font, color: BLACK });
  y -= 14;
  page.drawText(`Date: ${ndaDoc?.signed_at ? new Date(ndaDoc.signed_at).toLocaleDateString() : "N/A"}`, {
    x: margin, y, size: 10, font, color: BLACK
  });
  y -= 14;
  page.drawText(`IP: ${ndaDoc?.signer_ip || "N/A"}`, { x: margin, y, size: 10, font, color: GRAY });

  // Embed NDA signature image if available
  if (ndaDoc?.signature_data && ndaDoc.signature_data.startsWith("data:image/png")) {
    try {
      const base64 = ndaDoc.signature_data.split(",")[1];
      const sigImage = await pdfDoc.embedPng(Buffer.from(base64, "base64"));
      const sigDims = sigImage.scale(0.4);
      y -= sigDims.height + 10;
      page.drawImage(sigImage, {
        x: margin, y, width: sigDims.width, height: sigDims.height
      });
    } catch (e) {
      // Skip if signature image can't be embedded
    }
  }

  // ===================== MSA PAGE =====================
  page = pdfDoc.addPage([pageWidth, pageHeight]);
  y = pageHeight - margin;

  page.drawText("MASTER SERVICE AGREEMENT", {
    x: margin, y, size: 16, font: fontBold, color: GREEN
  });
  y -= 28;

  const msaIntro = `This Master Service Agreement ("Agreement") is entered into between Bandit Recycling LLC, a Mississippi limited liability company ("Company"), and ${partner.company_name} ("Partner").`;
  y = drawWrappedText(page, msaIntro, margin, y, contentWidth, 10, font, 14);
  y -= 10;

  const msaSections = [
    ["1. SCOPE OF SERVICES", "Partner agrees to provide repair, maintenance, moving, refurbishment, and other services as assigned by Company through work orders. Services shall be performed in a professional and workmanlike manner."],
    ["2. WORK ORDERS", "Company shall issue work orders to Partner for specific jobs. Partner shall accept or decline within four (4) hours of receipt. Acceptance of a work order constitutes a binding obligation to perform."],
    ["3. PRICING & PAYMENT", "Pricing shall be according to Partner's agreed rate card. Payment terms are Net-30 days from invoice date. Partner shall submit itemized invoices with work order reference numbers."],
    ["4. INSURANCE REQUIREMENTS", "Partner shall maintain minimum coverage: General Liability $1,000,000 per occurrence / $2,000,000 aggregate; Auto Liability $500,000; Workers Compensation as required by state law. Bandit Recycling LLC must be named as Additional Insured on all policies."],
    ["5. INDEPENDENT CONTRACTOR STATUS", "Partner is an independent contractor, not an employee of Company. Partner is solely responsible for taxes, insurance, and compliance with all applicable laws."],
    ["6. QUALITY STANDARDS", "Partner warrants all work for ninety (90) days from completion. Any defective work shall be corrected at no additional charge."],
    ["7. TERM & TERMINATION", "This Agreement shall be for an initial term of one (1) year and shall automatically renew annually unless terminated by either party with thirty (30) days written notice."],
    ["8. GOVERNING LAW", "This Agreement shall be governed by and construed in accordance with the laws of the State of Mississippi."],
  ];

  for (const [heading, body] of msaSections) {
    if (y < 80) {
      page = pdfDoc.addPage([pageWidth, pageHeight]);
      y = pageHeight - margin;
    }
    page.drawText(heading, { x: margin, y, size: 11, font: fontBold, color: GREEN });
    y -= 16;
    y = drawWrappedText(page, body, margin, y, contentWidth, 10, font, 14);
    y -= 10;
  }

  // MSA Signature
  if (y < 120) {
    page = pdfDoc.addPage([pageWidth, pageHeight]);
    y = pageHeight - margin;
  }
  y -= 10;
  page.drawText("SIGNED BY:", { x: margin, y, size: 10, font: fontBold, color: GRAY });
  y -= 16;
  page.drawText(`Name: ${msaDoc?.signer_name || "N/A"}`, { x: margin, y, size: 10, font, color: BLACK });
  y -= 14;
  page.drawText(`Title: ${msaDoc?.signer_title || "N/A"}`, { x: margin, y, size: 10, font, color: BLACK });
  y -= 14;
  page.drawText(`Date: ${msaDoc?.signed_at ? new Date(msaDoc.signed_at).toLocaleDateString() : "N/A"}`, {
    x: margin, y, size: 10, font, color: BLACK
  });
  y -= 14;
  page.drawText(`IP: ${msaDoc?.signer_ip || "N/A"}`, { x: margin, y, size: 10, font, color: GRAY });

  if (msaDoc?.signature_data && msaDoc.signature_data.startsWith("data:image/png")) {
    try {
      const base64 = msaDoc.signature_data.split(",")[1];
      const sigImage = await pdfDoc.embedPng(Buffer.from(base64, "base64"));
      const sigDims = sigImage.scale(0.4);
      y -= sigDims.height + 10;
      page.drawImage(sigImage, {
        x: margin, y, width: sigDims.width, height: sigDims.height
      });
    } catch (e) {
      // Skip if signature image can't be embedded
    }
  }

  // ===================== RATE CARD PAGE =====================
  if (pricing && pricing.length > 0) {
    page = pdfDoc.addPage([pageWidth, pageHeight]);
    y = pageHeight - margin;

    page.drawText("RATE CARD SUMMARY", {
      x: margin, y, size: 16, font: fontBold, color: GREEN
    });
    y -= 28;

    const pricingLabels: Record<string, string> = {
      service_call: "Service Call Fee",
      hourly_labor: "Hourly Labor Rate",
      mileage: "Mileage Rate",
      wire_per_ton: "Bale Wire (per ton)",
      equipment_move_flat: "Equipment Moving (flat)",
      pm_contract_monthly: "PM Contract (monthly)",
    };

    for (const item of pricing) {
      const label = pricingLabels[item.pricing_type] || item.pricing_type;
      const amount = `$${parseFloat(item.amount_usd).toFixed(2)}`;
      const desc = item.unit_description || "";

      page.drawText(label, { x: margin, y, size: 11, font: fontBold, color: BLACK });
      page.drawText(amount, { x: margin + 250, y, size: 11, font: fontBold, color: GREEN });
      y -= 14;
      if (desc) {
        page.drawText(desc, { x: margin + 16, y, size: 9, font, color: GRAY });
        y -= 18;
      } else {
        y -= 6;
      }
    }
  }

  // Serialize PDF
  const pdfBytes = await pdfDoc.save();

  // Store in Supabase Storage (best effort)
  const fileName = `agreements/${partner.id}/partnership_agreement.pdf`;
  try {
    await sb.storage
      .from("partner-docs")
      .upload(fileName, Buffer.from(pdfBytes), {
        contentType: "application/pdf",
        upsert: true,
      });

    // Save reference
    await sb.from("partner_documents").upsert({
      partner_id: partner.id,
      doc_type: "partnership_agreement_pdf",
      signed_at: new Date().toISOString(),
      notes: `Stored at: ${fileName}`,
    }, { onConflict: "partner_id,doc_type" });
  } catch (storageErr) {
    console.error("Storage upload failed (non-fatal):", storageErr);
  }

  // Return PDF
  return new NextResponse(Buffer.from(pdfBytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="Bandit_Recycling_Partnership_${partner.company_name.replace(/[^a-zA-Z0-9]/g, "_")}.pdf"`,
    },
  });
}
