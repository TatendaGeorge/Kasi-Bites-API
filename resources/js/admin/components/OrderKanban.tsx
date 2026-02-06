import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Package, GripVertical, Truck, Store } from 'lucide-react';
import { OrderStatus, OrderType } from '../types';

interface KanbanOrder {
  id: number;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  total: string;
  status: OrderStatus;
  status_label: string;
  order_type?: OrderType;
  items_count: number;
  created_at: string;
  delivery_address?: string;
}

interface OrderKanbanProps {
  orders: KanbanOrder[];
  onStatusChange: (orderId: number, newStatus: OrderStatus) => void;
  isUpdating?: boolean;
}

// Define the workflow columns (excluding delivered and cancelled as they are end states)
const KANBAN_COLUMNS: { status: OrderStatus; label: string; color: string; bgColor: string }[] = [
  { status: 'pending', label: 'Pending', color: 'text-yellow-700', bgColor: 'bg-yellow-50 border-yellow-200' },
  { status: 'confirmed', label: 'Confirmed', color: 'text-blue-700', bgColor: 'bg-blue-50 border-blue-200' },
  { status: 'preparing', label: 'Preparing', color: 'text-purple-700', bgColor: 'bg-purple-50 border-purple-200' },
  { status: 'ready', label: 'Ready', color: 'text-green-700', bgColor: 'bg-green-50 border-green-200' },
  { status: 'out_for_delivery', label: 'Out for Delivery', color: 'text-orange-700', bgColor: 'bg-orange-50 border-orange-200' },
];

// Status transition rules
const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['out_for_delivery', 'cancelled'],
  out_for_delivery: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
};

function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return STATUS_TRANSITIONS[from]?.includes(to) || false;
}

