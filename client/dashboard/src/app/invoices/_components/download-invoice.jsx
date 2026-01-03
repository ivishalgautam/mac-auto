"use client";
import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
import ErrorMessage from "@/components/ui/error";
import { useGetInvoice } from "@/mutations/invoices-mutation";
import { Download } from "lucide-react";
import { useRef, useState } from "react";

export default function DownloadInvoice({ id }) {
  const { data, isLoading, isError, error } = useGetInvoice(id);
  const invoiceRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const formatCurrency = (amount) => {
    if (!amount) return "₹0.00";
    const num = parseFloat(amount);
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(num);
  };

  const formatDate = (dateString) => {
    if (!dateString) return new Date().toLocaleDateString("en-IN");
    return new Date(dateString).toLocaleDateString("en-IN");
  };

  const calculateGrandTotal = () => {
    return data.vehicle_price_breakups.reduce((sum, vehicle) => {
      return sum + parseFloat(vehicle.on_road_price || 0);
    }, 0);
  };

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    try {
      // Import libraries dynamically
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;

      const element = invoiceRef.current;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        onclone: (clonedDoc) => {
          // Fix any remaining oklch colors in the cloned document
          clonedDoc.querySelectorAll("*").forEach((el) => {
            const style = window.getComputedStyle(el);
            if (
              style.backgroundColor &&
              style.backgroundColor.includes("oklch")
            ) {
              el.style.backgroundColor = "#ffffff";
            }
            if (style.color && style.color.includes("oklch")) {
              el.style.color = "#000000";
            }
          });
        },
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = 210;
      const pdfHeight = 297;
      const margin = 10;
      const imgWidth = pdfWidth - 2 * margin;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = margin;

      pdf.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight - 2 * margin;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight + margin;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight - 2 * margin;
      }

      pdf.save(`Invoice-${data.invoice_no}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) return <Loader />;
  if (isError) return <ErrorMessage error={error} />;

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f9fafb",
        padding: "16px",
      }}
    >
      <div style={{ maxWidth: "896px", margin: "0 auto" }}>
        {/* Action Button */}
        <div style={{ textAlign: "right", marginBottom: "16px" }}>
          <Button
            type="button"
            onClick={handleDownloadPDF}
            disabled={isGenerating}
          >
            <Download size={16} />
            {isGenerating ? "Generating PDF..." : "Download PDF"}
          </Button>
        </div>

        {/* Invoice Document */}
        <div
          ref={invoiceRef}
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #d1d5db",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
          }}
        >
          {/* Header */}
          <div
            style={{
              backgroundColor: "#4366B0",
              color: "#ffffff",
              padding: "24px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div>
                <h1
                  style={{
                    fontSize: "30px",
                    fontWeight: "bold",
                    marginBottom: "8px",
                    margin: 0,
                  }}
                >
                  INVOICE
                </h1>
                <p style={{ color: "#c7d9f2", margin: "4px 0 0 0" }}>
                  Quote No: {data.invoice_no}
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: "14px", margin: "0 0 4px 0" }}>
                  Date: {formatDate(data.date)}
                </p>
                {/* <p style={{ fontSize: "14px", margin: 0 }}>
                  Status:{" "}
                  <span
                    style={{
                      color: "#fff",
                      fontSize: "12px",
                      fontWeight: "600",
                      textTransform: "uppercase",
                      display: "inline-block",
                    }}
                  >
                    {data.status}
                  </span>
                </p> */}
              </div>
            </div>
          </div>

          {/* Customer Details */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "start",
              paddingInline: "20px",
              borderBottom: "1px solid #e5e7eb",
            }}
          >
            <div style={{ flexShrink: 0, flex: 1 }}>
              <img
                src={"/logo.png"}
                width={200}
                height={200}
                alt="Mack-Ev"
                style={{ marginInline: "auto" }}
              />
            </div>

            <div
              style={{
                width: "100%",
                padding: "24px",

                flex: 2,
              }}
            >
              <h2
                style={{
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "#1f2937",
                  marginBottom: "12px",
                  marginTop: 0,
                }}
              >
                Customer Details
              </h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                  fontSize: "14px",
                }}
              >
                <div>
                  <p style={{ color: "#6b7280", margin: "0 0 4px 0" }}>Name:</p>
                  <p style={{ fontWeight: "500", color: "#111827", margin: 0 }}>
                    {data.customer_name}
                  </p>
                </div>
                <div>
                  <p style={{ color: "#6b7280", margin: "0 0 4px 0" }}>
                    Mobile:
                  </p>
                  <p style={{ fontWeight: "500", color: "#111827", margin: 0 }}>
                    {data.mobile_no}
                  </p>
                </div>
                <div>
                  <p style={{ color: "#6b7280", margin: "0 0 4px 0" }}>
                    Address:
                  </p>
                  <p style={{ fontWeight: "500", color: "#111827", margin: 0 }}>
                    {data.address ?? "N/a"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Vehicle Details */}
          <div style={{ padding: "24px" }}>
            <h2
              style={{
                fontSize: "18px",
                fontWeight: "600",
                color: "#1f2937",
                marginBottom: "16px",
                marginTop: 0,
              }}
            >
              Vehicle Price Breakup
            </h2>

            {data.vehicle_price_breakups.map((vehicle, index) => (
              <div
                key={index}
                style={{
                  marginBottom: "32px",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  overflow: "hidden",
                }}
              >
                {/* Vehicle Header */}
                <div
                  style={{
                    backgroundColor: "#f3f4f6",
                    padding: "12px 16px",
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  <h3
                    style={{
                      fontWeight: "600",
                      color: "#1f2937",
                      margin: 0,
                      fontSize: "15px",
                    }}
                  >
                    Vehicle {index + 1}: {vehicle.model}
                  </h3>
                </div>

                {/* Price Table */}
                <table
                  style={{
                    width: "100%",
                    fontSize: "14px",
                    borderCollapse: "collapse",
                  }}
                >
                  <tbody>
                    <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                      <td
                        style={{
                          padding: "12px 16px",
                          color: "#374151",
                          fontWeight: "500",
                        }}
                      >
                        Base Price (Ex-Showroom)
                      </td>
                      <td
                        style={{
                          padding: "12px 16px",
                          textAlign: "right",
                          fontWeight: "600",
                          color: "#111827",
                        }}
                      >
                        {formatCurrency(vehicle.base_price_ex_showroom)}
                      </td>
                    </tr>

                    <tr
                      style={{
                        borderBottom: "1px solid #e5e7eb",
                        backgroundColor: "#f9fafb",
                      }}
                    >
                      <td style={{ padding: "12px 16px", color: "#374151" }}>
                        GST ({vehicle.gst}%)
                      </td>
                      <td
                        style={{
                          padding: "12px 16px",
                          textAlign: "right",
                          color: "#111827",
                        }}
                      >
                        {formatCurrency(
                          (parseFloat(vehicle.base_price_ex_showroom) *
                            vehicle.gst) /
                            100,
                        )}
                      </td>
                    </tr>

                    {vehicle.discount && parseFloat(vehicle.discount) > 0 && (
                      <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                        <td
                          style={{
                            padding: "12px 16px",
                            color: "#059669",
                            fontWeight: "500",
                          }}
                        >
                          Discount
                        </td>
                        <td
                          style={{
                            padding: "12px 16px",
                            textAlign: "right",
                            color: "#059669",
                            fontWeight: "600",
                          }}
                        >
                          - {formatCurrency(vehicle.discount)}
                        </td>
                      </tr>
                    )}

                    <tr
                      style={{
                        borderBottom: "1px solid #e5e7eb",
                        backgroundColor: "#f9fafb",
                      }}
                    >
                      <td style={{ padding: "12px 16px", color: "#374151" }}>
                        Accessories & Fitments
                      </td>
                      <td
                        style={{
                          padding: "12px 16px",
                          textAlign: "right",
                          color: "#111827",
                        }}
                      >
                        {formatCurrency(vehicle.accessories_fitments)}
                      </td>
                    </tr>

                    <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                      <td
                        style={{
                          padding: "12px 16px",
                          color: "#374151",
                          fontWeight: "500",
                        }}
                      >
                        Total Ex-Showroom Price
                      </td>
                      <td
                        style={{
                          padding: "12px 16px",
                          textAlign: "right",
                          fontWeight: "600",
                          color: "#111827",
                        }}
                      >
                        {formatCurrency(vehicle.total_ex_showroom_price)}
                      </td>
                    </tr>

                    <tr
                      style={{
                        borderBottom: "1px solid #e5e7eb",
                        backgroundColor: "#f9fafb",
                      }}
                    >
                      <td style={{ padding: "12px 16px", color: "#374151" }}>
                        Insurance
                      </td>
                      <td
                        style={{
                          padding: "12px 16px",
                          textAlign: "right",
                          color: "#111827",
                        }}
                      >
                        {formatCurrency(vehicle.insurance)}
                      </td>
                    </tr>

                    <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                      <td style={{ padding: "12px 16px", color: "#374151" }}>
                        RTO Registration Charges
                      </td>
                      <td
                        style={{
                          padding: "12px 16px",
                          textAlign: "right",
                          color: "#111827",
                        }}
                      >
                        {formatCurrency(vehicle.rto_registration_charges)}
                      </td>
                    </tr>

                    <tr
                      style={{
                        backgroundColor: "#e8f4e0",
                        borderBottom: "2px solid #7FC55A",
                      }}
                    >
                      <td
                        style={{
                          padding: "16px",
                          color: "#2d5016",
                          fontWeight: "bold",
                          fontSize: "16px",
                        }}
                      >
                        On-Road Price
                      </td>
                      <td
                        style={{
                          padding: "16px",
                          textAlign: "right",
                          color: "#2d5016",
                          fontWeight: "bold",
                          fontSize: "18px",
                        }}
                      >
                        {formatCurrency(vehicle.on_road_price)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ))}

            {/* Grand Total */}
            {data.vehicle_price_breakups.length > 1 && (
              <div
                style={{
                  marginTop: "24px",
                  border: "2px solid #7FC55A",
                  borderRadius: "8px",
                }}
              >
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <tbody>
                    <tr style={{ backgroundColor: "#7FC55A" }}>
                      <td
                        style={{
                          padding: "16px 24px",
                          color: "#ffffff",
                          fontSize: "20px",
                          fontWeight: "bold",
                        }}
                      >
                        Grand Total (All Vehicles)
                      </td>
                      <td
                        style={{
                          padding: "16px 24px",
                          textAlign: "right",
                          color: "#ffffff",
                          fontSize: "24px",
                          fontWeight: "bold",
                        }}
                      >
                        {formatCurrency(calculateGrandTotal())}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              borderTop: "1px solid #e5e7eb",
              backgroundColor: "#f9fafb",
              padding: "24px",
            }}
          >
            <div style={{ fontSize: "14px", color: "#6b7280" }}>
              <p style={{ margin: "0 0 8px 0" }}>
                <strong style={{ color: "#374151" }}>Note:</strong> This invoice
                is valid for 30 days from the date of issue.
              </p>
              <p style={{ margin: "0 0 8px 0" }}>
                Prices are subject to change without prior notice. Final prices
                will be confirmed at the time of booking.
              </p>
              <p
                style={{
                  marginTop: "16px",
                  fontSize: "12px",
                  color: "#9ca3af",
                  margin: "16px 0 0 0",
                }}
              >
                Generated on: {new Date().toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
