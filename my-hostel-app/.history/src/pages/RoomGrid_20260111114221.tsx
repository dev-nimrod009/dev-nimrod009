import RoomCard from "../components/RoomCard";
import "./RoomGrid.scss";

export default function RoomGrid() {
  const rooms = Array.from({ length: 12 }).map((_, i) => ({
    number: `${i + 1}`,
    status:
      i % 4 === 0
        ? "paid"
        : i % 4 === 1
        ? "partial"
        : i % 4 === 2
        ? "overdue"
        : "vacant",
  }));
  return (
    <div className="room-grid">
      <h2 className="page-title">Room Grid</h2>
      <div className="grid cols-6">
        {rooms.map((r) => (
          <RoomCard
            key={r.number}
            roomNumber={`FLR-1-${r.number.padStart(2, "0")}`}
            status={r.status as any}
            price={20000}
          />
        ))}
      </div>
    </div>
  );
}
