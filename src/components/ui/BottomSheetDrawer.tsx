"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useVisualViewport } from "@/hooks/useVisualViewport";

interface BottomSheetDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
}

export function BottomSheetDrawer({
  isOpen,
  onClose,
  title,
  headerAction,
  children,
}: BottomSheetDrawerProps) {
  const [mounted, setMounted] = useState(false);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef(0);
  const drawerRef = useRef<HTMLDivElement>(null);
  const { style: viewportStyle } = useVisualViewport();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Touch gesture handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    dragStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentY = e.touches[0].clientY;
    const delta = currentY - dragStartY.current;
    if (delta > 0) {
      setDragY(delta);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragY > 120) {
      onClose();
    } else {
      setDragY(0);
    }
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-[2px] animate-drawer-backdrop"
        onClick={onClose}
      />

      {/* Drawer Container (aligned with visual viewport) */}
      <div
        className="fixed left-0 right-0 z-[110] flex flex-col justify-end pointer-events-none"
        style={{
          bottom: viewportStyle.bottom,
          height: viewportStyle.height,
        }}
      >
        {/* Drawer Panel */}
        <div
          ref={drawerRef}
          className="relative z-10 w-full h-[75vh] max-h-[85vh] max-h-full bg-zinc-950/95 border-t border-zinc-800/80 backdrop-blur-md shadow-2xl rounded-t-[2rem] flex flex-col animate-drawer-slide overscroll-contain pb-safe pointer-events-auto"
          role="dialog"
          aria-modal="true"
          style={{
            transform: `translateY(${dragY}px)`,
            transition: isDragging ? "none" : "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          {/* Pull Handle wrapper to increase tap target */}
          <div 
            className="w-full py-3 flex-shrink-0 cursor-grab active:cursor-grabbing"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="w-12 h-1.5 bg-zinc-700/60 rounded-full mx-auto hover:bg-zinc-650 transition-colors" />
          </div>

          {/* Title Header */}
          <div 
            className="px-5 pb-3 pt-1 border-b border-zinc-800/40 flex justify-between items-center text-sm font-semibold select-none"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <span className="truncate text-zinc-200">{title}</span>
            {headerAction}
          </div>

          {/* Scrollable Children Content */}
          {children}
        </div>
      </div>
    </>,
    document.body
  );
}
