import React from "react";
import { createPortal } from "react-dom";

export const Modal = ({ open, title, children, onClose, actions, hostId = "app-form-host" }) => {
  // Retornar null mantém o formulário fora da página quando ele não está em uso.
  if (!open) return null;
  const content = (
    <div className="w-full">
      <div className="w-full overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/40 dark:border-slate-700 dark:bg-slate-950 dark:shadow-black/10">
        <div>
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{title}</h2>
          <button onClick={onClose} className="rounded-full border border-slate-200 bg-slate-100 p-2 text-slate-600 transition hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
            ✕
          </button>
        </div>
          <div className="p-6">{children}</div>
          {actions && <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-200 px-6 py-4 dark:border-slate-700">{actions}</div>}
        </div>
      </div>
    </div>
  );
  const host = document.getElementById(hostId);
  return host ? createPortal(content, host) : content;
};
