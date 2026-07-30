import CourseTrackerApp from "../../components/CourseTrackerApp";

// This is the ONLY door into the admin login screen. It is not linked from
// anywhere in the public site (no button, no nav item) — the only way to
// find it is to already know this exact URL. Keep it private: don't post
// it publicly, and share it only with trusted admins.
export const metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminEntry() {
  return <CourseTrackerApp initialView="login" />;
}
