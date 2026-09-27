import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import type { Order } from "@/store/account";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function OrderActionsMenu({
  order,
  onCancel,
}: {
  order: Pick<Order, "id" | "status">;
  onCancel: (id: string) => Promise<unknown>;
}) {
  const [cancelling, setCancelling] = useState(false);

  async function cancel() {
    if (order.status !== "Placed" || cancelling) return;
    setCancelling(true);
    try {
      await onCancel(order.id);
      toast.success(`Order #${order.id} cancelled`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not cancel order");
    } finally {
      setCancelling(false);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`More actions for order ${order.id}`}
          className="grid size-9 shrink-0 place-items-center rounded-lg border hover:bg-muted"
        >
          <MoreHorizontal className="size-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44">
        <DropdownMenuItem asChild>
          <Link to="/orders" search={{ track: order.id }}>Track your order</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/contact" search={{ orderId: order.id }}>Raise a query</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={order.status !== "Placed" || cancelling}
          onSelect={() => void cancel()}
          className="text-destructive focus:text-destructive"
        >
          {cancelling ? "Cancelling…" : "Cancel order"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}