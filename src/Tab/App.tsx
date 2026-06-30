import { useState, useEffect, useRef } from "react";

type Screen = "home" | "chat" | "my-purchase-requests" | "approvals";
type PurchaseRequestType = "inventory" | "expense" | null;
type ThemeMode = "dark" | "light" | "contrast";
type MessageType = "bot" | "user" | "card" | "options" | "input" | "review" | "success";

interface Message {
  id: string;
  type: MessageType;
  content?: string;
  options?: { label: string; value: string }[];
  field?: string;
  inputType?: string;
  placeholder?: string;
  cardData?: any;
  searchable?: boolean;
  animate?: boolean;
}

const itemMasterData = [
  { id: "ITEM-10001", name: "Cisco Router 4451", unitPrice: "1200", warehouse: "WH-DENVER-01", taskNumber: "TASK-001", taskName: "Router Installation", projectNumber: "PROJ-001", projectName: "Core Network Upgrade", subInventory: "General Inventory" },
  { id: "ITEM-10002", name: "Cisco Router 4331", unitPrice: "1100", warehouse: "WH-DENVER-02", taskNumber: "TASK-002", taskName: "Router Configuration", projectNumber: "PROJ-002", projectName: "Data Center Expansion", subInventory: "Critical Spare" },
  { id: "ITEM-10003", name: "Cisco Catalyst 8300", unitPrice: "2500", warehouse: "WH-TEXAS-01", taskNumber: "TASK-003", taskName: "Switch Installation", projectNumber: "PROJ-003", projectName: "Fiber Backbone Modernization", subInventory: "" },
  { id: "ITEM-10004", name: "Cisco ISR 1100", unitPrice: "950", warehouse: "WH-TEXAS-02", taskNumber: "TASK-004", taskName: "Switch Configuration", projectNumber: "PROJ-004", projectName: "Network Security Enhancement", subInventory: "" },
  { id: "ITEM-10005", name: "Cisco Nexus 9000", unitPrice: "4500", warehouse: "WH-NEWYORK-01", taskNumber: "TASK-005", taskName: "Firewall Setup", projectNumber: "PROJ-005", projectName: "Cloud Migration Initiative", subInventory: "" },
  { id: "ITEM-10006", name: "Dell Latitude 5450", unitPrice: "1400", warehouse: "WH-NEWYORK-02", taskNumber: "TASK-006", taskName: "Firewall Validation", projectNumber: "PROJ-006", projectName: "WAN Optimization Project", subInventory: "" },
  { id: "ITEM-10007", name: "Dell Precision 3580", unitPrice: "2200", warehouse: "WH-CHICAGO-01", taskNumber: "TASK-007", taskName: "Fiber Cable Deployment", projectNumber: "PROJ-007", projectName: "Router Refresh Program", subInventory: "" },
  { id: "ITEM-10008", name: "HP EliteBook 840", unitPrice: "1350", warehouse: "WH-CHICAGO-02", taskNumber: "TASK-008", taskName: "Fiber Testing", projectNumber: "PROJ-008", projectName: "Switch Replacement Program", subInventory: "" },
  { id: "ITEM-10009", name: "Lenovo ThinkPad T14", unitPrice: "1450", warehouse: "WH-ATLANTA-01", taskNumber: "TASK-009", taskName: "Rack Installation", projectNumber: "PROJ-009", projectName: "Disaster Recovery Setup", subInventory: "" },
  { id: "ITEM-10010", name: "Aruba Switch 6300", unitPrice: "2800", warehouse: "WH-ATLANTA-02", taskNumber: "TASK-010", taskName: "Rack Cabling", projectNumber: "PROJ-010", projectName: "MPLS Network Upgrade", subInventory: "" },
  { id: "ITEM-10011", name: "Aruba Switch 6200", unitPrice: "2200", warehouse: "WH-PHOENIX-01", taskNumber: "TASK-011", taskName: "Power Setup", projectNumber: "PROJ-011", projectName: "SD-WAN Deployment", subInventory: "" },
  { id: "ITEM-10012", name: "Juniper MX204", unitPrice: "7500", warehouse: "WH-PHOENIX-02", taskNumber: "TASK-012", taskName: "UPS Installation", projectNumber: "PROJ-012", projectName: "Edge Computing Expansion", subInventory: "" },
  { id: "ITEM-10013", name: "Juniper EX4300", unitPrice: "3200", warehouse: "WH-DALLAS-01", taskNumber: "TASK-013", taskName: "Server Deployment", projectNumber: "PROJ-013", projectName: "Optical Transport Upgrade", subInventory: "" },
  { id: "ITEM-10014", name: "Fortinet 100F", unitPrice: "3800", warehouse: "WH-DALLAS-02", taskNumber: "TASK-014", taskName: "Storage Deployment", projectNumber: "PROJ-014", projectName: "Data Center Consolidation", subInventory: "" },
  { id: "ITEM-10015", name: "Palo Alto PA-440", unitPrice: "4200", warehouse: "WH-SEATTLE-01", taskNumber: "TASK-015", taskName: "Network Assessment", projectNumber: "PROJ-015", projectName: "VoIP Infrastructure Upgrade", subInventory: "" },
  { id: "ITEM-10016", name: "Fiber Cable 100m", unitPrice: "250", warehouse: "WH-SEATTLE-02", taskNumber: "TASK-016", taskName: "Security Review", projectNumber: "PROJ-016", projectName: "Security Compliance Project", subInventory: "" },
  { id: "ITEM-10017", name: "Fiber Cable 500m", unitPrice: "950", warehouse: "WH-MIAMI-01", taskNumber: "TASK-017", taskName: "Site Survey", projectNumber: "PROJ-017", projectName: "Firewall Modernization", subInventory: "" },
  { id: "ITEM-10018", name: "Fiber Patch Panel", unitPrice: "180", warehouse: "WH-MIAMI-02", taskNumber: "TASK-018", taskName: "Equipment Procurement", projectNumber: "PROJ-018", projectName: "Network Automation Program", subInventory: "" },
  { id: "ITEM-10019", name: "SFP Module 10G", unitPrice: "120", warehouse: "WH-LA-01", taskNumber: "TASK-019", taskName: "Inventory Validation", projectNumber: "PROJ-019", projectName: "Enterprise WiFi Expansion", subInventory: "" },
  { id: "ITEM-10020", name: "SFP Module 40G", unitPrice: "450", warehouse: "WH-LA-02", taskNumber: "TASK-020", taskName: "Network Migration", projectNumber: "PROJ-020", projectName: "Telecom Infrastructure Refresh", subInventory: "" },
  { id: "ITEM-10021", name: "Network Rack 42U", unitPrice: "1500", warehouse: "WH-21", taskNumber: "TASK-021", taskName: "WAN Integration", projectNumber: "PROJ-021", projectName: "Fiber Capacity Expansion", subInventory: "" },
  { id: "ITEM-10022", name: "Network Rack 24U", unitPrice: "900", warehouse: "WH-22", taskNumber: "TASK-022", taskName: "SD-WAN Configuration", projectNumber: "PROJ-022", projectName: "Network Monitoring Upgrade", subInventory: "" },
  { id: "ITEM-10023", name: "UPS 3KVA", unitPrice: "1800", warehouse: "WH-23", taskNumber: "TASK-023", taskName: "MPLS Testing", projectNumber: "PROJ-023", projectName: "NOC Modernization", subInventory: "" },
  { id: "ITEM-10024", name: "UPS 5KVA", unitPrice: "2600", warehouse: "WH-24", taskNumber: "TASK-024", taskName: "Cloud Connectivity Setup", projectNumber: "PROJ-024", projectName: "Server Infrastructure Upgrade", subInventory: "" },
  { id: "ITEM-10025", name: "UPS 10KVA", unitPrice: "4800", warehouse: "WH-25", taskNumber: "TASK-025", taskName: "VPN Configuration", projectNumber: "PROJ-025", projectName: "Storage Expansion Initiative", subInventory: "" },
  { id: "ITEM-10026", name: "Server Dell R760", unitPrice: "8500", warehouse: "WH-26", taskNumber: "TASK-026", taskName: "Monitoring Tool Setup", projectNumber: "PROJ-026", projectName: "Cloud Security Enhancement", subInventory: "" },
  { id: "ITEM-10027", name: "Server HPE DL380", unitPrice: "9200", warehouse: "WH-27", taskNumber: "TASK-027", taskName: "Alert Configuration", projectNumber: "PROJ-027", projectName: "Network Segmentation Project", subInventory: "" },
  { id: "ITEM-10028", name: "SSD 1TB Enterprise", unitPrice: "250", warehouse: "WH-28", taskNumber: "TASK-028", taskName: "Performance Testing", projectNumber: "PROJ-028", projectName: "Access Layer Refresh", subInventory: "" },
  { id: "ITEM-10029", name: "SSD 2TB Enterprise", unitPrice: "450", warehouse: "WH-29", taskNumber: "TASK-029", taskName: "Disaster Recovery Testing", projectNumber: "PROJ-029", projectName: "Backbone Router Upgrade", subInventory: "" },
  { id: "ITEM-10030", name: "RAM 32GB ECC", unitPrice: "180", warehouse: "WH-30", taskNumber: "TASK-030", taskName: "Compliance Validation", projectNumber: "PROJ-030", projectName: "Critical Site Redundancy", subInventory: "" },
  { id: "ITEM-10031", name: "RAM 64GB ECC", unitPrice: "320", warehouse: "WH-31", taskNumber: "TASK-031", taskName: "Documentation Update", projectNumber: "PROJ-031", projectName: "Carrier Network Enhancement", subInventory: "" },
  { id: "ITEM-10032", name: "Firewall Appliance A", unitPrice: "3500", warehouse: "WH-32", taskNumber: "TASK-032", taskName: "User Acceptance Testing", projectNumber: "PROJ-032", projectName: "Customer Edge Upgrade", subInventory: "" },
  { id: "ITEM-10033", name: "Firewall Appliance B", unitPrice: "4200", warehouse: "WH-33", taskNumber: "TASK-033", taskName: "Change Management", projectNumber: "PROJ-033", projectName: "Data Analytics Infrastructure", subInventory: "" },
  { id: "ITEM-10034", name: "Optical Transceiver A", unitPrice: "280", warehouse: "WH-34", taskNumber: "TASK-034", taskName: "Cutover Planning", projectNumber: "PROJ-034", projectName: "Fiber Ring Deployment", subInventory: "" },
  { id: "ITEM-10035", name: "Optical Transceiver B", unitPrice: "450", warehouse: "WH-35", taskNumber: "TASK-035", taskName: "Production Deployment", projectNumber: "PROJ-035", projectName: "Network Resiliency Program", subInventory: "" },
  { id: "ITEM-10036", name: "Patch Cord CAT6", unitPrice: "15", warehouse: "WH-36", taskNumber: "TASK-036", taskName: "Post Deployment Validation", projectNumber: "PROJ-036", projectName: "Smart Operations Initiative", subInventory: "" },
  { id: "ITEM-10037", name: "Patch Cord CAT6A", unitPrice: "25", warehouse: "WH-37", taskNumber: "TASK-037", taskName: "Network Optimization", projectNumber: "PROJ-037", projectName: "IPv6 Migration Program", subInventory: "" },
  { id: "ITEM-10038", name: "Network Tester Kit", unitPrice: "950", warehouse: "WH-38", taskNumber: "TASK-038", taskName: "Capacity Planning", projectNumber: "PROJ-038", projectName: "Security Operations Center Upgrade", subInventory: "" },
  { id: "ITEM-10039", name: "Rack PDU", unitPrice: "180", warehouse: "WH-39", taskNumber: "TASK-039", taskName: "Final Audit", projectNumber: "PROJ-039", projectName: "Enterprise Infrastructure Refresh", subInventory: "" },
  { id: "ITEM-10040", name: "Cable Management Kit", unitPrice: "90", warehouse: "WH-40", taskNumber: "TASK-040", taskName: "Project Closure", projectNumber: "PROJ-040", projectName: "Strategic Technology Modernization", subInventory: "" },
];
const toOptions = (values: string[]) => Array.from(new Set(values.filter(Boolean))).map(value => ({ label: value, value }));
const warehouseOptions = toOptions(itemMasterData.map(item => item.warehouse));

