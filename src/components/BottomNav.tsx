import { useLocation } from "react-router-dom";

const tabs = [
  {
    href: "/",
    label: "Басты",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    href: "/stations",
    label: "Станции",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" />
      </svg>
    ),
  },
];

const BottomNav = () => {
  const location = useLocation();

  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "stretch",
        background: "rgba(10,10,10,0.92)",
        backdropFilter: "blur(16px)",
        borderTop: "1px solid rgba(6,182,212,0.2)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
      className="md:hidden"
    >
      {tabs.map((tab) => {
        const active = location.pathname === tab.href;
        return (
          <a
            key={tab.href}
            href={tab.href}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              padding: "10px 0",
              color: active ? "#06b6d4" : "#6b7280",
              textDecoration: "none",
              fontSize: 11,
              fontWeight: active ? 600 : 400,
              transition: "color 0.2s",
            }}
          >
            {tab.icon}
            {tab.label}
          </a>
        );
      })}
    </nav>
  );
};

export default BottomNav;
