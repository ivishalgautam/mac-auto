"use strict";
import table from "../../db/models.js";

const reports = async (req, res) => {
  try {
    const [
      //   stats,
      userRoles,
      enquiryTrends,
      ticketBreakdown,
      latestEnquiries,
    ] = await Promise.all([
      //   DashboardModel.getDashboardStats(),
      table.UserModel.getUserRoleBreakdown(),
      table.EnquiryModel.getEnquiriesOverTime(),
      table.TicketModel.getTicketStatusBreakdown(),
      table.EnquiryModel.getLatestEnquiries(),
    ]);

    res.send({
      status: true,
      data: {
        // ...stats,
        users_by_role: userRoles,
        enquiries_over_time: enquiryTrends,
        ticket_status_breakdown: ticketBreakdown,
        latest_enquiries: latestEnquiries,
      },
    });
  } catch (error) {
    throw error;
  }
};

export default { reports: reports };
