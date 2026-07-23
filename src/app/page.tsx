import { DataRoomApp } from "@/components/DataRoomApp";
import { DataRoomProvider } from "@/store/data-room-context";

export default function Home() {
  return (
    <DataRoomProvider>
      <DataRoomApp />
    </DataRoomProvider>
  );
}