const TypewriterText = ({ text = "", animate, onTick, onDone }: { text?: string; animate?: boolean; onTick?: () => void; onDone?: () => void }) => {
  const [visibleText, setVisibleText] = useState(animate ? "" : text);
  useEffect(() => {
    if (!animate) {
      setVisibleText(text);
      return;
    }

    let index = 0;
    let cancelled = false;
    setVisibleText("");

    const interval = window.setInterval(() => {
      if (cancelled) return;
      index += 1;
      setVisibleText(text.slice(0, index));
      onTick?.();

      if (index >= text.length) {
        window.clearInterval(interval);
        onDone?.();
      }
    }, 18);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [text, animate]);

  return (
    <>
      {visibleText}
      {animate && visibleText.length < text.length && <span style={{ opacity: 0.65 }}> |</span>}
    </>
  );
};
const samplePurchaseRequests = [
  { id: "Purchase Requisition 2024-001", type: "Inventory", item: "Laptop Dell XPS", status: "Approved", date: "2024-06-01", amount: "$1,200" },
  { id: "Purchase Requisition 2024-002", type: "Expense", item: "Office Supplies", status: "Pending", date: "2024-06-10", amount: "$450" },
  { id: "Purchase Requisition 2024-003", type: "Inventory", item: "Network Switch", status: "Rejected", date: "2024-06-15", amount: "$800" },
];

const pendingApprovals = [
  { id: "Purchase Requisition 2024-004", requestedBy: "John Smith", type: "Inventory", item: "Server Rack", amount: "$3,500", date: "2024-06-20" },
  { id: "Purchase Requisition 2024-005", requestedBy: "Sarah Lee", type: "Expense", item: "Training Materials", amount: "$250", date: "2024-06-22" },
];

const themePalettes = {
  dark: {
    orange: "#e87722",
    navy: "#0f2d48",
    dark: "#0a1520",
    mid: "#0f2236",
    card: "#132030",
    border: "#1a3040",
    text: "#ccd6e0",
    subtle: "#88aabb",
    good: "#2ecc71",
    warn: "#f39c12",
    danger: "#e74c3c",
    white: "#ffffff",
    shadow: "rgba(0, 0, 0, 0.28)",
  },
  light: {
    orange: "#e87722",
    navy: "#ffffff",
    dark: "#f4f7fb",
    mid: "#ffffff",
    card: "#f8fbff",
    border: "#d8e1ea",
    text: "#233142",
    subtle: "#617287",
    good: "#198754",
    warn: "#b26a00",
    danger: "#c0392b",
    white: "#102033",
    shadow: "rgba(15, 45, 72, 0.12)",
  },
  contrast: {
    orange: "#e87722",
    navy: "#0f2d48",
    dark: "#08111b",
    mid: "#102941",
    card: "#143653",
    border: "#2f5c7d",
    text: "#f3f8fc",
    subtle: "#b6c9d8",
    good: "#2ecc71",
    warn: "#f39c12",
    danger: "#e74c3c",
    white: "#ffffff",
    shadow: "rgba(0, 0, 0, 0.35)",
  },
};

const inventorySteps = [
  { field: "item_search", label: "Item", type: "search", message: "Let's find the item you need. Search by item name or item number:", placeholder: "Type to search items..." },
  { field: "shippingToWarehouse", label: "Shipping", type: "options", message: "Is this request shipping to a warehouse location? Please answer Yes or No.", options: [{ label: "Yes", value: "yes" }, { label: "No", value: "no" }] },
  { field: "warehouse", label: "Warehouse", type: "select", message: "Please select or provide the warehouse location.", options: warehouseOptions, placeholder: "Type a warehouse location manually" },
  { field: "shipToLocation", label: "Ship-To", type: "text", message: "Please enter the ship-to location.", placeholder: "e.g. 1800 Larimer Street, Denver" },
  { field: "quantity", label: "Quantity", type: "number", message: "Please enter the required quantity.", placeholder: "e.g. 3" },
  { field: "deliveryDate", label: "Delivery", type: "date", message: "Please enter the requested delivery date in YYYY-MM-DD format.", placeholder: "" },
  { field: "subInventory", label: "Inventory", type: "options", message: "Please enter the sub-inventory type: General or Critical.", options: [{ label: "General", value: "general_inventory" }, { label: "Critical", value: "critical_spare" }] },
  { field: "coding", label: "Coding", type: "text", message: "Please enter the project code and task number, for example PROJ-001 and TASK-001, or type skip.", placeholder: "e.g. PROJ-001 TASK-001" },
  { field: "acknowledged", label: "Confirm", type: "acknowledge", message: "Please confirm acknowledgment to continue." },
];

const expenseSteps = [
  { field: "description", label: "Details", type: "text", message: "Describe what you want to purchase:", placeholder: "e.g. 10 office chairs for new hires" },
  { field: "goodsOrServices", label: "Type", type: "options", message: "Is this for goods or services?", options: [{ label: "Goods", value: "goods" }, { label: "Services", value: "services" }] },
  { field: "category", label: "Category", type: "options", message: "Select a category:", options: [{ label: "Information Technology and Technology", value: "it" }, { label: "Office Supplies", value: "office" }, { label: "Maintenance", value: "maintenance" }, { label: "Consulting", value: "consulting" }, { label: "Travel", value: "travel" }, { label: "Other", value: "other" }] },
  { field: "deliveryDate", label: "Delivery", type: "date", message: "When do you need it?", placeholder: "" },
  { field: "approvedSupplier", label: "Supplier", type: "text", message: "Who is the approved supplier?", placeholder: "e.g. TechCorp Incorporated" },
  { field: "quantity", label: "Quantity", type: "number", message: "Quantity needed?", placeholder: "e.g. 10" },
  { field: "price", label: "Price", type: "number", message: "Unit price ($)?", placeholder: "e.g. 50.00" },
  { field: "projectNumber", label: "Project", type: "text", message: "Project number? (optional)", placeholder: "e.g. Project 2024-001" },
  { field: "taskNumber", label: "Task", type: "text", message: "Task number? (optional)", placeholder: "e.g. Task 001" },
  { field: "emergencyRestoration", label: "Emergency", type: "options", message: "Emergency restoration request?", options: [{ label: "Yes - Emergency", value: "yes" }, { label: "No - Standard", value: "no" }] },
  { field: "acknowledged", label: "Confirm", type: "acknowledge", message: "Almost done. Please acknowledge:" },
];


export default function App() {
  const [themeMode, setThemeMode] = useState<ThemeMode>("dark");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const C = themePalettes[themeMode];
  const [screen, setScreen] = useState<Screen>("home");
  const [messages, setMessages] = useState<Message[]>([]);
  const [purchaseRequests, setPurchaseRequests] = useState(samplePurchaseRequests);
  const [purchaseRequestType, setPurchaseRequestType] = useState<PurchaseRequestType>(null);
  const [purchaseRequestData, setPurchaseRequestData] = useState<any>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const messagesScrollRef = useRef<HTMLDivElement>(null);

  const themeOptions: { mode: ThemeMode; label: string }[] = [
    { mode: "dark", label: "Dark" },
    { mode: "light", label: "Light" },
    { mode: "contrast", label: "Focus" },
  ];
  const activeSteps = purchaseRequestType === "inventory" ? inventorySteps : expenseSteps;
  const hasSubmitted = messages.some(msg => msg.type === "success");
  const hasReview = messages.some(msg => msg.type === "review");
  const progressStep = hasSubmitted || hasReview ? activeSteps.length : Math.min(currentStep + 1, activeSteps.length);
  const progressPercent = purchaseRequestType ? Math.round((progressStep / activeSteps.length) * 100) : 0;
  const navigationItems: { id: Screen; label: string; icon: "home" | "current" | "requests" | "approvals" }[] = [
    { id: "home", label: "Home", icon: "home" },
    ...(purchaseRequestType ? [{ id: "chat" as const, label: "Current Purchase Requisition", icon: "current" as const }] : []),
    { id: "my-purchase-requests", label: "My Purchase Requisitions", icon: "requests" },
    { id: "approvals", label: "Approvals", icon: "approvals" },
  ];

  const bottomActionItems: { label: string; icon: "attach" | "contact" | "help" | "reset" }[] = [
    { label: "Attach Documents", icon: "attach" },
    { label: "Contact Support", icon: "contact" },
    { label: "Help Center", icon: "help" },
    { label: "Reset Proof of Concept", icon: "reset" },
  ];

  const NavIcon = ({ name, color }: { name: "home" | "current" | "requests" | "approvals" | "attach" | "contact" | "help" | "reset"; color: string }) => {
    const common = { fill: "none", stroke: color, strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
    if (name === "home") {
      return <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path {...common} d="M3 10.5 12 3l9 7.5" /><path {...common} d="M5 10v10h14V10" /><path {...common} d="M9 20v-6h6v6" /></svg>;
    }
    if (name === "requests") {
      return <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path {...common} d="M8 6h11" /><path {...common} d="M8 12h11" /><path {...common} d="M8 18h11" /><path {...common} d="M4 6h.01" /><path {...common} d="M4 12h.01" /><path {...common} d="M4 18h.01" /></svg>;
    }
    if (name === "current") {
      return <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path {...common} d="M7 3h7l4 4v14H7z" /><path {...common} d="M14 3v5h5" /><path {...common} d="M10 13h5" /><path {...common} d="M10 17h4" /></svg>;
    }
    if (name === "attach") {
      return <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path {...common} d="M21 8 10.5 18.5a5 5 0 0 1-7-7L14 1" /><path {...common} d="M17 5 6.5 15.5a2 2 0 0 0 3 3L20 8" /></svg>;
    }
    if (name === "contact") {
      return <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path {...common} d="M4 5h16v11H7l-3 3z" /><path {...common} d="M8 9h8" /><path {...common} d="M8 13h5" /></svg>;
    }
    if (name === "help") {
      return <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><circle {...common} cx="12" cy="12" r="9" /><path {...common} d="M9.5 9a2.5 2.5 0 0 1 5 0c0 2-2.5 2-2.5 4" /><path {...common} d="M12 17h.01" /></svg>;
    }
    if (name === "reset") {
      return <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path {...common} d="M20 11a8 8 0 1 0-2.34 5.66" /><path {...common} d="M20 4v7h-7" /></svg>;
    }
    return <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><circle {...common} cx="12" cy="12" r="8" /><path {...common} d="M12 7v5l3 2" /></svg>;
  };
  const Badge = ({ status }: { status: string }) => {
    const color = status === "Approved" ? C.good : status === "Pending" ? C.warn : C.danger;
    return <span style={{ background: color + "22", color, border: `1px solid ${color}44`, borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700 }}>{status}</span>;
  };

  const ThemeSwitcher = () => (
    <div style={{ display: "flex", gap: 2, background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: 3, boxShadow: `0 8px 18px ${C.shadow}` }}>
      {themeOptions.map(option => (
        <button
          key={option.mode}
          onClick={() => setThemeMode(option.mode)}
          title={`${option.label} mode`}
          style={{
            background: themeMode === option.mode ? C.orange : "transparent",
            border: "none",
            borderRadius: 6,
            color: themeMode === option.mode ? "#ffffff" : C.subtle,
            cursor: "pointer",
            fontSize: 10,
            fontWeight: 700,
            minWidth: 42,
            padding: "5px 7px",
          }}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
  const LogoMark = ({ size = 34, style = {} }: { size?: number; style?: any }) => (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "#ffffff",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        boxShadow: `0 2px 8px ${C.shadow}`,
        ...style,
      }}
    >
      <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true" focusable="false">
        <circle cx="50" cy="50" r="43" fill="#ffffff" stroke={C.orange} strokeWidth="8" />
        <path fill={C.orange} d="M27 28h45L61 40H38v10H27V28z" />
        <path fill={C.orange} d="M66 29h13v14L40 82H27z" />
        <path fill={C.orange} d="M63 59h16v17H38l12-13h13z" />
        <path fill="#ffffff" d="M64 31h7L37 77h-7z" />
      </svg>
    </div>
  );

  useEffect(() => {
    const messageContainer = messagesScrollRef.current;
    if (!messageContainer) return;

    const frame = requestAnimationFrame(() => {
      messageContainer.scrollTop = messageContainer.scrollHeight;
    });

    return () => cancelAnimationFrame(frame);
  }, [messages.length]);

  const keepMessagesAtBottom = () => {
    const messageContainer = messagesScrollRef.current;
    if (!messageContainer) return;
    requestAnimationFrame(() => {
      messageContainer.scrollTop = messageContainer.scrollHeight;
    });
  };

  const markMessageTyped = (id: string) => {
    setMessages(prev => prev.map(msg => msg.id === id ? { ...msg, animate: false } : msg));
  };

  const formatFieldLabel = (key: string) => ({
    itemMaster: "Item Number",
    itemName: "Item Name",
    unitPrice: "Price in United States Dollar",
    itemMasterNumber: "Item Number",
    item: "Item Name",
    totalAmount: "Total Cost",
    goodsOrServices: "Goods Or Services",
    description: "Description",
    category: "Category",
    price: "Price in United States Dollar",
    deliveryDate: "Delivery Date",
    approvedSupplier: "Approved Supplier",
    projectNumber: "Project Number",
    taskNumber: "Task Number",
    emergencyRestoration: "Emergency Restoration",
    shippingToWarehouse: "Shipping To Warehouse",
    shipToLocation: "Ship-To Location",
    subInventory: "Sub Inventory",
    acknowledged: "Acknowledgment",
  } as Record<string, string>)[key] || key.replace(/([A-Z])/g, " $1").replace(/^./, char => char.toUpperCase()).trim();

  const formatFieldValue = (key: string, value: any) => {
    if ((key === "unitPrice" || key === "price") && value) return String(value).startsWith("$") ? String(value) : `$${value}`;
    if (key === "subInventory" && value === "general_inventory") return "General";
    if (key === "subInventory" && value === "critical_spare") return "Critical";
    if (key === "category") {
      const categoryLabels: Record<string, string> = {
        it: "Information Technology and Technology",
        office: "Office Supplies",
        maintenance: "Maintenance",
        consulting: "Consulting",
        travel: "Travel",
        other: "Other",
      };
      return categoryLabels[String(value)] || String(value);
    }
    if (key === "emergencyRestoration") return value === "yes" ? "Yes - Emergency" : "No - Standard";
    if (key === "goodsOrServices") return value === "goods" ? "Goods" : "Services";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (value === "yes") return "Yes";
    if (value === "no") return "No";
    return String(value);
  };

  const addMessage = (msg: Omit<Message, "id">) => {
    const shouldAnimate = msg.type === "bot";
    setMessages(prev => [...prev, { ...msg, animate: msg.animate ?? shouldAnimate, id: Date.now().toString() + Math.random() }]);
  };

  const getPurchaseRequestSummary = (data: any, type: PurchaseRequestType) => {
    const quantity = Number(data.quantity || 1);
    const unitPrice = Number(type === "inventory" ? data.unitPrice : data.price);
    const amount = Number.isFinite(unitPrice) && unitPrice > 0 ? `$${(unitPrice * quantity).toLocaleString()}` : "Pending";
    return {
      item: type === "inventory" ? (data.itemName || "Inventory Purchase Requisition") : (data.description || "Expense Purchase Requisition"),
      amount,
    };
  };

  const startInquiry = (forceNew = false) => {
    if (!forceNew && messages.length > 0 && !hasSubmitted) {
      setScreen("chat");
      return;
    }

    setPurchaseRequestType(null);
    setPurchaseRequestData({});
    setCurrentStep(0);
    setMessages([]);
    setInputValue("");
    setSearchResults([]);
    setScreen("chat");

    setTimeout(() => {
      addMessage({ type: "bot", content: "Welcome. I can help you create a Purchase Requisition." });
    }, 300);

    setTimeout(() => {
      addMessage({
        type: "options",
        content: "Do you know the item number for this purchase?",
        field: "purchaseRequestInquiry",
        options: [
          { label: "Yes, I know the item number", value: "inventory" },
          { label: "No, create an expense request", value: "expense" },
        ],
      });
    }, 900);
  };

  const startChat = (type: PurchaseRequestType, forceNew = false) => {
    if (!type) return;
    if (!forceNew && purchaseRequestType === type && messages.length > 0 && !hasSubmitted) {
      setScreen("chat");
      return;
    }

    setPurchaseRequestType(type);
    setPurchaseRequestData({});
    setCurrentStep(0);
    setMessages([]);
    setInputValue("");
    setSearchResults([]);
    setScreen("chat");

    setTimeout(() => {
      addMessage({ type: "bot", content: `Let's create your ${type === "inventory" ? "Inventory" : "Expense"} Purchase Requisition.\n\nI'll guide you step by step.` });
    }, 300);

    setTimeout(() => {
      const steps = type === "inventory" ? inventorySteps : expenseSteps;
      const step: any = steps[0];
      addMessage({ type: step.type === "options" ? "options" : "input", content: step.message, field: step.field, options: step.options, inputType: step.type, placeholder: step.placeholder, searchable: step.type === "search" });
    }, 1200);
  };

  const handleUserInput = (value: string, field: string, displayValue?: string) => {
    addMessage({ type: "user", content: displayValue || value });
    if (field === "purchaseRequestInquiry") {
      setTimeout(() => startChat(value === "inventory" ? "inventory" : "expense", true), 350);
      return;
    }

    const steps = purchaseRequestType === "inventory" ? inventorySteps : expenseSteps;
    const nextStep = currentStep + 1;
    const trimmedValue = value.trim();

    const repeatCurrentStep = (message: string) => {
      addMessage({ type: "bot", content: message });
      setTimeout(() => showNextStep(currentStep, steps, purchaseRequestData), 350);
    };

    if (purchaseRequestType === "inventory") {
      if (field === "quantity" && (!trimmedValue || !Number.isFinite(Number(trimmedValue)) || Number(trimmedValue) <= 0)) {
        repeatCurrentStep("Please enter a valid quantity greater than 0.");
        return;
      }

      if (field === "deliveryDate") {
        const enteredDate = new Date(`${trimmedValue}T00:00:00`);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmedValue) || Number.isNaN(enteredDate.getTime())) {
          repeatCurrentStep("Please enter a valid date, for example 2026-07-20.");
          return;
        }
        if (enteredDate <= today) {
          repeatCurrentStep("Delivery date must be in the future.");
          return;
        }
      }

      if (field === "shipToLocation") {
        if (!trimmedValue) {
          repeatCurrentStep("Ship-to location cannot be empty.");
          return;
        }
        if (trimmedValue.length > 120) {
          repeatCurrentStep("Ship-to location is too long. Please provide a shorter location.");
          return;
        }
      }

      if (field === "coding") {
        const lowerValue = trimmedValue.toLowerCase();
        if (lowerValue === "skip") {
          const skippedData = { ...purchaseRequestData, coding: "Skipped" };
          setPurchaseRequestData(skippedData);
          setCurrentStep(nextStep);
          setInputValue("");
          setSearchResults([]);
          if (nextStep >= steps.length) { showReview(skippedData); return; }
          showNextStep(nextStep, steps, skippedData);
          return;
        }

        const projectMatch = trimmedValue.match(/\bPROJ-\d{3}\b/i);
        const taskMatch = trimmedValue.match(/\bTASK-\d{3}\b/i);
        if (/project/i.test(trimmedValue) && !projectMatch) {
          repeatCurrentStep("Invalid project code. Use format PROJ-001.");
          return;
        }
        if (/task/i.test(trimmedValue) && !taskMatch) {
          repeatCurrentStep("Invalid task number. Use format TASK-001.");
          return;
        }
        if (trimmedValue && !projectMatch && !taskMatch) {
          repeatCurrentStep("Please enter a valid project code, task number, or type skip.");
          return;
        }
        const codedData = { ...purchaseRequestData, coding: trimmedValue, projectNumber: projectMatch?.[0].toUpperCase(), taskNumber: taskMatch?.[0].toUpperCase() };
        setPurchaseRequestData(codedData);
        setCurrentStep(nextStep);
        setInputValue("");
        setSearchResults([]);
        if (nextStep >= steps.length) { showReview(codedData); return; }
        showNextStep(nextStep, steps, codedData);
        return;
      }

      if (field === "acknowledged" && !["yes", "y", "acknowledge", "i acknowledge"].includes(trimmedValue.toLowerCase())) {
        repeatCurrentStep("Acknowledgment is required. Please type Yes to confirm.");
        return;
      }
    }

    const newData = { ...purchaseRequestData, [field]: value };
    setPurchaseRequestData(newData);

    if (field === "item_search") {
      const item = itemMasterData.find(i => i.id === value);
      if (item) {
        const autoFilled = { ...newData, itemMaster: item.id, itemName: item.name, unitPrice: item.unitPrice };
        setPurchaseRequestData(autoFilled);
        setTimeout(() => {
          addMessage({ type: "bot", content: "I found the catalog item and will continue with the Inventory Purchase Requisition process." });
          addMessage({ type: "card", cardData: { title: "Item Found and Auto-Filled", facts: [
            { label: "Item Number", value: item.id },
            { label: "Item Name", value: item.name },
            { label: "Price in United States Dollar", value: `$${item.unitPrice}` },
          ].filter(f => f.value) } });
          setTimeout(() => showNextStep(nextStep, steps, autoFilled), 800);
        }, 600);
        setCurrentStep(nextStep);
        setInputValue("");
        setSearchResults([]);
        return;
      }
    }

    let nextMessageDelay = 0;

    if (purchaseRequestType === "inventory" && ["warehouse", "shipToLocation"].includes(field)) {
      addMessage({ type: "bot", content: "The inventory request is set up with the item master information and shipping location. I will now collect the remaining required details." });
      nextMessageDelay = 650;
    }

    if (["quantity", "price"].includes(field)) {
      const quantity = Number(newData.quantity);
      const unitPrice = Number(purchaseRequestType === "inventory" ? newData.unitPrice : newData.price);
      if (Number.isFinite(quantity) && quantity > 0 && Number.isFinite(unitPrice) && unitPrice > 0) {
        const totalCost = quantity * unitPrice;
        addMessage({ type: "bot", content: `Total cost is $${totalCost.toLocaleString()} based on quantity ${quantity} and unit price $${unitPrice.toLocaleString()}.`, animate: false });
        nextMessageDelay = 900;
      } else if (purchaseRequestType === "expense" && field === "quantity") {
        addMessage({ type: "bot", content: "Quantity captured. I will calculate the total cost after you enter the unit price.", animate: false });
        nextMessageDelay = 700;
      }
    }

    setCurrentStep(nextStep);
    setInputValue("");
    setSearchResults([]);

    const continueFlow = () => {
      if (nextStep >= steps.length) { showReview(newData); return; }
      showNextStep(nextStep, steps, newData);
    };

    if (nextMessageDelay > 0) {
      setTimeout(continueFlow, nextMessageDelay);
      return;
    }

    continueFlow();
  };
  const showNextStep = (stepIndex: number, steps: any[], data: any) => {
    const step = steps[stepIndex];
    if (!step) { showReview(data); return; }
    if (purchaseRequestType === "inventory" && step.field === "warehouse" && data.shippingToWarehouse !== "yes") {
      showNextStep(stepIndex + 1, steps, data);
      return;
    }
    if (purchaseRequestType === "inventory" && step.field === "shipToLocation" && data.shippingToWarehouse !== "no") {
      showNextStep(stepIndex + 1, steps, data);
      return;
    }
    setCurrentStep(stepIndex);
    setTimeout(() => {
      if (step.type === "options" || step.type === "acknowledge") {
        const opts = step.type === "acknowledge" ? [{ label: "Yes", value: "yes" }] : step.options;
        addMessage({ type: "options", content: step.message, field: step.field, options: opts });
      } else {
        addMessage({ type: "input", content: step.message, field: step.field, options: step.options, inputType: step.type, placeholder: step.placeholder, searchable: step.type === "search" });
      }
    }, 600);
  };
  const showReview = (data: any) => {
    setTimeout(() => {
      if (purchaseRequestType === "inventory") {
        const quantity = Number(data.quantity || 0);
        const unitPrice = Number(data.unitPrice || 0);
        const totalAmount = quantity > 0 && unitPrice > 0 ? `$${(quantity * unitPrice).toLocaleString()}` : "Pending";
        const reviewData = {
          itemMasterNumber: data.itemMaster,
          item: data.itemName,
          quantity: data.quantity,
          unitPrice: data.unitPrice ? `$${data.unitPrice}` : undefined,
          totalAmount,
          deliveryDate: data.deliveryDate,
          shippingToWarehouse: data.shippingToWarehouse === "yes" ? "Yes" : "No",
          warehouse: data.warehouse,
          shipToLocation: data.shipToLocation,
          subInventory: data.subInventory === "general_inventory" ? "General" : data.subInventory === "critical_spare" ? "Critical" : data.subInventory,
          projectNumber: data.projectNumber,
          taskNumber: data.taskNumber,
          acknowledgment: data.acknowledged ? "Confirmed" : undefined,
        };
        addMessage({ type: "bot", content: "The inventory Purchase Requisition draft is ready. You can submit it, or start over to edit the captured details." });
        setTimeout(() => addMessage({ type: "review", cardData: reviewData }), 800);
        return;
      }
      const quantity = Number(data.quantity || 0);
      const unitPrice = Number(data.price || 0);
      const totalAmount = quantity > 0 && unitPrice > 0 ? `$${(quantity * unitPrice).toLocaleString()}` : "Pending";
      const reviewData = { ...data, totalAmount };
      addMessage({ type: "bot", content: "All done. Here is your Purchase Requisition summary. Review and submit." });
      setTimeout(() => addMessage({ type: "review", cardData: reviewData }), 800);
    }, 600);
  };
  const handleSearch = (query: string) => {
    setInputValue(query);
    setSearchResults(query.length > 0 ? itemMasterData.filter(i => [i.name, i.id, i.warehouse, i.taskNumber, i.taskName, i.projectNumber, i.projectName].some(value => value.toLowerCase().includes(query.toLowerCase()))) : []);
  };

  const submitPurchaseRequest = () => {
    addMessage({ type: "user", content: "Submit Purchase Requisition" });
    if (purchaseRequestType === "inventory") {
      const missingFields = [];
      if (!purchaseRequestData.quantity) missingFields.push("quantity");
      if (!purchaseRequestData.deliveryDate) missingFields.push("delivery date");
      if (!purchaseRequestData.subInventory) missingFields.push("sub-inventory");
      if (!purchaseRequestData.acknowledged) missingFields.push("acknowledgment");
      if (purchaseRequestData.shippingToWarehouse === "yes" && !purchaseRequestData.warehouse) missingFields.push("warehouse location");
      if (purchaseRequestData.shippingToWarehouse === "no" && !purchaseRequestData.shipToLocation) missingFields.push("ship-to location");
      if (missingFields.length > 0) {
        addMessage({ type: "bot", content: `Missing required fields: ${missingFields.join(", ")}. Please complete the review details.` });
        return;
      }
    }
    setTimeout(() => {
      const purchaseRequestNumber = `Purchase Requisition ${Date.now().toString().slice(-6)}`;
      const summary = getPurchaseRequestSummary(purchaseRequestData, purchaseRequestType);
      setPurchaseRequests(prev => [
        {
          id: purchaseRequestNumber,
          type: purchaseRequestType === "inventory" ? "Inventory" : "Expense",
          item: summary.item,
          status: "Pending",
          date: new Date().toISOString().slice(0, 10),
          amount: summary.amount,
        },
        ...prev,
      ]);
      addMessage({ type: "success", cardData: { purchaseRequestNumber, purchaseRequestType: purchaseRequestType === "inventory" ? "Inventory Purchase Requisition" : "Expense Purchase Requisition", submittedFields: purchaseRequestData } });
    }, 1000);
  };
  const Sidebar = () => (
    <div style={{ width: isSidebarCollapsed ? 68 : 190, background: C.navy, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", flexShrink: 0, transition: "width 0.2s ease" }}>
      <div style={{ padding: isSidebarCollapsed ? "12px 10px" : "16px 14px 12px", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: isSidebarCollapsed ? "center" : "space-between", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
            <LogoMark size={36} />
            {!isSidebarCollapsed && (
              <div style={{ minWidth: 0 }}>
                <div style={{ color: C.white, fontWeight: 700, fontSize: 12, whiteSpace: "nowrap" }}>ZAYO Purchase Requisition</div>
                <div style={{ color: C.subtle, fontSize: 9 }}>Purchase Requisition</div>
              </div>
            )}
          </div>
          {!isSidebarCollapsed && (
            <button onClick={() => setIsSidebarCollapsed(true)} title="Collapse sidebar" style={{ width: 26, height: 26, background: C.card, border: `1px solid ${C.border}`, borderRadius: 6, color: C.subtle, cursor: "pointer", fontSize: 12 }}>&lt;</button>
          )}
        </div>
        {isSidebarCollapsed && (
          <button onClick={() => setIsSidebarCollapsed(false)} title="Expand sidebar" style={{ width: "100%", height: 26, marginTop: 10, background: C.card, border: `1px solid ${C.border}`, borderRadius: 6, color: C.subtle, cursor: "pointer", fontSize: 12 }}>&gt;</button>
        )}
      </div>
      <nav style={{ flex: 1, padding: "8px 0" }}>
        {navigationItems.map(item => {
          const isActive = screen === item.id;
          return (
            <div key={item.id} title={isSidebarCollapsed ? item.label : undefined} onClick={() => setScreen(item.id as Screen)} style={{ padding: isSidebarCollapsed ? "10px 0" : "9px 14px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: isSidebarCollapsed ? "center" : "flex-start", gap: 8, fontSize: 12, color: isActive ? C.white : C.subtle, background: isActive ? C.mid : "transparent", borderLeft: isActive ? `3px solid ${C.orange}` : "3px solid transparent", transition: "all 0.2s", fontWeight: isActive ? 600 : 400 }}>
              <NavIcon name={item.icon} color={isActive ? C.orange : C.subtle} />
              {!isSidebarCollapsed && item.label}
            </div>
            );
          })}
        <div style={{ padding: isSidebarCollapsed ? "14px 8px 8px" : "16px 14px 8px" }}>
          {!isSidebarCollapsed && <div style={{ fontSize: 9, color: C.subtle, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", marginBottom: 8 }}>Create Purchase Requisition</div>}
          <div title={isSidebarCollapsed ? "Create Purchase Requisition" : undefined} onClick={() => startInquiry()} style={{ padding: isSidebarCollapsed ? "8px 4px" : "8px 10px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: isSidebarCollapsed ? "center" : "flex-start", gap: 8, fontSize: isSidebarCollapsed ? 10 : 11, color: C.subtle, borderRadius: 6, marginBottom: 4, textAlign: "center" }}>
            <NavIcon name="current" color={C.subtle} />
            {!isSidebarCollapsed && "Create Purchase Requisition"}
          </div>
        </div>
      </nav>
      <div style={{ padding: "8px 0 10px", borderTop: `1px solid ${C.border}` }}>
        {bottomActionItems.map(action => (
          <div
            key={action.label}
            title={isSidebarCollapsed ? action.label : undefined}
            onClick={() => action.icon === "reset" ? window.location.reload() : window.alert(`${action.label} is available from the Purchase Requisition team.`)}
            style={{ padding: isSidebarCollapsed ? "10px 0" : "9px 14px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: isSidebarCollapsed ? "center" : "flex-start", gap: 8, fontSize: 12, color: C.subtle, background: "transparent", borderLeft: "3px solid transparent", transition: "all 0.2s", fontWeight: 400 }}
          >
            <NavIcon name={action.icon} color={C.subtle} />
            {!isSidebarCollapsed && action.label}
          </div>
        ))}
      </div>
    </div>
  );
  const HomeScreen = () => (
    <div style={{ flex: 1, padding: 24, overflowY: "auto" }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 10, color: C.orange, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 6 }}>Welcome</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: C.white, marginBottom: 4 }}>ZAYO Purchase Requisition</div>
        <div style={{ fontSize: 13, color: C.subtle }}>Create and track purchase requisitions through a guided conversation</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 14, marginBottom: 24, maxWidth: 380 }}>
        <div onClick={() => startInquiry()} style={{ background: C.mid, border: `1px solid ${C.border}`, borderRadius: 12, padding: 18, cursor: "pointer", borderTop: `3px solid ${C.orange}` }}>
          <LogoMark size={40} style={{ marginBottom: 10 }} />
          <div style={{ fontSize: 14, fontWeight: 700, color: C.white, marginBottom: 4 }}>Create Purchase Requisition</div>
          <div style={{ fontSize: 11, color: C.subtle }}>Start with a guided item number question</div>
        </div>
      </div>
      <div style={{ background: C.mid, border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden", maxWidth: 600 }}>
        <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.white }}>Recent Purchase Requisitions</div>
        </div>
        {purchaseRequests.map(pr => (
          <div key={pr.id} style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.white }}>{pr.item}</div>
              <div style={{ fontSize: 10, color: C.subtle }}>{pr.id} - {pr.type} - {pr.date}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 12, color: C.white, fontWeight: 600 }}>{pr.amount}</span>
              <Badge status={pr.status} />
              <button onClick={() => startChat(pr.type === "Inventory" ? "inventory" : "expense", true)} style={{ background: C.orange + "22", border: `1px solid ${C.orange}44`, borderRadius: 6, padding: "4px 10px", fontSize: 11, color: C.orange, cursor: "pointer", whiteSpace: "nowrap" }}>Re-initiate Purchase Requisition</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const ChatScreen = () => (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ background: C.navy, borderBottom: `2px solid ${C.orange}`, padding: "10px 16px", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <button onClick={() => setScreen("home")} style={{ background: "transparent", border: "none", color: C.subtle, cursor: "pointer", fontSize: 16 }}>Back</button>
        <LogoMark size={34} />
        <div>
          <div style={{ color: C.white, fontWeight: 700, fontSize: 13 }}>Purchase Requisition</div>
          <div style={{ color: C.good, fontSize: 9, display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 6, height: 6, borderRadius: "50%", background: C.good }} />Active</div>
        </div>
        <div style={{ marginLeft: "auto", marginRight: 150, fontSize: 10, color: C.subtle }}>{purchaseRequestType === "inventory" ? "Inventory Purchase Requisition" : purchaseRequestType === "expense" ? "Expense Purchase Requisition" : "Create Purchase Requisition"}</div>
      </div>
      {purchaseRequestType && <div style={{ background: C.mid, borderBottom: `1px solid ${C.border}`, padding: "10px 16px 16px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
          <span style={{ color: C.text, fontSize: 11, fontWeight: 700 }}>{purchaseRequestType === "inventory" ? "Inventory Purchase Requisition Progress" : "Expense Purchase Requisition Progress"}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: C.subtle, fontSize: 10 }}>{progressStep} of {activeSteps.length}</span>
            <button
              onClick={() => purchaseRequestType && startChat(purchaseRequestType, true)}
              title="Restart conversation"
              aria-label="Restart conversation"
              style={{ width: 26, height: 26, borderRadius: "50%", border: `1px solid ${C.orange}66`, background: C.orange + "18", color: C.orange, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", padding: 0 }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20 11a8 8 0 1 0-2.34 5.66" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M20 4v7h-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
        <div style={{ position: "relative", display: "grid", gridTemplateColumns: `repeat(${activeSteps.length}, minmax(24px, 1fr))`, alignItems: "center", gap: 4 }}>
          <div style={{ position: "absolute", left: 12, right: 12, top: 13, height: 3, background: C.dark, borderRadius: 999 }} />
          <div style={{ position: "absolute", left: 12, right: `${100 - progressPercent}%`, top: 13, height: 3, background: C.good, borderRadius: 999, transition: "right 0.25s ease" }} />
          {activeSteps.map((step, index) => {
            const isComplete = hasSubmitted || hasReview || index < currentStep;
            const isCurrent = !isComplete && index === Math.min(currentStep, activeSteps.length - 1);
            return (
              <div key={step.field} title={step.message} style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, minWidth: 0 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: isComplete ? C.good : isCurrent ? C.orange : C.card, border: `2px solid ${isComplete ? C.good : isCurrent ? C.orange : C.border}`, color: isComplete || isCurrent ? "#ffffff" : C.subtle, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, boxShadow: `0 4px 10px ${C.shadow}` }}>
                  {isComplete ? "\u2713" : index + 1}
                </div>
                <div style={{ color: isCurrent ? C.orange : C.subtle, fontSize: activeSteps.length > 9 ? 8 : 9, fontWeight: isCurrent ? 700 : 600, textAlign: "center", lineHeight: 1.15, maxWidth: 68, whiteSpace: "normal" }}>{step.label}</div>
              </div>
            );
          })}
        </div>
      </div>}

      <div ref={messagesScrollRef} style={{ flex: 1, overflowY: "auto", overscrollBehavior: "contain", overflowAnchor: "none", padding: "16px", display: "flex", flexDirection: "column", gap: 12 }}>
        {messages.map((msg, index) => {
          const latestUserIndex = messages.reduce((latest, message, messageIndex) => message.type === "user" ? messageIndex : latest, -1);
          const latestInteractiveIndex = messages.reduce((latest, message, messageIndex) => messageIndex > latestUserIndex && ["options", "input", "review"].includes(message.type) ? messageIndex : latest, -1);
          const isActivePrompt = index === latestInteractiveIndex;
          return (
          <div key={msg.id}>
            {msg.type === "bot" && (
              <div style={{ display: "flex", gap: 8, alignItems: "flex-start", maxWidth: "80%" }}>
                <LogoMark size={34} />
                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "4px 12px 12px 12px", padding: "10px 14px", fontSize: 13, color: C.text, lineHeight: 1.6, whiteSpace: "pre-wrap" }}><TypewriterText text={msg.content} animate={msg.animate} onTick={keepMessagesAtBottom} onDone={() => markMessageTyped(msg.id)} /></div>
              </div>
            )}

            {msg.type === "user" && (
              <div style={{ display: "flex", gap: 8, alignItems: "flex-start", maxWidth: "80%" }}>
                <LogoMark size={34} />
                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "4px 12px 12px 12px", padding: "10px 14px", fontSize: 13, color: C.text, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>You entered: {msg.content}</div>
              </div>
            )}
            {msg.type === "card" && msg.cardData && (
              <div style={{ display: "flex", gap: 8, alignItems: "flex-start", maxWidth: "85%" }}>
                <LogoMark size={34} />
                <div style={{ background: C.card, border: `1px solid ${C.good}44`, borderRadius: "4px 12px 12px 12px", overflow: "hidden", flex: 1 }}>
                  <div style={{ background: C.good + "22", padding: "8px 12px", fontSize: 11, fontWeight: 700, color: C.good }}>{msg.cardData.title}</div>
                  <div style={{ padding: "10px 12px" }}>
                    {msg.cardData.facts.map((f: any) => (
                      <div key={f.label} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: `1px solid ${C.border}`, fontSize: 12 }}>
                        <span style={{ color: C.subtle }}>{f.label}</span>
                        <span style={{ color: C.white, fontWeight: 600 }}>{f.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {msg.type === "options" && (
              <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <LogoMark size={34} />
                <div style={{ flex: 1 }}>
                  <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "4px 12px 12px 12px", padding: "10px 14px", fontSize: 13, color: C.text, marginBottom: 8, lineHeight: 1.6 }}>{msg.content}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {msg.options?.map(opt => (
                      <button key={opt.value} disabled={!isActivePrompt} onClick={() => isActivePrompt && msg.field && handleUserInput(opt.value, msg.field, `${opt.label}`)} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: "7px 14px", fontSize: 12, color: C.white, cursor: isActivePrompt ? "pointer" : "default", display: "flex", alignItems: "center", gap: 6, fontWeight: 500, opacity: isActivePrompt ? 1 : 0.45 }}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {msg.type === "input" && (
              <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <LogoMark size={34} />
                <div style={{ flex: 1 }}>
                  <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "4px 12px 12px 12px", padding: "10px 14px", fontSize: 13, color: C.text, marginBottom: 8, lineHeight: 1.6 }}>{msg.content}</div>
                  {msg.searchable ? (
                    <div style={{ position: "relative" }}>
                      <input value={isActivePrompt ? inputValue : ""} disabled={!isActivePrompt} onChange={e => isActivePrompt && handleSearch(e.target.value)} placeholder={msg.placeholder} style={{ width: "100%", background: C.card, border: `1px solid ${isActivePrompt ? C.orange : C.border}`, borderRadius: 8, padding: "9px 12px", fontSize: 13, color: C.white, outline: "none", boxSizing: "border-box", opacity: isActivePrompt ? 1 : 0.45 }} />
                      {isActivePrompt && searchResults.length > 0 && (
                        <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: C.mid, border: `1px solid ${C.border}`, borderRadius: 8, zIndex: 10, marginTop: 4 }}>
                          {searchResults.map(item => (
                            <div key={item.id} onClick={() => isActivePrompt && handleUserInput(item.id, msg.field!, item.name)} style={{ padding: "10px 12px", cursor: isActivePrompt ? "pointer" : "default", borderBottom: `1px solid ${C.border}` }}>
                              <div style={{ fontSize: 12, fontWeight: 600, color: C.white }}>{item.name}</div>
                              <div style={{ fontSize: 10, color: C.subtle }}>{item.id} - ${item.unitPrice} - {item.warehouse}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>                  ) : msg.inputType === "select" ? (
                    <div style={{ display: "grid", gap: 8 }}>
                      <select defaultValue="" disabled={!isActivePrompt} onChange={e => { if (!isActivePrompt || !e.target.value || !msg.field) return; const selectedLabel = msg.options?.find(option => option.value === e.target.value)?.label || e.target.value; handleUserInput(e.target.value, msg.field, selectedLabel); }} style={{ width: "100%", background: C.card, border: `1px solid ${isActivePrompt ? C.orange : C.border}`, borderRadius: 8, padding: "9px 12px", fontSize: 13, color: C.white, outline: "none", opacity: isActivePrompt ? 1 : 0.45 }}>
                        <option value="" disabled>Select an option</option>
                        {msg.options?.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                      </select>
                      <input
                        placeholder={msg.placeholder}
                        disabled={!isActivePrompt}
                        onKeyDown={e => {
                          if (isActivePrompt && e.key === "Enter") {
                            const val = (e.target as HTMLInputElement).value;
                            if (val && msg.field) { handleUserInput(val, msg.field); (e.target as HTMLInputElement).value = ""; }
                          }
                        }}
                        style={{ width: "100%", background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 12px", fontSize: 13, color: C.white, outline: "none", boxSizing: "border-box", opacity: isActivePrompt ? 1 : 0.45 }}
                      />
                    </div>                  ) : msg.inputType === "date" ? (
                    <input type="date" disabled={!isActivePrompt} onChange={e => isActivePrompt && msg.field && handleUserInput(e.target.value, msg.field)} style={{ background: C.card, border: `1px solid ${isActivePrompt ? C.orange : C.border}`, borderRadius: 8, padding: "9px 12px", fontSize: 13, color: C.white, outline: "none", opacity: isActivePrompt ? 1 : 0.45 }} />
                  ) : (
                    <div style={{ display: "flex", gap: 8 }}>
                      <input
                        type={msg.inputType || "text"}
                        placeholder={msg.placeholder}
                        onKeyDown={e => {
                          if (isActivePrompt && e.key === "Enter") {
                            const val = (e.target as HTMLInputElement).value;
                            if (val && msg.field) { handleUserInput(val, msg.field); (e.target as HTMLInputElement).value = ""; }
                          }
                        }}
                        disabled={!isActivePrompt}
                        style={{ flex: 1, background: C.card, border: `1px solid ${isActivePrompt ? C.orange : C.border}`, borderRadius: 8, padding: "9px 12px", fontSize: 13, color: C.white, outline: "none", opacity: isActivePrompt ? 1 : 0.45 }}
                      />
                      {msg.content?.includes("optional") && (
                        <button disabled={!isActivePrompt} onClick={() => isActivePrompt && msg.field && handleUserInput("-", msg.field, "Skip")} style={{ background: C.mid, border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 14px", fontSize: 12, color: C.subtle, cursor: isActivePrompt ? "pointer" : "default", opacity: isActivePrompt ? 1 : 0.45 }}>Skip</button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {msg.type === "review" && msg.cardData && (
              <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <LogoMark size={34} />
                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "4px 12px 12px 12px", overflow: "hidden", flex: 1, maxWidth: "85%" }}>
                  <div style={{ background: C.navy, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.white }}>Purchase Requisition Summary</div>
                    <span style={{ background: C.warn + "22", color: C.warn, fontSize: 10, padding: "2px 8px", borderRadius: 10 }}>Draft</span>
                  </div>
                  <div style={{ padding: "12px 14px" }}>
                    {Object.entries(msg.cardData).filter(([key, value]) => ["item", "description", "quantity", "totalAmount"].includes(key) && value && value !== "-").map(([key, val]) => (
                      <div key={key} style={{ display: "flex", justifyContent: "space-between", gap: 16, padding: "5px 0", borderBottom: `1px solid ${C.border}`, fontSize: 12 }}>
                        <span style={{ color: C.subtle }}>{formatFieldLabel(key)}</span>
                        <span style={{ color: C.white, fontWeight: 500, textAlign: "right" }}>{formatFieldValue(key, val)}</span>
                      </div>
                    ))}
                    <details style={{ marginTop: 8 }}>
                      <summary style={{ color: C.orange, cursor: "pointer", fontSize: 12, fontWeight: 700, listStyle: "none", textDecoration: "underline", textUnderlineOffset: 3 }}>View All Details</summary>
                      <div style={{ marginTop: 8, borderTop: `1px solid ${C.border}` }}>
                        {Object.entries(msg.cardData).filter(([, value]) => value && value !== "-").map(([key, val]) => (
                          <div key={key} style={{ display: "flex", justifyContent: "space-between", gap: 16, padding: "5px 0", borderBottom: `1px solid ${C.border}`, fontSize: 11 }}>
                            <span style={{ color: C.subtle }}>{formatFieldLabel(key)}</span>
                            <span style={{ color: C.white, fontWeight: 500, textAlign: "right" }}>{formatFieldValue(key, val)}</span>
                          </div>
                        ))}
                      </div>
                    </details>
                  </div>
                  <div style={{ padding: "10px 14px", display: "flex", gap: 8, borderTop: `1px solid ${C.border}` }}>
                    <button disabled={!isActivePrompt} onClick={submitPurchaseRequest} style={{ flex: 1, background: C.good, border: "none", borderRadius: 8, padding: "10px", fontSize: 13, fontWeight: 700, color: C.white, cursor: isActivePrompt ? "pointer" : "default", opacity: isActivePrompt ? 1 : 0.45 }}>Submit Purchase Requisition</button>
                    <button onClick={() => purchaseRequestType ? startChat(purchaseRequestType, true) : startInquiry(true)} style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", fontSize: 12, color: C.subtle, cursor: "pointer" }}>Start Over</button>
                  </div>
                </div>
              </div>
            )}

            {msg.type === "success" && msg.cardData && (
              <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <LogoMark size={34} />
                <div style={{ background: C.card, border: `1px solid ${C.good}44`, borderRadius: "4px 12px 12px 12px", overflow: "hidden", maxWidth: "85%", width: "min(100%, 520px)" }}>
                  <div style={{ background: C.good + "22", padding: "16px 14px", textAlign: "center" }}>
                    <LogoMark size={62} style={{ marginBottom: 8 }} />
                    <div style={{ fontSize: 16, fontWeight: 700, color: C.good }}>Purchase Requisition Submitted Successfully!</div>
                  </div>
                  <div style={{ padding: 14 }}>
                    {[{ label: "Purchase Requisition Number", value: msg.cardData.purchaseRequestNumber }, { label: "Purchase Requisition Type", value: msg.cardData.purchaseRequestType }, { label: "Status", value: "Pending Approval" }, { label: "Submitted", value: new Date().toLocaleDateString() }].map(f => (
                      <div key={f.label} style={{ display: "flex", justifyContent: "space-between", gap: 16, padding: "6px 0", borderBottom: `1px solid ${C.border}`, fontSize: 12 }}>
                        <span style={{ color: C.subtle }}>{f.label}</span>
                        <span style={{ color: C.white, fontWeight: 600, textAlign: "right" }}>{f.value}</span>
                      </div>
                    ))}
                    <details style={{ marginTop: 10, border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden" }}>
                      <summary style={{ padding: "9px 12px", color: C.orange, cursor: "pointer", fontSize: 12, fontWeight: 700, background: C.mid }}>View All Fields</summary>
                      <div style={{ padding: "8px 12px" }}>
                        {Object.entries(msg.cardData.submittedFields || {}).filter(([, value]) => value && value !== "-").map(([key, value]) => (
                          <div key={key} style={{ display: "flex", justifyContent: "space-between", gap: 16, padding: "5px 0", borderBottom: `1px solid ${C.border}`, fontSize: 11 }}>
                            <span style={{ color: C.subtle }}>{formatFieldLabel(key)}</span>
                            <span style={{ color: C.white, fontWeight: 600, textAlign: "right" }}>{formatFieldValue(key, value)}</span>
                          </div>
                        ))}
                      </div>
                    </details>
                    <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                      <button onClick={() => setScreen("my-purchase-requests")} style={{ flex: 1, background: C.mid, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px", fontSize: 12, color: C.white, cursor: "pointer" }}>View My Purchase Requisitions</button>
                      <button onClick={() => startInquiry(true)} style={{ flex: 1, background: C.orange, border: "none", borderRadius: 8, padding: "8px", fontSize: 12, color: "#ffffff", cursor: "pointer", fontWeight: 600 }}>New Purchase Requisition</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          );
        })}
      </div>
    </div>
  );

  const MyPurchaseRequestsScreen = () => (
    <div style={{ flex: 1, padding: 24, overflowY: "auto" }}>
      <div style={{ fontSize: 20, fontWeight: 700, color: C.white, marginBottom: 16 }}>My Purchase Requisitions</div>
      <div style={{ background: C.mid, border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden" }}>
        {purchaseRequests.map(pr => (
          <div key={pr.id} style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.white }}>{pr.item}</div>
              <div style={{ fontSize: 10, color: C.subtle }}>{pr.id} - {pr.type} - {pr.date}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 13, color: C.white, fontWeight: 600 }}>{pr.amount}</span>
              <Badge status={pr.status} />
              <button onClick={() => startChat(pr.type === "Inventory" ? "inventory" : "expense", true)} style={{ background: C.orange + "22", border: `1px solid ${C.orange}44`, borderRadius: 6, padding: "4px 10px", fontSize: 11, color: C.orange, cursor: "pointer" }}>Re-initiate Purchase Requisition</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const ApprovalsScreen = () => (
    <div style={{ flex: 1, padding: 24, overflowY: "auto" }}>
      <div style={{ fontSize: 20, fontWeight: 700, color: C.white, marginBottom: 16 }}>Pending Approvals</div>
      {pendingApprovals.map(pr => (
        <div key={pr.id} style={{ background: C.mid, border: `1px solid ${C.border}`, borderRadius: 10, padding: 16, marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.white }}>{pr.item}</div>
              <div style={{ fontSize: 11, color: C.subtle }}>{pr.id} - {pr.requestedBy} - {pr.date}</div>
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.white }}>{pr.amount}</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={{ background: C.good + "22", border: `1px solid ${C.good}`, borderRadius: 8, padding: "7px 14px", fontSize: 12, color: C.good, cursor: "pointer", fontWeight: 600 }}>Approve</button>
            <button style={{ background: C.danger + "22", border: `1px solid ${C.danger}`, borderRadius: 8, padding: "7px 14px", fontSize: 12, color: C.danger, cursor: "pointer", fontWeight: 600 }}>Reject</button>
            <button style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 8, padding: "7px 14px", fontSize: 12, color: C.subtle, cursor: "pointer" }}>View Details</button>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", background: C.dark, height: "100vh", display: "flex", overflow: "hidden", position: "relative" }}>
      <style>{`
        @keyframes bounce { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-6px); } }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(1); }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1a3040; border-radius: 2px; }
      `}</style>
      <Sidebar />
      <div style={{ position: "absolute", top: 10, right: 14, zIndex: 20 }}><ThemeSwitcher /></div>
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {screen === "home" && <HomeScreen />}
        {screen === "chat" && <ChatScreen />}
        {screen === "my-purchase-requests" && <MyPurchaseRequestsScreen />}
        {screen === "approvals" && <ApprovalsScreen />}
      </div>
    </div>
  );
}























































