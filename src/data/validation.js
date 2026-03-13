export const valDocs = [
  {
    name: "Driver License",
    file: "DL_John_Primary.pdf",
    conf: 96,
    det: "YES",
    rules:  [{ name: "US License", st: 1 }, { name: "Not Expired", st: 1 }, { name: "Signature Present", st: 0 }],
    fields: [{ label: "Signature", val: "Present (scanned)", conf: 94, st: "pending" }],
  },
  {
    name: "App Form",
    file: "AppForm_signed.pdf",
    conf: 99,
    det: "YES",
    rules:  [{ name: "Signature Present", st: 1 }, { name: "Coverage Amount Valid", st: 1 }, { name: "Date Matches", st: 1 }],
    fields: [
      { label: "Signature", val: "John D. Carter", conf: 99, st: "pending" },
      { label: "Amount",    val: "$500,000",        conf: 97, st: "pending" },
    ],
  },
  {
    name: "Prior Ins.",
    file: "PriorIns_Dec.pdf",
    conf: 88,
    det: "YES",
    rules:  [{ name: "Carrier Name Present", st: 1 }, { name: "Policy # Format", st: 0 }, { name: "Expiry Date Valid", st: 1 }],
    fields: [{ label: "Amount", val: "$300,000", conf: 85, st: "pending" }],
  },
  {
    name: "Inspection",
    file: "Inspection_p1.pdf",
    conf: 62,
    det: "PARTIAL",
    rules:  [{ name: "All Pages Present", st: 1 }, { name: "Inspector ID Valid", st: 0 }, { name: "Pass/Fail Marked", st: 0 }],
    fields: [{ label: "Signature", val: "Present (partial)", conf: 58, st: "pending" }],
  },
];