// Sortable Order Card Component
function SortableOrderCard({ order, isDragging }: { order: KanbanOrder; isDragging?: boolean }) {
  const navigate = useNavigate();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: order.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on the drag handle
    if ((e.target as HTMLElement).closest('[data-drag-handle]')) return;
    navigate(`/admin/orders/${order.id}`);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        bg-white rounded-lg border border-gray-200 p-3 mb-2 cursor-pointer
        hover:shadow-md hover:border-gray-300 transition-all
        ${isDragging ? 'shadow-lg ring-2 ring-orange-500' : ''}
      `}
      onClick={handleCardClick}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {order.order_type === 'collection' ? (
              <Store className="h-3.5 w-3.5 text-purple-500" />
            ) : (
              <Truck className="h-3.5 w-3.5 text-blue-500" />
            )}
            <span className="font-semibold text-gray-900 text-sm">
              #{order.order_number}
            </span>
            <span className="text-xs text-gray-500">
              {format(new Date(order.created_at), 'HH:mm')}
            </span>
          </div>
          <p className="text-sm text-gray-700 font-medium truncate">
            {order.customer_name}
          </p>
          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
            <Package className="h-3 w-3" />
            <span>{order.items_count} item{order.items_count !== 1 ? 's' : ''}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div
            {...attributes}
            {...listeners}
            data-drag-handle
            className="p-1 rounded hover:bg-gray-100 cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="h-4 w-4 text-gray-400" />
          </div>
          <span className="font-bold text-gray-900 text-sm">
            R{order.total}
          </span>
        </div>
      </div>
    </div>
  );
}

// Overlay Card (shown while dragging)
function OrderCardOverlay({ order }: { order: KanbanOrder }) {
  return (
    <div className="bg-white rounded-lg border-2 border-orange-500 p-3 shadow-xl w-64">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {order.order_type === 'collection' ? (
              <Store className="h-3.5 w-3.5 text-purple-500" />
            ) : (
              <Truck className="h-3.5 w-3.5 text-blue-500" />
            )}
            <span className="font-semibold text-gray-900 text-sm">
              #{order.order_number}
            </span>
          </div>
          <p className="text-sm text-gray-700 font-medium truncate">
            {order.customer_name}
          </p>
          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
            <Package className="h-3 w-3" />
            <span>{order.items_count} item{order.items_count !== 1 ? 's' : ''}</span>
          </div>
        </div>
        <span className="font-bold text-gray-900 text-sm">
          R{order.total}
        </span>
      </div>
    </div>
  );
}

// Droppable Column Component
function KanbanColumn({
  column,
  orders,
  isDropTarget,
  canDrop,
}: {
  column: typeof KANBAN_COLUMNS[0];
  orders: KanbanOrder[];
  isDropTarget: boolean;
  canDrop: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.status,
  });

  const showDropIndicator = isDropTarget || isOver;

  return (
    <div className="flex-1 min-w-[250px] max-w-[300px]">
      <div className={`
        rounded-lg border-2 h-full flex flex-col transition-colors
        ${showDropIndicator && canDrop ? 'border-orange-400 bg-orange-50' : ''}
        ${showDropIndicator && !canDrop ? 'border-red-400 bg-red-50' : ''}
        ${!showDropIndicator ? column.bgColor : ''}
      `}>
        {/* Column Header */}
        <div className="p-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className={`font-semibold ${column.color}`}>
              {column.label}
            </h3>
            <span className={`
              text-xs font-bold px-2 py-1 rounded-full
              ${column.color} bg-white/50
            `}>
              {orders.length}
            </span>
          </div>
        </div>

        {/* Column Content - This is the droppable area */}
        <div
          ref={setNodeRef}
          className="flex-1 p-2 overflow-y-auto min-h-[200px] max-h-[calc(100vh-350px)]"
        >
          <SortableContext
            items={orders.map(o => o.id)}
            strategy={verticalListSortingStrategy}
          >
            {orders.length === 0 ? (
              <div className={`
                flex flex-col items-center justify-center h-32
                ${showDropIndicator && canDrop ? 'text-orange-500' : 'text-gray-400'}
                ${showDropIndicator && !canDrop ? 'text-red-400' : ''}
              `}>
                <Package className="h-8 w-8 mb-2 opacity-50" />
                <p className="text-xs">
                  {showDropIndicator && canDrop ? 'Drop here' : 'No orders'}
                </p>
              </div>
            ) : (
              orders.map((order) => (
                <SortableOrderCard key={order.id} order={order} />
              ))
            )}
          </SortableContext>
        </div>
      </div>
    </div>
  );
}

export default function OrderKanban({ orders, onStatusChange, isUpdating }: OrderKanbanProps) {
  const [activeOrder, setActiveOrder] = useState<KanbanOrder | null>(null);
  const [overColumn, setOverColumn] = useState<OrderStatus | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  // Group orders by status
  const ordersByStatus = KANBAN_COLUMNS.reduce((acc, column) => {
    acc[column.status] = orders.filter(o => o.status === column.status);
    return acc;
  }, {} as Record<OrderStatus, KanbanOrder[]>);

  const handleDragStart = (event: DragStartEvent) => {
    const orderId = event.active.id as number;
    const order = orders.find(o => o.id === orderId);
    if (order) {
      setActiveOrder(order);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    if (!over) {
      setOverColumn(null);
      return;
    }

    // Check if we're over a column or an order in a column
    const overId = over.id;

    // Check if overId is a status (column)
    const isColumn = KANBAN_COLUMNS.some(col => col.status === overId);
    if (isColumn) {
      setOverColumn(overId as OrderStatus);
      return;
    }

    // Check if overId is an order, get its status
    const overOrder = orders.find(o => o.id === overId);
    if (overOrder) {
      setOverColumn(overOrder.status);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveOrder(null);
    setOverColumn(null);

    if (!over || !activeOrder) return;

    const overId = over.id;
    let targetStatus: OrderStatus | null = null;

    // Check if dropped on a column
    const isColumn = KANBAN_COLUMNS.some(col => col.status === overId);
    if (isColumn) {
      targetStatus = overId as OrderStatus;
    } else {
      // Dropped on an order, get its status
      const overOrder = orders.find(o => o.id === overId);
      if (overOrder) {
        targetStatus = overOrder.status;
      }
    }

    // Update status if it changed and transition is valid
    if (targetStatus && targetStatus !== activeOrder.status) {
      if (canTransition(activeOrder.status, targetStatus)) {
        onStatusChange(activeOrder.id, targetStatus);
      }
    }
  };

  const handleDragCancel = () => {
    setActiveOrder(null);
    setOverColumn(null);
  };

  return (
    <div className="relative">
      {isUpdating && (
        <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {KANBAN_COLUMNS.map((column) => (
            <KanbanColumn
              key={column.status}
              column={column}
              orders={ordersByStatus[column.status] || []}
              isDropTarget={overColumn === column.status}
              canDrop={activeOrder ? canTransition(activeOrder.status, column.status) : false}
            />
          ))}
        </div>

        <DragOverlay>
          {activeOrder ? <OrderCardOverlay order={activeOrder} /> : null}
        </DragOverlay>
      </DndContext>

      {/* Legend */}
      <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <GripVertical className="h-3 w-3" />
          Drag to change status
        </span>
        <span>|</span>
        <span>Click card to view details</span>
      </div>
    </div>
  );
}
