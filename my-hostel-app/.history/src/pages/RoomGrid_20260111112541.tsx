import RoomCard from "../components/RoomCard";

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
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Room Grid</h2>
      <div className="grid grid-cols-6 gap-3">
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
