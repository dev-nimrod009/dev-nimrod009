type Props = {
  roomNumber: string;
  status?: "paid" | "partial" | "vacant" | "overdue";
  price?: number;
};

export default function RoomCard({
  roomNumber,
  status = "vacant",
  price,
}: Props) {
  const color =
    status === "paid"
      ? "bg-green-500"
      : status === "partial"
      ? "bg-yellow-400"
      : status === "overdue"
      ? "bg-red-500"
      : "bg-gray-300";
  return (
    <div className={`p-3 rounded-md shadow-sm ${color} text-gray-900`}>
      <div className="font-semibold">{roomNumber}</div>
      <div className="text-sm">{price ? `KES ${price}` : "—"}</div>
    </div>
  );
}