export const mockDocHTML = [
  `<div style="background:#EEF2FF;padding:14px 18px;border-bottom:1px solid #e5e7eb;">
    <p style="font-size:13px;font-weight:700;color:#1F2937;">STATE DRIVER LICENSE</p>
    <p style="font-size:11px;color:#6B7280;margin-top:2px;">California DMV · Class C</p>
  </div>
  <div style="padding:16px 18px;">
    <table style="width:100%;font-size:12px;border-collapse:collapse">
      <tr><td style="color:#9CA3AF;padding:5px 0;border-bottom:1px solid #F3F4F6">Full Name</td><td style="font-weight:700;color:#5B6AF0;background:rgba(91,106,240,.09);border-radius:3px;padding:2px 6px;">JOHN DANIEL CARTER</td></tr>
      <tr><td style="color:#9CA3AF;padding:5px 0;border-bottom:1px solid #F3F4F6">DOB</td><td style="font-weight:700;color:#5B6AF0;background:rgba(91,106,240,.09);border-radius:3px;padding:2px 6px;">09/22/1985</td></tr>
      <tr><td style="color:#9CA3AF;padding:5px 0;border-bottom:1px solid #F3F4F6">License #</td><td style="font-weight:600;color:#1F2937;padding:2px 6px;">A7823041</td></tr>
      <tr><td style="color:#9CA3AF;padding:5px 0;">Expiry</td><td style="font-weight:700;color:#5B6AF0;background:rgba(91,106,240,.09);border-radius:3px;padding:2px 6px;">03/14/2028</td></tr>
    </table>
  </div>`,

  `<div style="background:#F0FDF4;padding:14px 18px;border-bottom:1px solid #e5e7eb;">
    <p style="font-size:13px;font-weight:700;color:#1F2937;">INSURANCE APPLICATION</p>
    <p style="font-size:11px;color:#6B7280;margin-top:2px;">InsureCo · Auto Policy</p>
  </div>
  <div style="padding:16px 18px;">
    <table style="width:100%;font-size:12px;border-collapse:collapse">
      <tr><td style="color:#9CA3AF;padding:5px 0;border-bottom:1px solid #F3F4F6">Coverage</td><td style="font-weight:700;color:#5B6AF0;background:rgba(91,106,240,.09);border-radius:3px;padding:2px 6px;">$500,000</td></tr>
      <tr><td style="color:#9CA3AF;padding:5px 0;border-bottom:1px solid #F3F4F6">Premium</td><td style="font-weight:600;color:#1F2937;padding:2px 6px;">$1,240/yr</td></tr>
      <tr><td style="color:#9CA3AF;padding:5px 0;border-bottom:1px solid #F3F4F6">Signed</td><td style="font-weight:700;color:#5B6AF0;background:rgba(91,106,240,.09);border-radius:3px;padding:2px 6px;">John D. Carter</td></tr>
      <tr><td style="color:#9CA3AF;padding:5px 0;">Date</td><td style="font-weight:600;color:#1F2937;padding:2px 6px;">03/03/2026</td></tr>
    </table>
  </div>`,

  `<div style="background:#FFF7ED;padding:14px 18px;border-bottom:1px solid #e5e7eb;">
    <p style="font-size:13px;font-weight:700;color:#1F2937;">PRIOR INSURANCE DEC.</p>
    <p style="font-size:11px;color:#6B7280;margin-top:2px;">StateFarm Insurance</p>
  </div>
  <div style="padding:16px 18px;">
    <table style="width:100%;font-size:12px;border-collapse:collapse">
      <tr><td style="color:#9CA3AF;padding:5px 0;border-bottom:1px solid #F3F4F6">Carrier</td><td style="font-weight:700;color:#5B6AF0;background:rgba(91,106,240,.09);border-radius:3px;padding:2px 6px;">StateFarm Insurance</td></tr>
      <tr><td style="color:#9CA3AF;padding:5px 0;border-bottom:1px solid #F3F4F6">Policy #</td><td style="font-weight:600;color:#1F2937;padding:2px 6px;">SF-29840221</td></tr>
      <tr><td style="color:#9CA3AF;padding:5px 0;">Amount</td><td style="font-weight:700;color:#5B6AF0;background:rgba(91,106,240,.09);border-radius:3px;padding:2px 6px;">$300,000</td></tr>
    </table>
  </div>`,

  `<div style="background:#FFF1F2;padding:14px 18px;border-bottom:1px solid #e5e7eb;">
    <p style="font-size:13px;font-weight:700;color:#1F2937;">VEHICLE INSPECTION</p>
    <p style="font-size:11px;color:#6B7280;margin-top:2px;">CA Certified Inspector · Partial</p>
  </div>
  <div style="padding:16px 18px;">
    <table style="width:100%;font-size:12px;border-collapse:collapse">
      <tr><td style="color:#9CA3AF;padding:5px 0;border-bottom:1px solid #F3F4F6">Insp. Date</td><td style="font-weight:600;color:#1F2937;padding:2px 6px;">02/20/2026</td></tr>
      <tr><td style="color:#9CA3AF;padding:5px 0;border-bottom:1px solid #F3F4F6">Inspector ID</td><td style="font-weight:600;color:#1F2937;padding:2px 6px;">CA-44921</td></tr>
      <tr><td style="color:#9CA3AF;padding:5px 0;">Result</td><td style="font-weight:600;color:#F59E0B;padding:2px 6px;">Pass (partial)</td></tr>
    </table>
  </div>`,
];

export const dvMetaData = [
  [{ lbl: "File Name", val: "DL_John_Primary.pdf" }, { lbl: "Type", val: "PDF"   }, { lbl: "Pages", val: "1"      }, { lbl: "Uploaded", val: "Mar 3, 2026" }],
  [{ lbl: "File Name", val: "AppForm_signed.pdf"  }, { lbl: "Type", val: "PDF"   }, { lbl: "Pages", val: "3"      }, { lbl: "Uploaded", val: "Mar 3, 2026" }],
  [{ lbl: "File Name", val: "VehReg_2024.pdf"     }, { lbl: "Type", val: "PDF"   }, { lbl: "Pages", val: "1"      }, { lbl: "Uploaded", val: "Mar 3, 2026" }],
  [{ lbl: "File Name", val: "PriorIns_Dec.pdf"    }, { lbl: "Type", val: "PDF"   }, { lbl: "Pages", val: "2"      }, { lbl: "Uploaded", val: "Mar 3, 2026" }],
  [{ lbl: "File Name", val: "Utility_Bill.jpg"    }, { lbl: "Type", val: "Image" }, { lbl: "Pages", val: "1"      }, { lbl: "Uploaded", val: "Mar 3, 2026" }],
  [{ lbl: "File Name", val: "Inspection_p1.pdf"   }, { lbl: "Type", val: "PDF"   }, { lbl: "Pages", val: "2 of 4" }, { lbl: "Uploaded", val: "Mar 2, 2026" }],
];