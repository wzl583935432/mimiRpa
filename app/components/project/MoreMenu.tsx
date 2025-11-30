import React, { useState, useRef, useEffect } from "react";

export interface MenuItem {
  id: string;
  label: string;
  onClick?: () => void;
}

interface MoreMenuProps {
  items: MenuItem[];
}

const MoreMenu: React.FC<MoreMenuProps> = ({ items }) => {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // 点击外部关闭
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!open) return;

      // 如果点的是按钮 或 菜单内部，则不关闭
      if (
        btnRef.current?.contains(e.target as Node) ||
        menuRef.current?.contains(e.target as Node)
      ) {
        return;
      }

      setOpen(false);
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div  style={{ color:"#0000", position: "relative", display: "inline-block" }}>
      {/* 三点按钮 */}
      <button
        ref={btnRef}
        onClick={() => setOpen((o) => !o)}
        style={{
          color: "#333",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: "6px",
          fontSize: "18px",
          lineHeight: 1,
        }}
      >
        ⋮
      </button>

      {open && (
        <div
          ref={menuRef}
          style={{
            position: "absolute",
            right: 0,
            bottom: 0,
            transform: "translateY(110%)",
            background: "white",
            color: "#333",
            border: "1px solid #ddd",
            borderRadius: "6px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
            padding: "4px 0",
            minWidth: "120px",
            zIndex: 2000,
          }}
        >
          {items.map((item, index) => (
            <div
              key={index}
              onClick={() => {
                setOpen(false);
                item.onClick?.();
              }}
              style={{
                padding: "8px 12px",
                cursor: "pointer",
                fontSize: "14px",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#eee")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              {item.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MoreMenu;
