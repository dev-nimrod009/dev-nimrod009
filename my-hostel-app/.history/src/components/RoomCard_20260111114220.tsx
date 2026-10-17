import "./RoomCard.scss";

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
  return (
    <div className={`room-card ${status}`}>
      <div className="room-number">{roomNumber}</div>
      <div className="room-price">{price ? `KES ${price}` : "—"}</div>
    </div>
  );
}
