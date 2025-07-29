export function calculateBatchPdiMatchRates(dealerPdis, adminPdis) {
  const sections = ["addOns", "electricalSystems", "mechanicalSystems"];
  const results = [];

  // Convert admin PDIs to a map for fast lookup by chassis_no
  const adminMap = new Map(
    adminPdis.map((pdi) => [pdi.chassis_no, pdi.pdi_check]),
  );
  dealerPdis.forEach((dealerPdi) => {
    const chassisNo = dealerPdi.chassis_no;
    const dealerCheck = dealerPdi.pdi_check;
    const adminCheck = adminMap.get(chassisNo);

    if (!adminCheck) {
      results.push({ chassis_no: chassisNo, matchRate: "Admin PDI Not Found" });
      return;
    }

    let totalFields = 0;
    let matchingFields = 0;

    sections.forEach((section) => {
      const dealerSection = dealerCheck[section] || {};
      const adminSection = adminCheck[section] || {};

      Object.keys(dealerSection).forEach((key) => {
        totalFields++;
        if (dealerSection[key] === adminSection[key]) {
          matchingFields++;
        }
      });
    });

    const matchRate =
      totalFields === 0 ? 0 : (matchingFields / totalFields) * 100;
    results.push({
      chassis_no: chassisNo,
      matchRate: matchRate.toFixed(2) + "%",
    });
  });

  return results;
}
