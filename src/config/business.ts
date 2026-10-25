export const business = {
  name: "Acordeon Hamburgueria",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "",
  address: process.env.NEXT_PUBLIC_BUSINESS_ADDRESS || "",
  hours: process.env.NEXT_PUBLIC_BUSINESS_HOURS || "",
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL || "",
  deliveryFee:
    process.env.NEXT_PUBLIC_DELIVERY_FEE_CENTS &&
    /^\d+$/.test(process.env.NEXT_PUBLIC_DELIVERY_FEE_CENTS)
      ? Number(process.env.NEXT_PUBLIC_DELIVERY_FEE_CENTS)
      : null,
};
export const whatsappReady = /^\d{10,15}$/.test(business.whatsapp);
