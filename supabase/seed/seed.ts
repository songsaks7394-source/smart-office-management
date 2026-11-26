/**
 * Dummy data seed script.
 * Run with: npm run seed
 * Requires .env.local with SUPABASE_SERVICE_ROLE_KEY set.
 */
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const DEMO_USERS = [
  { email: "admin@smartoffice.com", password: "Admin123!", full_name: "Alex Morgan", role: "admin", department: "IT Administration" },
  { email: "employee1@smartoffice.com", password: "Employee123!", full_name: "Jamie Chen", role: "employee", department: "Marketing" },
  { email: "employee2@smartoffice.com", password: "Employee123!", full_name: "Sam Patel", role: "employee", department: "Finance" },
  { email: "employee3@smartoffice.com", password: "Employee123!", full_name: "Taylor Reed", role: "employee", department: "Engineering" },
];

async function main() {
  console.log("Seeding demo users...");
  const userIds: Record<string, string> = {};

  for (const u of DEMO_USERS) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: { full_name: u.full_name, role: u.role, department: u.department },
    });
    if (error) {
      console.warn(`  ! ${u.email}: ${error.message}`);
      continue;
    }
    userIds[u.email] = data.user!.id;
    if (u.role === "admin") {
      // Sign-up always creates 'employee'; promote the demo admin here (service role bypasses the guard).
      const { error: roleErr } = await supabase.from("users").update({ role: "admin" }).eq("id", data.user!.id);
      if (roleErr) console.warn(`  ! could not promote ${u.email}: ${roleErr.message}`);
    }
    console.log(`  created ${u.email} (${u.role})`);
  }

  const adminId = userIds["admin@smartoffice.com"];
  const emp1 = userIds["employee1@smartoffice.com"];
  const emp2 = userIds["employee2@smartoffice.com"];
  const emp3 = userIds["employee3@smartoffice.com"];

  if (emp1) {
    console.log("Seeding repair requests...");
    await supabase.from("repair_requests").insert([
      { title: "Flickering lights in meeting room B", description: "The overhead lights keep flickering during meetings, very distracting.", location: "Room B, 2nd Floor", status: "Pending", created_by: emp1 },
      { title: "Broken office chair", description: "Chair arm rest snapped off, needs replacement or repair.", location: "Desk 14, Marketing Bay", status: "In Progress", created_by: emp1 },
      { title: "AC not cooling on 3rd floor", description: "The air conditioning unit is running but not cooling the space.", location: "3rd Floor, East Wing", status: "Completed", created_by: emp2 },
    ]);

    console.log("Seeding equipment requests...");
    await supabase.from("equipment_requests").insert([
      { item_name: "Wireless Mouse", quantity: 1, reason: "Current mouse stopped working.", status: "Pending", requested_by: emp1 },
      { item_name: "External Monitor", quantity: 2, reason: "Setting up a dual-monitor workstation for the design team.", status: "Approved", requested_by: emp2, reviewed_by: adminId, reviewed_at: new Date().toISOString() },
      { item_name: "Ergonomic Keyboard", quantity: 1, reason: "Wrist strain from current keyboard.", status: "Rejected", requested_by: emp3, reviewed_by: adminId, reviewed_at: new Date().toISOString() },
    ]);

    console.log("Seeding borrow records...");
    const today = new Date();
    const past = new Date(today); past.setDate(past.getDate() - 10);
    const overdueDue = new Date(today); overdueDue.setDate(overdueDue.getDate() - 2);
    const futureDue = new Date(today); futureDue.setDate(futureDue.getDate() + 5);

    await supabase.from("borrow_records").insert([
      { asset_name: "Laptop", asset_tag: "LAP-0231", borrow_date: past.toISOString(), due_date: overdueDue.toISOString().slice(0, 10), status: "Overdue", borrower: emp1 },
      { asset_name: "Projector", asset_tag: "PRJ-0007", borrow_date: today.toISOString(), due_date: futureDue.toISOString().slice(0, 10), status: "Borrowed", borrower: emp2 },
      { asset_name: "Monitor", asset_tag: "MON-0112", borrow_date: past.toISOString(), return_date: today.toISOString(), due_date: overdueDue.toISOString().slice(0, 10), status: "Returned", borrower: emp3 },
    ]);

    const { data: rooms } = await supabase.from("meeting_rooms").select("*");
    const roomA = rooms?.find((r) => r.room_name === "Room A");
    const roomC = rooms?.find((r) => r.room_name === "Room C");

    if (roomA && roomC) {
      console.log("Seeding room bookings...");
      const bookingDate = today.toISOString().slice(0, 10);
      await supabase.from("room_bookings").insert([
        { room_id: roomA.id, room_name: roomA.room_name, booking_date: bookingDate, start_time: "10:00", end_time: "11:00", purpose: "Marketing sync", booked_by: emp1 },
        { room_id: roomC.id, room_name: roomC.room_name, booking_date: bookingDate, start_time: "14:00", end_time: "15:30", purpose: "All-hands meeting", booked_by: adminId },
      ]);
    }
  }

  console.log("\nSeed complete. Demo accounts:");
  DEMO_USERS.forEach((u) => console.log(`  ${u.email} / ${u.password} (${u.role})`));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
