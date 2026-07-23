"use client";

import { formatDate, pluralize } from "@/lib/format";
import { useDataRoom } from "@/store/data-room-context";
import { FolderIcon, PlusIcon } from "./icons";

const CARD_TINTS: Array<[string, string]> = [
  ["#eef2fe", "#2856d6"],
  ["#e6f6f2", "#0f7b6c"],
  ["#fdf1e7", "#c2620f"],
  ["#f3edfd", "#7c3aed"],
  ["#fdecef", "#c31d4b"],
];

interface HomeViewProps {
  onNewRoom: () => void;
}

export function HomeView({ onNewRoom }: HomeViewProps) {
  const { rooms, nodes, openRoom } = useDataRoom();

  return (
    <div className="dr-scroll flex-1 overflow-y-auto px-10 py-8">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="font-serif text-[27px] font-semibold tracking-tight">Data Rooms</h1>
          <p className="mt-1 text-sm text-slate-500">
            {pluralize(rooms.length, "active repository", "active repositories")}
          </p>
        </div>
        <button
          onClick={onNewRoom}
          className="flex h-[42px] cursor-pointer items-center gap-2 rounded-[10px] bg-accent px-4.5 text-sm font-semibold text-white shadow-[0_8px_20px_-8px_rgba(40,86,214,.6)] transition-colors hover:bg-accent-dark"
        >
          <PlusIcon size={16} />
          New Data Room
        </button>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4.5">
        {rooms.map((room, i) => {
          const roomNodes = Object.values(nodes).filter((n) => n.roomId === room.id);
          const lastUpdated = roomNodes.reduce(
            (max, n) => Math.max(max, n.updatedAt),
            room.createdAt,
          );
          const [tint, ink] = CARD_TINTS[i % CARD_TINTS.length];
          return (
            <button
              key={room.id}
              onClick={() => openRoom(room.id)}
              className="cursor-pointer rounded-[14px] border border-line bg-white p-5 text-left transition-all hover:-translate-y-0.5 hover:border-[#c7d3ee] hover:shadow-[0_16px_34px_-22px_rgba(15,23,42,.4)]"
            >
              <div className="mb-4 flex items-center justify-between">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-[11px]"
                  style={{ background: tint, color: ink }}
                >
                  <FolderIcon size={22} />
                </div>
                <span className="rounded-full bg-[#e6f6f2] px-2.5 py-1 text-[11px] font-semibold text-[#0f7b6c]">
                  Active
                </span>
              </div>
              <h3 className="text-base leading-snug font-semibold tracking-tight">{room.name}</h3>
              <div className="mt-3 flex gap-3.5 text-[12.5px] text-slate-400">
                <span>{pluralize(roomNodes.length, "item")}</span>
                <span>·</span>
                <span>Updated {formatDate(lastUpdated)}</span>
              </div>
            </button>
          );
        })}

        <button
          onClick={onNewRoom}
          className="flex min-h-[150px] cursor-pointer flex-col items-center justify-center gap-2.5 rounded-[14px] border-[1.5px] border-dashed border-slate-300 p-5 text-slate-400 transition-all hover:border-accent hover:bg-[#f8faff] hover:text-accent"
        >
          <PlusIcon size={26} />
          <span className="text-[13.5px] font-semibold">Create Data Room</span>
        </button>
      </div>
    </div>
  );
}
