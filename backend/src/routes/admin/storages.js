import { Storage } from "../../libraries/storage.js";

export const adminStorage = new Storage({ dir: "admins", isImage: true, isDoc: false, fileSize: 2 });
export const appSettingStorage = new Storage({ dir: "application", isImage: true, isDoc: false, fileSize: 5 });
export const customerStorage = new Storage({ dir: "customers", isImage: true, isDoc: false, fileSize: 2 });
export const serviceCategoryStorage = new Storage({ dir: "service-categories", isImage: true, isDoc: false, fileSize: 2 });
export const serviceProviderStorage = new Storage({ dir: "service-provider", isImage: true, isDoc: true, fileSize: 5 });
export const serviceProviderWorkPhotoStorage = new Storage({ dir: "service-provider-work", isImage: true, isDoc: false, fileSize: 2 });
export const bannerStorage = new Storage({ dir: "banners", isImage: true, isDoc: false, fileSize: 5 });
export const testimonialStorage = new Storage({ dir: "testimonials", isImage: true, isDoc: false, fileSize: 3 });
export const ourValueStorage = new Storage({ dir: "our-values", isImage: true, isDoc: false, fileSize: 2 });
export const bookingChatStorage = new Storage({ dir: "booking-chat", isImage: true, isDoc: false, fileSize: 5 });
