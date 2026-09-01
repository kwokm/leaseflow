import { redirect } from "next/navigation";
import { LANDLORD_AUTH_HREF } from "@/lib/auth/landlord";

export default function RealtorRedirect() {
  redirect(LANDLORD_AUTH_HREF);
}
