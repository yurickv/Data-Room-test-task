"use client";

import { useEffect, useRef, useState } from "react";
import { validateName } from "@/lib/tree";
import { ModalShell } from "./ModalShell";

interface InputModalProps {
  title: string;
  description: string;
  placeholder: string;
  confirmLabel: string;
  initialValue?: string;
  onConfirm: (value: string) => void;
  onClose: () => void;
}

export function InputModal({
  title,
  description,
  placeholder,
  confirmLabel,
  initialValue = "",
  onConfirm,
  onClose,
}: InputModalProps) {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const confirm = () => {
    const validationError = validateName(value);
    if (validationError) {
      setError(validationError);
      return;
    }
    onConfirm(value.trim());
  };

  return (
    <ModalShell onClose={onClose}>
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      <p className="mt-1.5 text-[13.5px] leading-normal text-slate-500">{description}</p>
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setError(null);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") confirm();
          if (e.key === "Escape") onClose();
        }}
        placeholder={placeholder}
        className="mt-4.5 h-[46px] w-full rounded-[10px] border border-line-input bg-[#fbfcfe] px-3.5 text-[14.5px] outline-none focus:border-accent focus:bg-white focus:ring-[3px] focus:ring-accent-ring"
      />
      {error && <div className="mt-2 text-[12.5px] text-red-600">{error}</div>}
      <div className="mt-5 flex justify-end gap-2.5">
        <button
          onClick={onClose}
          className="h-[42px] cursor-pointer rounded-[10px] border border-[#e2e7f0] bg-white px-4.5 text-sm font-semibold text-slate-600 hover:bg-canvas"
        >
          Cancel
        </button>
        <button
          onClick={confirm}
          className="h-[42px] cursor-pointer rounded-[10px] bg-accent px-5 text-sm font-semibold text-white hover:bg-accent-dark"
        >
          {confirmLabel}
        </button>
      </div>
    </ModalShell>
  );
}
