import { LogOut } from "lucide-react";
import { signOutAction } from "@/lib/auth/actions";

/** Menu-style "Log out" row (used in the nav drawer). Turns red on hover/focus/press. */
export function LogoutButton() {
  return (
    <form action={signOutAction}>
      <button
        type="submit"
        className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-ink-700 transition-colors hover:bg-danger-100 hover:text-danger-600 focus-visible:bg-danger-100 focus-visible:text-danger-600 focus-visible:outline-none active:bg-danger-600 active:text-white"
      >
        <LogOut className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
        Log out
      </button>
    </form>
  );
}