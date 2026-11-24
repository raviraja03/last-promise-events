export type EnquiryNotification = {
  reference: string;
  category: string;
};

export interface EnquiryNotifier {
  notifyNewEnquiry(enquiry: EnquiryNotification): Promise<"sent" | "disabled">;
}

/** Notifications stay disabled until an email provider and verified destination are configured. */
export const enquiryNotifier: EnquiryNotifier = {
  async notifyNewEnquiry() {
    return "disabled";
  },
};
