export type UserRole = "admin" | "employee";
export type RepairStatus = "Pending" | "In Progress" | "Completed";
export type EquipmentStatus = "Pending" | "Approved" | "Rejected";
export type BorrowStatus = "Borrowed" | "Returned" | "Overdue";
export type AssetName = "Laptop" | "Mouse" | "Keyboard" | "Monitor" | "Projector";
export type RoomName = "Room A" | "Room B" | "Room C";
export type NotificationType =
  | "repair_created"
  | "repair_status_changed"
  | "equipment_approved"
  | "equipment_rejected"
  | "asset_overdue"
  | "booking_confirmed";

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role: UserRole;
          department: string | null;
          avatar_url: string | null;
          phone: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          role?: UserRole;
          department?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          created_at?: string;
        };
        Update: {
          email?: string;
          full_name?: string;
          role?: UserRole;
          department?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
        };
        Relationships: [];
      };
      repair_requests: {
        Row: {
          id: string;
          title: string;
          description: string;
          location: string;
          image_url: string | null;
          status: RepairStatus;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          location: string;
          image_url?: string | null;
          status?: RepairStatus;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          description?: string;
          location?: string;
          image_url?: string | null;
          status?: RepairStatus;
          updated_at?: string;
        };
        Relationships: [];
      };
      equipment_requests: {
        Row: {
          id: string;
          item_name: string;
          quantity: number;
          reason: string;
          status: EquipmentStatus;
          request_date: string;
          requested_by: string;
          reviewed_by: string | null;
          reviewed_at: string | null;
        };
        Insert: {
          id?: string;
          item_name: string;
          quantity: number;
          reason: string;
          status?: EquipmentStatus;
          request_date?: string;
          requested_by: string;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
        };
        Update: {
          item_name?: string;
          quantity?: number;
          reason?: string;
          status?: EquipmentStatus;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
        };
        Relationships: [];
      };
      borrow_records: {
        Row: {
          id: string;
          asset_name: AssetName;
          asset_tag: string | null;
          borrow_date: string;
          return_date: string | null;
          due_date: string;
          status: BorrowStatus;
          borrower: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          asset_name: AssetName;
          asset_tag?: string | null;
          borrow_date?: string;
          return_date?: string | null;
          due_date: string;
          status?: BorrowStatus;
          borrower: string;
          created_at?: string;
        };
        Update: {
          return_date?: string | null;
          status?: BorrowStatus;
        };
        Relationships: [];
      };
      meeting_rooms: {
        Row: {
          id: string;
          room_name: RoomName;
          capacity: number;
          location: string | null;
        };
        Insert: {
          id?: string;
          room_name: RoomName;
          capacity: number;
          location?: string | null;
        };
        Update: {
          capacity?: number;
          location?: string | null;
        };
        Relationships: [];
      };
      room_bookings: {
        Row: {
          id: string;
          room_id: string;
          room_name: RoomName;
          booking_date: string;
          start_time: string;
          end_time: string;
          purpose: string | null;
          booked_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          room_name: RoomName;
          booking_date: string;
          start_time: string;
          end_time: string;
          purpose?: string | null;
          booked_by: string;
          created_at?: string;
        };
        Update: {
          booking_date?: string;
          start_time?: string;
          end_time?: string;
          purpose?: string | null;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: NotificationType;
          title: string;
          message: string;
          is_read: boolean;
          related_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: NotificationType;
          title: string;
          message: string;
          is_read?: boolean;
          related_id?: string | null;
          created_at?: string;
        };
        Update: {
          is_read?: boolean;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      mark_overdue_assets: { Args: Record<PropertyKey, never>; Returns: undefined };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
}

export type User = Database["public"]["Tables"]["users"]["Row"];
export type RepairRequest = Database["public"]["Tables"]["repair_requests"]["Row"];
export type EquipmentRequest = Database["public"]["Tables"]["equipment_requests"]["Row"];
export type BorrowRecord = Database["public"]["Tables"]["borrow_records"]["Row"];
export type MeetingRoom = Database["public"]["Tables"]["meeting_rooms"]["Row"];
export type RoomBooking = Database["public"]["Tables"]["room_bookings"]["Row"];
export type Notification = Database["public"]["Tables"]["notifications"]["Row"];
