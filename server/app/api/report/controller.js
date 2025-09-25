"use strict";
import table from "../../db/models.js";

const reports = async (req, res) => {
  try {
    const { role } = req.user_data;
    if (role === "admin") {
      const [
        //   stats,
        userRoles,
        enquiryTrends,
        ticketBreakdown,
        latestEnquiries,
      ] = await Promise.all([
        //   DashboardModel.getDashboardStats(),
        table.UserModel.getUserRoleBreakdown(),
        table.WalkinEnquiryModel.getEnquiriesOverTime(req),
        table.TicketModel.getTicketStatusBreakdown(),
        table.WalkinEnquiryModel.getLatestEnquiries(req),
      ]);

      return res.send({
        status: true,
        data: {
          users_by_role: userRoles,
          enquiries_over_time: enquiryTrends,
          ticket_status_breakdown: ticketBreakdown,
          latest_enquiries: latestEnquiries,
        },
      });
    }

    if (role === "dealer") {
      const [
        customersCount,
        enquiries,
        customerTickets,
        dealerTickets,
        enquiryTrends,
        latestEnquiries,
        todaySchemes,
      ] = await Promise.all([
        table.CustomerDealersModel.count(req),
        table.WalkinEnquiryModel.count(req),
        table.TicketModel.count(req),
        table.DealerTicketModel.count(req),
        table.WalkinEnquiryModel.getEnquiriesOverTime(req),
        table.WalkinEnquiryModel.getLatestEnquiries(req),
        table.SchemeModel.todaySchemes(),
      ]);
      return res.send({
        status: true,
        data: {
          customer_count: parseInt(customersCount),
          enquiries: enquiries,
          customer_tickets: parseInt(customerTickets),
          dealer_tickets: parseInt(dealerTickets),
          enquiry_trends: enquiryTrends,
          latest_enquiries: latestEnquiries,
          today_schemes: todaySchemes,
        },
      });
    }
  } catch (error) {
    throw error;
  }
};

export default { reports: reports };
