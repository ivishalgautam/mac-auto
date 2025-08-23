import config from "@/config";

export function flattenEnquiry(enquiry) {
  return {
    id: enquiry.id,
    enquiry_code: enquiry.enquiry_code,
    dealer_id: enquiry.dealer_id,
    vehicle_id: enquiry.vehicle_id,
    vehicle_name: enquiry.vehicle_name,
    name: enquiry.name,
    phone: enquiry.phone,
    alt_phone: enquiry.alt_phone,
    location: enquiry.location,
    landmark: enquiry.landmark,
    permanent_address: enquiry.permanent_address,
    present_address: enquiry.present_address,
    house: enquiry.house,
    status: enquiry.status,
    purchase_type: enquiry.purchase_type,
    created_at: enquiry.created_at,
    updated_at: enquiry.updated_at,

    // Flatten arrays into comma-separated strings
    pan: enquiry.pan?.map((i) => `${config.file_base}/${i}`).join(", ") || "",
    aadhaar:
      enquiry.aadhaar?.map((i) => `${config.file_base}/${i}`).join(", ") || "",
    electricity_bill:
      enquiry.electricity_bill
        ?.map((i) => `${config.file_base}/${i}`)
        .join(", ") || "",
    rent_agreement:
      enquiry.rent_agreement
        ?.map((i) => `${config.file_base}/${i}`)
        .join(", ") || "",
    guarantor_aadhaar:
      enquiry.guarantor_aadhaar
        ?.map((i) => `${config.file_base}/${i}`)
        .join(", ") || "",

    // Flatten references (array of objects)
    references: enquiry.references
      ? enquiry.references.map((r) => `${r.name} (${r.landmark})`).join(" | ")
      : "",

    // Flatten guarantor
    guarantor: enquiry.guarantor
      ? `${enquiry.guarantor.name}, ${enquiry.guarantor.phone}, ${enquiry.guarantor.address}`
      : "",

    // Flatten co_applicant
    co_applicant: enquiry.co_applicant
      ? `${enquiry.co_applicant.name}, ${enquiry.co_applicant.phone}, ${enquiry.co_applicant.address}`
      : "",
  };
}
