import type { Metadata } from "next";
import { SampleUsersPage } from "./sample-users";

export const metadata: Metadata = {
  title: "Sample users - Tatak",
  description: "Demo accounts for signing in and trying Tatak.",
};

export default function SampleUsers() {
  return <SampleUsersPage />;
}
